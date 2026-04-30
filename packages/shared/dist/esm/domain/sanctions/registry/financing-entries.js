"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financingEntries = void 0;
const sanction_topic_enum_1 = require("../sanction-topic.enum");
const sanction_level_enum_1 = require("../sanction-level.enum");
const sanction_topic_info_model_1 = require("../sanction-topic-info.model");
/**
 * Entries для категории FINANCING
 * Финансирование запрещённых деятельностей
 */
exports.financingEntries = Object.freeze([
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.FINANCING_FIRED,
        label: 'Запрещённое финансирование',
        level: sanction_level_enum_1.SanctionLevel.MEDIUM,
        description: 'Финансирование запрещённых видов деятельности',
        category: sanction_topic_info_model_1.SanctionCategory.FINANCING
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.FINANCING_TERROR,
        label: 'Финансирование терроризма',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Связь с финансированием террористической деятельности',
        category: sanction_topic_info_model_1.SanctionCategory.FINANCING
    }),
]);
