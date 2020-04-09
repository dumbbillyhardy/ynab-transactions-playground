import {sheets_v4} from 'googleapis';

import {Account, Budget, CategoryGroup, Transaction} from '../../beans';
import {SheetRange} from '../../sheet_config';
import {TopLevelDAO} from '../interfaces';

import {SheetsTopLevelDAO} from './sheets';

export class SheetsBudgetDAO extends SheetsTopLevelDAO<Budget> {}
export class SheetsTransactionsDAO extends SheetsTopLevelDAO<Transaction> {}
export class SheetsAccountDAO extends SheetsTopLevelDAO<Account> {}

export class SheetsCategoriesDAO implements TopLevelDAO<CategoryGroup> {
  constructor(
      readonly sheetsService: sheets_v4.Sheets, readonly sheetRange: SheetRange,
      readonly factory: (table: any[][]) => CategoryGroup[],
      readonly serializer: (rows: CategoryGroup[]) => any[][]) {}

  getAll(): Promise<CategoryGroup[]> {
    return this.sheetsService.spreadsheets.values.get(this.sheetRange)
        .then((val) => this.factory(val.data.values!));
  }

  getById(): Promise<CategoryGroup> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(row: CategoryGroup): Promise<CategoryGroup> {
    return this.saveAll([row]).then((rows) => rows[0]);
  }

  update(): Promise<CategoryGroup> {
    throw new Error('Not implemented');
  }

  saveAll(rows: CategoryGroup[]): Promise<CategoryGroup[]> {
    return this.sheetsService.spreadsheets.values
        .append({
          ...this.sheetRange,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: this.serializer(rows),
          }
        })
        .then(() => rows);
  }
}
