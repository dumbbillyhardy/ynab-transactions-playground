import {sheets_v4} from 'googleapis';

import {Budget} from '../../beans/budget';
import {SheetRange} from '../../sheet_range';
import {BudgetDAO} from '../interface/budget';

export class SheetsBudgetDAO implements BudgetDAO {
  constructor(
      readonly sheetsService: sheets_v4.Sheets, readonly sheet: SheetRange) {}

  getAll(): Promise<Budget[]> {
    return this.sheetsService.spreadsheets.values.get(this.sheet)
        .then((val) => {
          return val.data.values!.map((row) => new Budget({
                                        id: row[0],
                                        name: row[1],
                                        first_month: row[2],
                                        last_month: row[3],
                                      }));
        });
  }

  getById(): Promise<Budget> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(budget: Budget): Promise<void> {
    return this.sheetsService.spreadsheets.values
        .append({
          ...this.sheet,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [
              [budget.id, budget.name, budget.first_month, budget.last_month]
            ],
          }
        })
        .then();
  }

  update(): Promise<void> {
    throw new Error('Not implemented');
  }

  delete(): Promise<void> {
    throw new Error('Not implemented');
  }
}
