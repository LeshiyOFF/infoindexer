/**
 * Builder для WHERE условий поиска организаций
 */
export class SearchWhereBuilder {
  private conditions: string[] = ['1=1'];

  addRegion(): void {
    this.conditions.push('region = {region: String}');
  }

  addHasGeo(): void {
    this.conditions.push('has_geo = 1');
  }

  addMinRevenue(): void {
    this.conditions.push('revenue >= {minRevenue: Int64}');
  }

  addMaxRevenue(): void {
    this.conditions.push('revenue <= {maxRevenue: Int64}');
  }

  addMinAge(): void {
    this.conditions.push('age >= {minAge: Int32}');
  }

  addMaxAge(): void {
    this.conditions.push('age <= {maxAge: Int32}');
  }

  addMinCharterCapital(): void {
    this.conditions.push('charter_capital >= {minCharterCapital: Int64}');
  }

  addHasDirector(): void {
    this.conditions.push('has_director = 1');
  }

  addHasName(): void {
    this.conditions.push('has_name = 1');
  }

  addStatus(): void {
    this.conditions.push('status = {status: String}');
  }

  addOkvedPrefix(): void {
    this.conditions.push('startsWith(okved, {okvedPrefix: String})');
  }

  addNumericSearch(): void {
    this.conditions.push(
      "(inn = {search: String} OR inn LIKE concat({search: String}, '%') OR ogrn = {search: String})"
    );
  }

  addTextSearch(): void {
    this.conditions.push('name ILIKE {search: String}');
  }

  addLatestYearGte(): void {
    this.conditions.push('latest_year >= {minYear: UInt16}');
  }

  build(): string {
    return this.conditions.join(' AND ');
  }
}
