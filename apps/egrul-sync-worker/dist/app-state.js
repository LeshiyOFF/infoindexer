"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAppState = setAppState;
exports.getAppState = getAppState;
exports.clearAppState = clearAppState;
let appStateInstance = null;
function setAppState(state) {
    appStateInstance = state;
}
function getAppState() {
    return appStateInstance;
}
function clearAppState() {
    appStateInstance = null;
}
