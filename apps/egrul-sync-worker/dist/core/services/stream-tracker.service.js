"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamTracker = void 0;
const constants_1 = require("../../config/constants");
/**
 * Сервис для отслеживания прогресса чтения потока
 */
class StreamTracker {
    progress;
    constructor(progress) {
        this.progress = progress;
    }
    /**
     * Обрабатывает прогресс для заданной строки
     */
    async handleLine(lineNumber) {
        if (lineNumber % constants_1.PROGRESS_REPORT_INTERVAL === 0) {
            console.log(`[Stream Tracker] Scanned ${lineNumber.toLocaleString()} lines...`);
            if (lineNumber % constants_1.PROGRESS_MAJOR_REPORT_INTERVAL === 0) {
                await this.progress.report(this.progress.createState('running', undefined, // Не указываем процент - неизвестно когда конец
                `Чтение потока: ${lineNumber.toLocaleString()} строк...`, lineNumber // Передаём количество строк для UI
                ));
            }
        }
    }
}
exports.StreamTracker = StreamTracker;
