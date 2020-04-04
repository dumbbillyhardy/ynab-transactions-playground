import {TransactionDetail} from 'ynab';

import {Transaction} from '../../beans';
import {fromNullable} from '../../util/option';
import {ChildDAO} from '../interfaces';

export class TransientTransactionsDAO implements ChildDAO<Transaction> {
  readonly transactions: Map<string, Transaction[]>;

  constructor(transactions_by_budget: Map<string, TransactionDetail[]>) {
    this.transactions =
        new Map(Array.from(transactions_by_budget.entries()).map((val) => {
          return [val[0], val[1].map(t => new Transaction(t))];
        }));
  }

  getAllForParent(b_id: string): Promise<Transaction[]> {
    return Promise.resolve()
        .then(() => fromNullable(this.transactions.get(b_id)))
        .then(ts => ts.unwrap());
  }

  getById(b_id: string, t_id: string): Promise<Transaction> {
    return Promise.resolve()
        .then(() => fromNullable(this.transactions.get(b_id)))
        .then(ts => ts.map(ts => ts.find((t) => t.id === t_id)))
        .then(ts => ts.unwrap('Transaction not found')!);
  }

  save(b_id: string, transaction: Transaction): Promise<Transaction> {
    return Promise.resolve()
        .then(() => fromNullable(this.transactions.get(b_id)))
        .then(ts => ts.unwrap('Budget not found') && ts)
        .then(ts => ts.filter(ts => ts.every((t) => t.id !== transaction.id)))
        .then(ts => ts.unwrap('Transaction already exists')!)
        .then(ts => ts.push(transaction))
        .then(() => transaction);
  }

  update(b_id: string, transaction: Transaction): Promise<Transaction> {
    return Promise.resolve()
        .then(() => fromNullable(this.transactions.get(b_id)))
        .then(ts => ts.unwrap('Budget not found') && ts)
        .then(ts => ts.filter(ts => {
          const i = ts.findIndex((t) => t.id !== transaction.id)
          if (i < 0) return false;
          ts.splice(i, 1, transaction);
          return true;
        }))
        .then(ts => ts.unwrap('Transaction not found')!)
        .then(() => transaction);
  }

  saveAll(b_id: string, transactions: Transaction[]): Promise<Transaction[]> {
    return Promise.resolve()
        .then(() => fromNullable(this.transactions.get(b_id)))
        .then(ts => ts.unwrap('Budget not found') && ts)
        //.then(ts => ts.filter(ts => ts.every((t) => t.id !== transaction.id)))
        .then(ts => ts.unwrap('Transaction already exists')!)
        .then(ts => ts.push(...transactions))
        .then(() => transactions);
  }
}
