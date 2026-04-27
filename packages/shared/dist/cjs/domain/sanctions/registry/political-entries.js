"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.politicalEntries = void 0;
const sanction_topic_enum_1 = require("../sanction-topic.enum");
const sanction_level_enum_1 = require("../sanction-level.enum");
const sanction_topic_info_model_1 = require("../sanction-topic-info.model");
/**
 * Entries для категории POLITICAL
 * Политические связи и публичные должностные лица
 */
exports.politicalEntries = Object.freeze([
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.ROLE_PEP,
        label: 'Публичное должностное лицо (PEP)',
        level: sanction_level_enum_1.SanctionLevel.MEDIUM,
        description: 'Является или являлась публичным должностным лицом согласно FATF',
        category: sanction_topic_info_model_1.SanctionCategory.POLITICAL
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.ROLE_RCA,
        label: 'Близкое лицо PEP',
        level: sanction_level_enum_1.SanctionLevel.MEDIUM,
        description: 'Близкий родственник или ассоциированное лицо PEP',
        category: sanction_topic_info_model_1.SanctionCategory.POLITICAL
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.ROLE_GOV,
        label: 'Государственный служащий',
        level: sanction_level_enum_1.SanctionLevel.LOW,
        description: 'Государственный служащий или чиновник',
        category: sanction_topic_info_model_1.SanctionCategory.POLITICAL
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.ROLE_POLITICIAN,
        label: 'Политик',
        level: sanction_level_enum_1.SanctionLevel.LOW,
        description: 'Политический деятель',
        category: sanction_topic_info_model_1.SanctionCategory.POLITICAL
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.ROLE_DIPLOMAT,
        label: 'Дипломат',
        level: sanction_level_enum_1.SanctionLevel.LOW,
        description: 'Дипломатический представитель',
        category: sanction_topic_info_model_1.SanctionCategory.POLITICAL
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.ROLE_MILITARY,
        label: 'Военное лицо',
        level: sanction_level_enum_1.SanctionLevel.MEDIUM,
        description: 'Действующее или бывшее военное лицо',
        category: sanction_topic_info_model_1.SanctionCategory.POLITICAL
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.ROLE_OWNER_STATE,
        label: 'Госсобственность',
        level: sanction_level_enum_1.SanctionLevel.LOW,
        description: 'Находится в государственной собственности',
        category: sanction_topic_info_model_1.SanctionCategory.POLITICAL
    }),
]);
