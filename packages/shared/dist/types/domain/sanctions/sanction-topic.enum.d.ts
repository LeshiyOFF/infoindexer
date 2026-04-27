/**
 * Перечисление всех санкционных topics из OpenSanctions
 *
 * Источник: https://www.opensanctions.org/topics/
 * OpenSanctions использует систему тегов для классификации сущностей
 * по различным признакам: санкции, политические связи, криминал и т.д.
 *
 * @see https://www.opensanctions.org/docs/topics/
 */
export declare enum SanctionTopic {
    /**
     * Непосредственные санкции
     * Сущность находится под санкциями (EU, US, UN и др.)
     */
    SANCTION = "sanction",
    /**
     * Связь с санкционными лицами
     * Сущность связана с подконтрольными/санкционными лицами
     */
    SANCTION_LINKED = "sanction.linked",
    /**
     * Санкции США (OFAC)
     */
    SANCTION_US_OFAC = "sanction.us.ofac",
    /**
     * Санкции Евросоюза
     */
    SANCTION_EU = "sanction.eu",
    /**
     * Санкции Великобритании
     */
    SANCTION_UK = "sanction.uk",
    /**
     * Санкции ООН
     */
    SANCTION_UN = "sanction.un",
    /**
     * Секторальные санкции
     */
    SANCTION_SEC = "sanction.sec",
    /**
     * Публичное должностное лицо (PEP)
     * Лица с публичными функциями согласно FATF
     */
    ROLE_PEP = "role.pep",
    /**
     * Близкий родственник PEP (RCA)
     * Семья или близкие ассоциированные лица PEP
     */
    ROLE_RCA = "role.rca",
    /**
     * Государственный служащий
     */
    ROLE_GOV = "role.gov",
    /**
     * Политик
     */
    ROLE_POLITICIAN = "role.politician",
    /**
     * Дипломат
     */
    ROLE_DIPLOMAT = "role.diplomat",
    /**
     * Военный / силовые структуры
     */
    ROLE_MILITARY = "role.military",
    /**
     * Государственная собственность
     */
    ROLE_OWNER_STATE = "role.owner.state",
    /**
     * Мошенничество
     */
    CRIME_FRAUD = "crime.fraud",
    /**
     * Коррупция
     */
    CRIME_CORRUPTION = "crime.corruption",
    /**
     * Отмывание денег
     */
    CRIME_MONEY_LAUNDERING = "crime.money_laundering",
    /**
     * Налоговое мошенничество
     */
    CRIME_TAX_FRAUD = "crime.tax_fraud",
    /**
     * Киберпреступность
     */
    CRIME_CYBER = "crime.cyber",
    /**
     * Терроризм
     */
    CRIME_TERROR = "crime.terror",
    /**
     * Торговля людьми
     */
    CRIME_HUMAN = "crime.human",
    /**
     * Наркотрафик
     */
    CRIME_DRUGS = "crime.drugs",
    /**
     * Организованная преступность
     */
    CRIME_ORGANIZED = "crime.organized",
    /**
     * Финансирование запрещённых деятельностей
     */
    FINANCING_FIRED = "financing.fired",
    /**
     * Финансирование терроризма
     */
    FINANCING_TERROR = "financing.terror",
    /**
     * Вынужденная мера (conscript)
     */
    SPECIAL_CONSCRIPT = "special.conscript",
    /**
     * Посредник (facilitator)
     */
    SPECIAL_FACILITATOR = "special.facilitator",
    /**
     * Мёртвая душа / неактивная сущность
     */
    SPECIAL_INACTIVE = "special.inactive"
}
/**
 * Все возможные значения topics
 * Используется для валидации и итерации
 */
export declare const ALL_SANCTION_TOPICS: readonly SanctionTopic[];
/**
 * Проверяет является ли строка валидным SanctionTopic
 */
export declare function isValidSanctionTopic(value: string): value is SanctionTopic;
