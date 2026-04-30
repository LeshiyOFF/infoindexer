"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionCategory = void 0;
exports.createSanctionTopicInfo = createSanctionTopicInfo;
/**
 * Категория санкционной метки для группировки в UI
 */
var SanctionCategory;
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
})(SanctionCategory || (exports.SanctionCategory = SanctionCategory = {}));
/**
 * Factory для создания SanctionTopicInfo
 */
function createSanctionTopicInfo(params) {
    return { ...params };
}
