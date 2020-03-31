export interface SheetRange {
  range: string;
  spreadsheetId: string;
}

export class SheetRangeBuilder {
  private sheetPrefix: string = '';
  private sheet: string = '';

  constructor(private range: string, private readonly spreadsheetId: string) {}

  withSheetPrefix(sheetPrefix: string): SheetRangeBuilder {
    this.sheetPrefix = sheetPrefix;
    return this;
  }

  withSheet(sheet: string): SheetRangeBuilder {
    this.sheet;
    this.sheetPrefix;
    this.sheet = sheet;
    return this;
  }

  build(): SheetRange {
    return {
      range: `\'${this.sheetPrefix}${this.sheet}\'!${this.range}`,
      spreadsheetId: this.spreadsheetId
    };
  }
}
