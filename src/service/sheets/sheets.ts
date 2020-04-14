import {sheets_v4} from 'googleapis';

import {SheetRange} from '../../sheet_config';
import {RWService} from '../interfaces';

export class SheetsTopLevelService<T> implements RWService<T> {
  constructor(
      readonly sheetsService: sheets_v4.Sheets, readonly sheetRange: SheetRange,
      readonly factory: (row: any[]) => T,
      readonly serailizer: (o: T) => any[]) {}

  getByIds(): Promise<T[]> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(row: T): Promise<T> {
    return this.saveAll([row]).then((rows) => rows[0]);
  }

  update(): Promise<T> {
    throw new Error('Not implemented');
  }

  delete(): Promise<void> {
    throw new Error('Not implemented');
  }

  getAll(): Promise<T[]> {
    return this.sheetsService.spreadsheets.values.get(this.sheetRange)
        .then((val) => val.data.values!.map(row => this.factory(row)));
  }

  saveAll(rows: T[]): Promise<T[]> {
    return this.sheetsService.spreadsheets.values
        .append({
          ...this.sheetRange,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: rows.map(r => this.serailizer(r)),
          }
        })
        .then(() => rows);
  }

  updateAll(): Promise<T[]> {
    throw new Error('Not implemented');
  }

  deleteAll(): Promise<void> {
    return this.sheetsService.spreadsheets.values
        .clear({
          ...this.sheetRange,
        })
        .then();
  }
}
