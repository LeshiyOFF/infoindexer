"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specialEntries = void 0;
const sanction_topic_enum_1 = require("../sanction-topic.enum");
const sanction_level_enum_1 = require("../sanction-level.enum");
const sanction_topic_info_model_1 = require("../sanction-topic-info.model");
/**
 * Entries для категории SPECIAL
 * Специальные метки и флаги
 */
exports.specialEntries = Object.freeze([
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.SPECIAL_CONSCRIPT,
        label: 'Мобилизация / принудительная служба',
        level: sanction_level_enum_1.SanctionLevel.LOW,
        description: 'Мобилизованное или принудительнослужащее лицо',
        category: sanction_topic_info_model_1.SanctionCategory.SPECIAL
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.SPECIAL_FACILITATOR,
        label: 'Посредник',
        level: sanction_level_enum_1.SanctionLevel.MEDIUM,
        description: 'Действует как посредник в сделках',
        category: sanction_topic_info_model_1.SanctionCategory.SPECIAL
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.SPECIAL_INACTIVE,
        label: 'Неактивная запись',
        level: sanction_level_enum_1.SanctionLevel.LOW,
        description: 'Запись неактивна или устарела',
        category: sanction_topic_info_model_1.SanctionCategory.SPECIAL
    }),
]);
