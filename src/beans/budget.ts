import {BudgetSummary as YnabBudget} from 'ynab';

import {Account} from './account';

export interface BudgetData {
  id: string;
  name: string;
  first_month?: string|null;
  last_month?: string|null;
  accounts?: Array<Account>|null;
}

export class Budget {
  constructor(readonly budget: BudgetData) {}

  get name() {
    return this.budget.name;
  }

  get id() {
    return this.budget.id;
  }

  get first_month() {
    return this.budget.first_month;
  }

  get last_month() {
    return this.budget.last_month;
  }

  toSheetsArray(): any[] {
    return [this.id, this.name, this.first_month, this.last_month]
  }

  static fromSheetsArray(row: any[]): Budget {
    return new Budget({
      id: row[0],
      name: row[1],
      first_month: row[2],
      last_month: row[3],
    });
  }

  static parseYnab(b: YnabBudget) {
    return new Budget({
      id: b.id,
      name: b.name,
      first_month: b.first_month,
      last_month: b.last_month,
      accounts: b.accounts?.map(a => new Account({
                                  budget_id: b.id,
                                  ...a,
                                })),
    });
  }
}
