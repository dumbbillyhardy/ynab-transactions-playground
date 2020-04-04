import {Account as YnabAccount} from 'ynab';

export interface AccountData {
  name: string;
  id: string;
  type: YnabAccount.TypeEnum;
  balance: number;
  cleared_balance?: number;
  uncleared_balance?: number;
}

export class Account {
  constructor(readonly account: AccountData) {}

  get name() {
    return this.account.name;
  }

  get id() {
    return this.account.id;
  }

  get type() {
    return this.account.type;
  }

  get balance() {
    return this.account.balance / 1000;
  }

  toSheetsArray(): any[] {
    return [this.id, this.name, this.type, this.balance];
  }

  static fromSheetsArray(row: any[]): Account {
    return new Account({
      id: row[0] as string,
      name: row[1] as string,
      type: YnabAccount.TypeEnum[row[2] as string],
      balance: (row[3] as number) * 1000,
    });
  }

  toAspireArray(): any[] {
    return [this.name];
  }
}
