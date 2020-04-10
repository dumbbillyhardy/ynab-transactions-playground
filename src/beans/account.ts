import {Account as YnabAccount} from 'ynab';

import {fromNullable} from '../util/option';

export interface AccountData {
  name: string;
  id: string;
  type?: YnabAccount.TypeEnum;
  balance: number;
  cleared_balance?: number;
  uncleared_balance?: number;
  closed: boolean;
  transfer_payee_id: string;
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

  get cleared_balance() {
    return fromNullable(this.account.cleared_balance)
        .map(b => b / 1000)
        .unwrapOr(0);
  }

  get uncleared_balance() {
    return fromNullable(this.account.uncleared_balance)
        .map(b => b / 1000)
        .unwrapOr(0);
  }

  get closed() {
    return this.account.closed;
  }

  get transfer_payee_id() {
    return this.account.transfer_payee_id ?? '';
  }

  toSheetsArray(): any[] {
    return [
      this.id,
      this.name,
      this.type,
      this.balance,
      this.cleared_balance,
      this.uncleared_balance,
      this.closed,
      this.transfer_payee_id,
    ];
  }

  static fromSheetsArray(row: any[]): Account {
    return new Account({
      id: row[0] as string,
      name: row[1] as string,
      type: YnabAccount.TypeEnum[row[2] as string],
      balance: (row[3] as number) * 1000,
      cleared_balance: row[4],
      uncleared_balance: row[5],
      closed: row[6],
      transfer_payee_id: row[7],
    });
  }

  toAspireArray(): any[] {
    return [this.name];
  }
}
