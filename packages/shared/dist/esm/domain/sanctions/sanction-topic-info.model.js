/**
 * Категория санкционной метки для группировки в UI
 */
export var SanctionCategory;
(function (SanctionCategory) {
    /** Международные санкции */
    SanctionCategory["SANCTIONS"] = "sanctions";
    /** Политические связи */
    SanctionCategory["POLITICAL"] = "political";
    /** Криминал */
    SanctionCategory["CRIME"] = "crime";
    /** Финансирование */
    SanctionCategory["FINANCING"] = "financing";
    /** Специальные метки */
    SanctionCategory["SPECIAL"] = "special";
})(SanctionCategory || (SanctionCategory = {}));
/**
 * Factory для создания SanctionTopicInfo
 */
export function createSanctionTopicInfo(params) {
    return { ...params };
}
