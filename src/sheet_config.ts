import {SheetRange} from './sheet_range';

export class SheetConfig {
  constructor(
      readonly spreadsheetId: string,
      readonly worksheet: string,
      readonly startColumn: string,
      readonly endColumn: string,
      readonly startRow: number,
      readonly endRow?: number,
  ) {}

  toSheetRange(): SheetRange {
    const range = `${this.startColumn}${this.startRow}:${this.endColumn}${
        this.endRow ?? ''}`;
    const fullRange =
        this.worksheet === '' ? range : `${this.worksheet}!${range}`;
    return {range: fullRange, spreadsheetId: this.spreadsheetId};
  }
}
