import {SheetRange} from './sheet_range';

export interface SheetConfigData {
  readonly spreadsheetId: string;
  readonly worksheet: string;
  readonly startColumn: string;
  readonly endColumn: string;
  readonly startRow: number;
  readonly endRow?: number;
}

export class SheetConfig {
  readonly spreadsheetId: string;
  readonly worksheet: string;
  readonly startColumn: string;
  readonly endColumn: string;
  readonly startRow: number;
  readonly endRow?: number;

  constructor(config: SheetConfigData) {
    this.spreadsheetId = config.spreadsheetId;
    this.worksheet = config.worksheet;
    this.startColumn = config.startColumn;
    this.endColumn = config.endColumn;
    this.startRow = config.startRow;
    this.endRow = config.endRow;
  }

  toSheetRange(): SheetRange {
    const range = `${this.startColumn}${this.startRow}:${this.endColumn}${
        this.endRow ?? ''}`;
    const fullRange =
        this.worksheet === '' ? range : `${this.worksheet}!${range}`;
    return {range: fullRange, spreadsheetId: this.spreadsheetId};
  }
}
