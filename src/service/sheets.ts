import {sheets_v4} from 'googleapis';

import {SheetRangeBuilder} from '../sheet_range';

export interface ArbitraryDataStore<T> {
  getAllForParent(parent_id?: string): Promise<T[]>;
  getById(): Promise<T>;
  save(row: T, parent_id?: string): Promise<T>;
  saveAll(rows: T[], parent_id?: string): Promise<T[]>;
}

export class SheetsService<T> implements ArbitraryDataStore<T> {
  constructor(
      readonly sheetsService: sheets_v4.Sheets,
      readonly sheetRangeBuilder: SheetRangeBuilder,
      readonly factory: (row: any[]) => T,
      readonly serailizer: (o: T, parent_id?: string) => any[]) {
    this.sheetRangeBuilder.withSheetPrefix('Transactions');
  }

  getAllForParent(parent_id?: string): Promise<T[]> {
    this.sheetRangeBuilder.withSheet(parent_id ?? '');
    return this.sheetsService.spreadsheets.values
        .get(this.sheetRangeBuilder.build())
        .then((val) => val.data.values!.map(row => this.factory(row)));
  }

  getById(): Promise<T> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(row: any, parent_id?: string): Promise<T> {
    return this.saveAll([row], parent_id).then((rows) => rows[0]);
  }

  update(): Promise<T> {
    throw new Error('Not implemented');
  }

  delete(): Promise<T> {
    throw new Error('Not implemented');
  }

  saveAll(rows: T[], parent_id?: string): Promise<T[]> {
    this.sheetRangeBuilder.withSheet(parent_id ?? '');
    return this.sheetsService.spreadsheets.values
        .append({
          ...this.sheetRangeBuilder,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: rows.map(r => this.serailizer(r, parent_id)),
          }
        })
        .then(() => rows);
  }
}
