import {Account} from 'ynab';

export interface AccountData {
  id: string;
  name: string;
  type: Account.TypeEnum;
  on_budget: boolean;
  closed: boolean;
  note?: string|null;
  balance: number;
  cleared_balance: number;
  uncleared_balance: number;
  transfer_payee_id: string;
  deleted: boolean;
}
export interface BudgetData {
  id: string;
  name: string;
  first_month?: string|null;
  last_month?: string|null;
  accounts?: Array<AccountData>|null;
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
}
