"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_SANCTION_TOPICS = exports.SanctionTopic = void 0;
exports.isValidSanctionTopic = isValidSanctionTopic;
/**
 * Перечисление всех санкционных topics из OpenSanctions
 *
 * Источник: https://www.opensanctions.org/topics/
 * OpenSanctions использует систему тегов для классификации сущностей
 * по различным признакам: санкции, политические связи, криминал и т.д.
 *
 * @see https://www.opensanctions.org/docs/topics/
 */
var SanctionTopic;
(function (SanctionTopic) {
    // === Санкции ===
    /**
     * Непосредственные санкции
     * Сущность находится под санкциями (EU, US, UN и др.)
     */
    SanctionTopic["SANCTION"] = "sanction";
    /**
     * Связь с санкционными лицами
     * Сущность связана с подконтрольными/санкционными лицами
     */
    SanctionTopic["SANCTION_LINKED"] = "sanction.linked";
    /**
     * Санкции США (OFAC)
     */
    SanctionTopic["SANCTION_US_OFAC"] = "sanction.us.ofac";
    /**
     * Санкции Евросоюза
     */
    SanctionTopic["SANCTION_EU"] = "sanction.eu";
    /**
     * Санкции Великобритании
     */
    SanctionTopic["SANCTION_UK"] = "sanction.uk";
    /**
     * Санкции ООН
     */
    SanctionTopic["SANCTION_UN"] = "sanction.un";
    /**
     * Секторальные санкции
     */
    SanctionTopic["SANCTION_SEC"] = "sanction.sec";
    // === Политические / PEP ===
    /**
     * Публичное должностное лицо (PEP)
     * Лица с публичными функциями согласно FATF
     */
    SanctionTopic["ROLE_PEP"] = "role.pep";
    /**
     * Близкий родственник PEP (RCA)
     * Семья или близкие ассоциированные лица PEP
     */
    SanctionTopic["ROLE_RCA"] = "role.rca";
    /**
     * Государственный служащий
     */
    SanctionTopic["ROLE_GOV"] = "role.gov";
    /**
     * Политик
     */
    SanctionTopic["ROLE_POLITICIAN"] = "role.politician";
    /**
     * Дипломат
     */
    SanctionTopic["ROLE_DIPLOMAT"] = "role.diplomat";
    /**
     * Военный / силовые структуры
     */
    SanctionTopic["ROLE_MILITARY"] = "role.military";
    /**
     * Государственная собственность
     */
    SanctionTopic["ROLE_OWNER_STATE"] = "role.owner.state";
    // === Криминал ===
    /**
     * Мошенничество
     */
    SanctionTopic["CRIME_FRAUD"] = "crime.fraud";
    /**
     * Коррупция
     */
    SanctionTopic["CRIME_CORRUPTION"] = "crime.corruption";
    /**
     * Отмывание денег
     */
    SanctionTopic["CRIME_MONEY_LAUNDERING"] = "crime.money_laundering";
    /**
     * Налоговое мошенничество
     */
    SanctionTopic["CRIME_TAX_FRAUD"] = "crime.tax_fraud";
    /**
     * Киберпреступность
     */
    SanctionTopic["CRIME_CYBER"] = "crime.cyber";
    /**
     * Терроризм
     */
    SanctionTopic["CRIME_TERROR"] = "crime.terror";
    /**
     * Торговля людьми
     */
    SanctionTopic["CRIME_HUMAN"] = "crime.human";
    /**
     * Наркотрафик
     */
    SanctionTopic["CRIME_DRUGS"] = "crime.drugs";
    /**
     * Организованная преступность
     */
    SanctionTopic["CRIME_ORGANIZED"] = "crime.organized";
    /**
     * Финансирование запрещённых деятельностей
     */
    SanctionTopic["FINANCING_FIRED"] = "financing.fired";
    /**
     * Финансирование терроризма
     */
    SanctionTopic["FINANCING_TERROR"] = "financing.terror";
    // === Специальные метки ===
    /**
     * Вынужденная мера (conscript)
     */
    SanctionTopic["SPECIAL_CONSCRIPT"] = "special.conscript";
    /**
     * Посредник (facilitator)
     */
    SanctionTopic["SPECIAL_FACILITATOR"] = "special.facilitator";
    /**
     * Мёртвая душа / неактивная сущность
     */
    SanctionTopic["SPECIAL_INACTIVE"] = "special.inactive";
})(SanctionTopic || (exports.SanctionTopic = SanctionTopic = {}));
/**
 * Все возможные значения topics
 * Используется для валидации и итерации
 */
exports.ALL_SANCTION_TOPICS = Object.values(SanctionTopic);
/**
 * Проверяет является ли строка валидным SanctionTopic
 */
function isValidSanctionTopic(value) {
    return exports.ALL_SANCTION_TOPICS.includes(value);
}
