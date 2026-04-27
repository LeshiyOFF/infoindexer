/**
 * Builder для параметров ClickHouse запроса
 */
export class SearchParamsBuilder {
  private params: Record<string, string | number | string[] | undefined> = {};

  withLimit(value: number): this {
    this.params.limit = value;
    return this;
  }

  withOffset(value: number): this {
    this.params.offset = value;
    return this;
  }

  withSearch(value: string): this {
    this.params.search = value.match(/^\d+$/)
      ? value
      : `%${value}%`;
    return this;
  }

  withRegion(value: string): this {
    this.params.region = value;
    return this;
  }

  withMinRevenue(value: number): this {
    this.params.minRevenue = value;
    return this;
  }

  withMaxRevenue(value: number): this {
    this.params.maxRevenue = value;
    return this;
  }

  withMinAge(value: number): this {
    this.params.minAge = value;
    return this;
  }

  withMaxAge(value: number): this {
    this.params.maxAge = value;
    return this;
  }

  withMinCharterCapital(value: number): this {
    this.params.minCharterCapital = value;
    return this;
  }

  withStatus(value: string): this {
    this.params.status = value;
    return this;
  }

  withOkved(value: string): this {
    this.params.okvedPrefix = value.trim();
    return this;
  }

  build(): Record<string, string | number | string[] | undefined> {
    return this.params;
  }
}
