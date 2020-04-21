import {SaveTransaction, SubTransaction, TransactionDetail, UpdateTransaction} from 'ynab';

import {fromNullable, Option} from '../util/option';

export interface TransactionData {
  budget_id: string;
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
  transfer_account_id?: string|null;
  transfer_transaction_id?: string|null;
  matched_transaction_id?: string|null;
  subtransactions: SubTransaction[];
}

export interface SaveTransactionData extends TransactionData {}

export class Transaction {
  transfer_account_id: Option<string>;
  transfer_transaction_id: Option<string>;
  matched_transaction_id: Option<string>;

  constructor(readonly transaction: TransactionData) {
    this.transfer_account_id = fromNullable(transaction.transfer_account_id);
    this.transfer_transaction_id =
        fromNullable(transaction.transfer_transaction_id);
    this.matched_transaction_id =
        fromNullable(transaction.matched_transaction_id);
  }

  get budget_id(): string {
    return this.transaction.budget_id;
  }

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

  get aspireCleared(): string {
    if (this.cleared === 'cleared' || this.cleared === 'reconciled') {
      return '✅';
    } else {
      return '🅿️';
    }
  }

  toAspire(): any[] {
    return [
      this.date,
      this.outflow,
      this.inflow,
      this.category_name === 'Immediate Income SubCategory' ?
          'Available to budget' :
          this.category_name,
      this.account_name,
      this.memo,
      this.aspireCleared,
    ] as any[];
  }

  toYnabSaveObject(): SaveTransaction {
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

  toUpdateObject(): UpdateTransaction {
    return {
      id: this.id,
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
      budget_id: row[0],
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
      transfer_account_id: row[15],
      transfer_transaction_id: row[16],
      matched_transaction_id: row[17],
      subtransactions: [],
    });
  }

  toSheetsArray(): any[] {
    return [
      this.budget_id,
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
      this.transfer_account_id.unwrapOr(''),
      this.transfer_transaction_id.unwrapOr(''),
      this.matched_transaction_id.unwrapOr(''),
      this.import_id,
    ];
  }

  toSaveObject(): SaveTransactionData {
    return {
      budget_id: this.budget_id,
      ...this.transaction,
    };
  }
}
