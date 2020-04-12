import {API} from 'ynab';

import {Transaction} from '../../beans';
import {fromNullable} from '../../util/option';
import {TopLevelDAO} from '../interfaces';

export class YnabTransactionsDAO implements TopLevelDAO<Transaction> {
  constructor(readonly ynabAPI: API, readonly b_id: string) {}

  getAll(): Promise<Transaction[]> {
    return this.ynabAPI.transactions.getTransactions(this.b_id).then(
        resp => resp.data.transactions.map((trans) => new Transaction({
                                             budget_id: this.b_id,
                                             ...trans,
                                           })));
  }

  getById(t_id: string): Promise<Transaction> {
    return this.ynabAPI.transactions.getTransactionById(this.b_id, t_id)
        .then(resp => new Transaction({
                budget_id: this.b_id,
                ...resp.data.transaction,
              }));
  }

  save(transaction: Transaction): Promise<Transaction> {
    return this.ynabAPI.transactions
        .createTransaction(this.b_id, {transaction: transaction.toSaveObject()})
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
            {transaction: transaction.toSaveObject()})
        .then(resp => fromNullable(resp.data.transaction).unwrap())
        .then(t => new Transaction({
                budget_id: this.b_id,
                ...t,
              }));
  }

  saveAll(transactions: Transaction[]): Promise<Transaction[]> {
    return this.ynabAPI.transactions
        .createTransactions(
            this.b_id, {transactions: transactions.map(t => t.toSaveObject())})
        .then(resp => fromNullable(resp.data.transactions).unwrap())
        .then(ts => ts.map(t => new Transaction({
                             budget_id: this.b_id,
                             ...t,
                           })));
  }
}
