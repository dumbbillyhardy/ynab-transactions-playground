import {sheets_v4} from 'googleapis';

import {SheetRange} from '../../sheet_range';
import {ChildDAO, TopLevelDAO} from '../interfaces';

export class SheetsTopLevelDAO<T> implements TopLevelDAO<T> {
  constructor(
      readonly sheetsService: sheets_v4.Sheets, readonly sheetRange: SheetRange,
      readonly factory: (row: any[]) => T,
      readonly serailizer: (o: T) => any[]) {}

  getAll(): Promise<T[]> {
    return this.sheetsService.spreadsheets.values.get(this.sheetRange)
        .then((val) => val.data.values!.map(row => this.factory(row)));
  }

  getById(): Promise<T> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(row: T): Promise<T> {
    return this.saveAll([row]).then((rows) => rows[0]);
  }

  update(): Promise<T> {
    throw new Error('Not implemented');
  }

  delete(): Promise<T> {
    throw new Error('Not implemented');
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
}

export class SheetsChildDAO<T> implements ChildDAO<T> {
  constructor(
      readonly sheetsService: sheets_v4.Sheets, readonly sheetRange: SheetRange,
      readonly factory: (row: any[]) => T,
      readonly serailizer: (parent_id: string, o: T) => any[]) {}

  getAllForParent(parent_id: string): Promise<T[]> {
    parent_id;
    return this.sheetsService.spreadsheets.values.get(this.sheetRange)
        .then((val) => val.data.values!.map(row => this.factory(row)));
  }

  getById(): Promise<T> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(parent_id: string, row: T): Promise<T> {
    return this.saveAll(parent_id, [row]).then((rows) => rows[0]);
  }

  update(): Promise<T> {
    throw new Error('Not implemented');
  }

  delete(): Promise<T> {
    throw new Error('Not implemented');
  }

  saveAll(parent_id: string, rows: T[]): Promise<T[]> {
    return this.sheetsService.spreadsheets.values
        .append({
          ...this.sheetRange,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: rows.map(r => this.serailizer(parent_id, r)),
          }
        })
        .then(() => rows);
  }
}
