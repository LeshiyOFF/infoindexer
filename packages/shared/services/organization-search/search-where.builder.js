"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchWhereBuilder = void 0;
/**
 * Builder для WHERE условий поиска организаций
 */
class SearchWhereBuilder {
    conditions = ['1=1'];
    addRegion() {
        this.conditions.push('region = {region: String}');
    }
    addHasGeo() {
        this.conditions.push('has_geo = 1');
    }
    addMinRevenue() {
        this.conditions.push('revenue >= {minRevenue: Int64}');
    }
    addMaxRevenue() {
        this.conditions.push('revenue <= {maxRevenue: Int64}');
    }
    addMinAge() {
        this.conditions.push('age >= {minAge: Int32}');
    }
    addMaxAge() {
        this.conditions.push('age <= {maxAge: Int32}');
    }
    addMinCharterCapital() {
        this.conditions.push('charter_capital >= {minCharterCapital: Int64}');
    }
    addHasDirector() {
        this.conditions.push('has_director = 1');
    }
    addHasName() {
        this.conditions.push('has_name = 1');
    }
    addStatus() {
        this.conditions.push('status = {status: String}');
    }
    addOkvedPrefix() {
        this.conditions.push('startsWith(okved, {okvedPrefix: String})');
    }
    addNumericSearch() {
        this.conditions.push("(inn = {search: String} OR inn LIKE concat({search: String}, '%') OR ogrn = {search: String})");
    }
    addTextSearch() {
        this.conditions.push('name ILIKE {search: String}');
    }
    build() {
        return this.conditions.join(' AND ');
    }
}
exports.SearchWhereBuilder = SearchWhereBuilder;
