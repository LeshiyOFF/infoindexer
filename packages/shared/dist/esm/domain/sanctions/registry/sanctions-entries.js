"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanctionsEntries = void 0;
const sanction_topic_enum_1 = require("../sanction-topic.enum");
const sanction_level_enum_1 = require("../sanction-level.enum");
const sanction_topic_info_model_1 = require("../sanction-topic-info.model");
/**
 * Entries для категории SANCTIONS
 * Международные санкции различных регуляторов
 */
exports.sanctionsEntries = Object.freeze([
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.SANCTION,
        label: 'Международные санкции',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Компания находится под санкциями EU, US, UN или других регуляторов',
        category: sanction_topic_info_model_1.SanctionCategory.SANCTIONS
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.SANCTION_LINKED,
        label: 'Связь с санкционными лицами',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Компания связана с лицами под санкциями',
        category: sanction_topic_info_model_1.SanctionCategory.SANCTIONS
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.SANCTION_US_OFAC,
        label: 'Санкции OFAC (США)',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'В санкционном списке OFAC Министерства финансов США',
        category: sanction_topic_info_model_1.SanctionCategory.SANCTIONS
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.SANCTION_EU,
        label: 'Санкции ЕС',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'В санкционном списке Европейского союза',
        category: sanction_topic_info_model_1.SanctionCategory.SANCTIONS
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.SANCTION_UK,
        label: 'Санкции Великобритании',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'В санкционном списке Великобритании',
        category: sanction_topic_info_model_1.SanctionCategory.SANCTIONS
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.SANCTION_UN,
        label: 'Санкции ООН',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'В санкционном списке ООН',
        category: sanction_topic_info_model_1.SanctionCategory.SANCTIONS
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.SANCTION_SEC,
        label: 'Секторальные санкции',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Попадает под секторальные санкции',
        category: sanction_topic_info_model_1.SanctionCategory.SANCTIONS
    }),
]);
