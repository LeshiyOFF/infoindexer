"use strict";
/**
 * Domain Layer: Санкции и рисковые метки
 *
 * Экспортирует всё необходимое для работы с санкционными topics из OpenSanctions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanctionTopicsService = exports.SanctionTopicsService = exports.SanctionTopicsRegistry = exports.createSanctionTopicInfo = exports.SanctionCategory = void 0;
// Enums
__exportStar(require("./sanction-topic.enum"), exports);
__exportStar(require("./sanction-level.enum"), exports);
// Values
var sanction_topic_info_model_1 = require("./sanction-topic-info.model");
Object.defineProperty(exports, "SanctionCategory", { enumerable: true, get: function () { return sanction_topic_info_model_1.SanctionCategory; } });
Object.defineProperty(exports, "createSanctionTopicInfo", { enumerable: true, get: function () { return sanction_topic_info_model_1.createSanctionTopicInfo; } });
// Registry
var sanction_topics_registry_1 = require("./sanction-topics-registry");
Object.defineProperty(exports, "SanctionTopicsRegistry", { enumerable: true, get: function () { return sanction_topics_registry_1.SanctionTopicsRegistry; } });
// Service
var sanction_topics_service_1 = require("./sanction-topics.service");
Object.defineProperty(exports, "SanctionTopicsService", { enumerable: true, get: function () { return sanction_topics_service_1.SanctionTopicsService; } });
Object.defineProperty(exports, "sanctionTopicsService", { enumerable: true, get: function () { return sanction_topics_service_1.sanctionTopicsService; } });
