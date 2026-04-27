"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchParamsBuilder = void 0;
/**
 * Builder для параметров ClickHouse запроса
 */
class SearchParamsBuilder {
    params = {};
    withLimit(value) {
        this.params.limit = value;
        return this;
    }
    withOffset(value) {
        this.params.offset = value;
        return this;
    }
    withSearch(value) {
        this.params.search = value.match(/^\d+$/)
            ? value
            : `%${value}%`;
        return this;
    }
    withRegion(value) {
        this.params.region = value;
        return this;
    }
    withMinRevenue(value) {
        this.params.minRevenue = value;
        return this;
    }
    withMaxRevenue(value) {
        this.params.maxRevenue = value;
        return this;
    }
    withMinAge(value) {
        this.params.minAge = value;
        return this;
    }
    withMaxAge(value) {
        this.params.maxAge = value;
        return this;
    }
    withMinCharterCapital(value) {
        this.params.minCharterCapital = value;
        return this;
    }
    withStatus(value) {
        this.params.status = value;
        return this;
    }
    withOkved(value) {
        this.params.okvedPrefix = value.trim();
        return this;
    }
    build() {
        return this.params;
    }
}
exports.SearchParamsBuilder = SearchParamsBuilder;
