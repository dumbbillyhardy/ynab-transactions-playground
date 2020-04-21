import {API} from 'ynab';

import {Transaction} from '../../beans';
import {fromNullable} from '../../util/option';
import {RWService} from '../interfaces';

export class YnabTransactionsService implements RWService<Transaction> {
  constructor(readonly ynabAPI: API, readonly b_id: string) {}

  getByIds(...ids: string[]): Promise<Transaction[]> {
    return Promise.all(ids.map(id => {
      return this.ynabAPI.transactions.getTransactionById(this.b_id, id)
          .then(resp => new Transaction({
                  budget_id: this.b_id,
                  ...resp.data.transaction,
                }));
    }));
  }

  save(transaction: Transaction): Promise<Transaction> {
    return this.ynabAPI.transactions
        .createTransaction(
            this.b_id, {transaction: transaction.toYnabSaveObject()})
        .then(resp => fromNullable(resp.data.transaction).unwrap())
        .then(t => new Transaction({
                budget_id: this.b_id,
                ...t,
              }));
  }

  update(transaction: Transaction): Promise<Transaction> {
    return this.ynabAPI.transactions
        .updateTransaction(
            this.b_id, transaction.id,
            {transaction: transaction.toYnabSaveObject()})
        .then(resp => fromNullable(resp.data.transaction).unwrap())
        .then(t => new Transaction({
                budget_id: this.b_id,
                ...t,
              }));
  }

  delete(id: string): Promise<void> {
    id;
    throw new Error('Not implemented');
  }

  getAll(): Promise<Transaction[]> {
    return this.ynabAPI.transactions.getTransactions(this.b_id).then(
        resp => resp.data.transactions.map((trans) => new Transaction({
                                             budget_id: this.b_id,
                                             ...trans,
                                           })));
  }

  saveAll(transactions: Transaction[]): Promise<Transaction[]> {
    return this.ynabAPI.transactions
        .createTransactions(
            this.b_id,
            {transactions: transactions.map(t => t.toYnabSaveObject())})
        .then(resp => fromNullable(resp.data.transactions).unwrap())
        .then(ts => ts.map(t => new Transaction({
                             budget_id: this.b_id,
                             ...t,
                           })));
  }

  updateAll(transactions: Transaction[]): Promise<Transaction[]> {
    return this.ynabAPI.transactions
        .updateTransactions(
            this.b_id,
            {transactions: transactions.map(t => t.toUpdateObject())})
        .then(resp => resp.data.transactions ?? [])
        .then(ts => ts.map(t => new Transaction({
                             budget_id: this.b_id,
                             ...t,
                           })));
  }

  deleteAll(): Promise<void> {
    throw new Error('Not implemented');
  }
}
