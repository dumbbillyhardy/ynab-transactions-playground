import {SaveTransaction, SubTransaction, TransactionDetail} from 'ynab';

import {fromNullable} from '../util/option';

export interface TransactionData {
  id: string;
  account_id: string;
  account_name: string;
  date: string;
  amount: number;
  payee_id?: string|null;
  payee_name?: string|null;
  category_id?: string|null;
  category_name?: string|null;
  memo?: string|null;
  cleared: TransactionDetail.ClearedEnum;
  approved: boolean;
  flag_color?: TransactionDetail.FlagColorEnum|null;
  import_id?: string|null;
  subtransactions: SubTransaction[];
}

export class Transaction {
  constructor(readonly transaction: TransactionData) {}

  get id(): string {
    return this.transaction.id;
  }

  get date(): string {
    return this.transaction.date;
  }

  get amount(): number {
    return this.transaction.amount / 1000;
  };

  get inflow(): number {
    return Math.abs(Math.max(0, this.amount));
  };

  get outflow(): number {
    return Math.abs(Math.min(0, this.amount));
  };

  get category_id(): string {
    return this.transaction.category_id ?? '';
  }

  get category_name(): string {
    if (this.transaction.category_name === 'Immediate Income SubCategory') {
      return 'Available to budget';
    }
    return this.transaction.category_name ?? '';
  }

  get account_name(): string {
    return this.transaction.account_name;
  }

  get account_id(): string {
    return this.transaction.account_id;
  }

  get memo(): string {
    return fromNullable(this.transaction.memo).unwrapOr('');
  }

  get cleared(): string {
    return this.transaction.cleared.toString();
  }

  get approved(): boolean {
    return this.transaction.approved;
  }

  get payee_id(): string {
    return fromNullable(this.transaction.payee_id).unwrapOr('');
  }

  get payee_name(): string {
    return fromNullable(this.transaction.payee_name).unwrapOr('');
  }

  get flag_color(): string {
    return fromNullable(this.transaction.flag_color)
        .map(f => f.toString())
        .unwrapOr('');
  }

  get import_id(): string {
    return this.transaction.import_id ?? '';
  }

  toAspire(): any[] {
    return [
      this.date, this.inflow, this.outflow,
      this.category_name === 'Immediate Income SubCategory' ?
          'Available to budget' :
          this.category_name,
      this.account_name, this.memo
    ] as any[];
  }

  toSaveObject(): SaveTransaction {
    return {
      account_id: this.account_id,
      date: this.date,
      amount: this.amount,
      payee_id: this.transaction.payee_id,
      payee_name: this.payee_name,
      category_id: this.transaction.category_id,
      memo: this.memo,
      cleared: this.transaction.cleared,
      approved: this.approved,
      flag_color: this.transaction.flag_color,
      import_id: this.transaction.import_id,
      subtransactions: this.transaction.subtransactions,
    };
  }

  static fromSheetsArray(row: any[]): Transaction {
    return new Transaction({
      id: row[1],
      account_id: row[2],
      account_name: row[3],
      date: row[4],
      amount: row[5],
      payee_id: row[6],
      payee_name: row[7],
      category_id: row[8],
      category_name: row[9],
      memo: row[10],
      cleared: row[11],
      approved: row[12],
      flag_color: row[13],
      import_id: row[14],
      subtransactions: [],
    });
  }

  toSheetsArray(b_id: string): any[] {
    return [
      b_id,
      this.id,
      this.account_id,
      this.account_name,
      this.date,
      this.amount,
      this.payee_id,
      this.payee_name,
      this.category_id,
      this.category_name,
      this.memo,
      this.cleared,
      this.approved,
      this.flag_color,
      this.import_id,
    ];
  }
}
