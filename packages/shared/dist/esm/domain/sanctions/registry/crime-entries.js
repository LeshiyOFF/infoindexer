"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crimeEntries = void 0;
const sanction_topic_enum_1 = require("../sanction-topic.enum");
const sanction_level_enum_1 = require("../sanction-level.enum");
const sanction_topic_info_model_1 = require("../sanction-topic-info.model");
/**
 * Entries для категории CRIME
 * Различные виды преступной деятельности
 */
exports.crimeEntries = Object.freeze([
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.CRIME_FRAUD,
        label: 'Мошенничество',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Связь с мошенническими схемами',
        category: sanction_topic_info_model_1.SanctionCategory.CRIME
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.CRIME_CORRUPTION,
        label: 'Коррупция',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Связь с коррупционными схемами',
        category: sanction_topic_info_model_1.SanctionCategory.CRIME
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.CRIME_MONEY_LAUNDERING,
        label: 'Отмывание денег',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Связь с отмыванием денежных средств',
        category: sanction_topic_info_model_1.SanctionCategory.CRIME
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.CRIME_TAX_FRAUD,
        label: 'Налоговые нарушения',
        level: sanction_level_enum_1.SanctionLevel.MEDIUM,
        description: 'Налоговые мошенничество или уклонение',
        category: sanction_topic_info_model_1.SanctionCategory.CRIME
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.CRIME_CYBER,
        label: 'Киберпреступность',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Связь с киберпреступной деятельностью',
        category: sanction_topic_info_model_1.SanctionCategory.CRIME
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.CRIME_TERROR,
        label: 'Терроризм',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Связь с террористической деятельностью',
        category: sanction_topic_info_model_1.SanctionCategory.CRIME
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.CRIME_HUMAN,
        label: 'Торговля людьми',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Связь с торговлей людьми',
        category: sanction_topic_info_model_1.SanctionCategory.CRIME
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.CRIME_DRUGS,
        label: 'Наркотики',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Связь с наркотрафиком',
        category: sanction_topic_info_model_1.SanctionCategory.CRIME
    }),
    (0, sanction_topic_info_model_1.createSanctionTopicInfo)({
        topic: sanction_topic_enum_1.SanctionTopic.CRIME_ORGANIZED,
        label: 'Организованная преступность',
        level: sanction_level_enum_1.SanctionLevel.HIGH,
        description: 'Связь с организованными преступными группами',
        category: sanction_topic_info_model_1.SanctionCategory.CRIME
    }),
]);
