"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaDataAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Адаптер для DaData API
 */
class DaDataAdapter {
    apiKey;
    timeout;
    baseUrl = 'https://suggestions.googleapis.com/suggests/api/4_1/rs';
    constructor(apiKey, timeout = 5000) {
        this.apiKey = apiKey;
        this.timeout = timeout;
        if (!apiKey) {
            throw new Error('DaData API key is required');
        }
    }
    /**
     * Ищет информацию по ИНН физического лица
     */
    async lookupPersonByInn(inn) {
        if (!inn || !this.isValidInn(inn)) {
            return null;
        }
        try {
            const data = await this.fetchInnData(inn);
            return this.parseInnData(data, inn);
        }
        catch (error) {
            this.handleRequestError(error, inn);
            return null;
        }
    }
    /**
     * Пакетный поиск по нескольким ИНН
     */
    async lookupMultipleInns(inns, batchSize = 5) {
        const results = new Map();
        for (let i = 0; i < inns.length; i += batchSize) {
            const batch = inns.slice(i, i + batchSize);
            const promises = batch.map((inn) => this.lookupPersonByInn(inn));
            try {
                const batchResults = await Promise.all(promises);
                for (let j = 0; j < batch.length; j++) {
                    const result = batchResults[j];
                    if (result) {
                        results.set(batch[j], result);
                    }
                }
            }
            catch {
                continue;
            }
            if (i + batchSize < inns.length) {
                await this.sleep(100);
            }
        }
        return results;
    }
    /**
     * Выполняет HTTP запрос к DaData API
     */
    async fetchInnData(inn) {
        const response = await axios_1.default.post(`${this.baseUrl}/findById/fns`, { query: inn, count: 1 }, {
            headers: {
                'Authorization': `Token ${this.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: this.timeout
        });
        return response.data;
    }
    /**
     * Парсит ответ от DaData
     */
    parseInnData(data, fallbackInn) {
        const suggestions = data?.suggestions;
        if (!suggestions || suggestions.length === 0) {
            return null;
        }
        const first = suggestions[0];
        const record = first.data;
        if (!record) {
            return null;
        }
        const isPerson = record.type === 'INDIVIDUAL' || record.type === 'INDIVIDUAL_ENTREPRENEUR';
        if (!isPerson) {
            return null;
        }
        return {
            inn: record.inn || fallbackInn,
            fio: this.extractFio(record),
            type: 'PERSON',
            raw: record
        };
    }
    /**
     * Извлекает ФИО из данных DaData
     */
    extractFio(data) {
        if (!data || typeof data !== 'object') {
            return null;
        }
        const d = data;
        if (typeof d.name === 'string' && d.name) {
            return d.name;
        }
        if (typeof d.fio === 'object' && d.fio) {
            const fio = d.fio;
            const parts = [fio.surname, fio.name, fio.patronymic].filter(Boolean);
            if (parts.length > 0) {
                return parts.join(' ');
            }
        }
        if (typeof d.unrestricted_value === 'string' && d.unrestricted_value) {
            return d.unrestricted_value;
        }
        return null;
    }
    /**
     * Проверяет валидность ИНН
     */
    isValidInn(inn) {
        const digits = inn.replace(/\D/g, '');
        return digits.length === 10 || digits.length === 12;
    }
    /**
     * Обрабатывает ошибки HTTP запроса
     */
    handleRequestError(error, inn) {
        if (!axios_1.default.isAxiosError(error)) {
            return;
        }
        const status = error.response?.status;
        if (status === 401) {
            console.error('DaData API: Unauthorized - check API key');
        }
        else if (status === 402) {
            console.error('DaData API: Payment required - check balance');
        }
        else if (error.code === 'ECONNABORTED') {
            console.warn(`DaData API timeout for INN ${inn}`);
        }
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.DaDataAdapter = DaDataAdapter;
