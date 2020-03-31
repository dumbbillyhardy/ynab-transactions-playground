import {API} from 'ynab';

import {Transaction} from '../../beans/transaction';
import {fromNullable} from '../../util/option';
import {ChildDAO} from '../interfaces';

export class YnabTransactionsDAO implements ChildDAO<Transaction> {
  constructor(readonly ynabAPI: API) {}

  getAllForParent(b_id: string): Promise<Transaction[]> {
    return this.ynabAPI.transactions.getTransactions(b_id).then(
        resp => resp.data.transactions.map((trans) => new Transaction(trans)));
  }

  getById(b_id: string, t_id: string): Promise<Transaction> {
    return this.ynabAPI.transactions.getTransactionById(b_id, t_id)
        .then(resp => new Transaction(resp.data.transaction));
  }

  save(b_id: string, transaction: Transaction): Promise<Transaction> {
    return this.ynabAPI.transactions
        .createTransaction(b_id, {transaction: transaction.toSaveObject()})
        .then(resp => fromNullable(resp.data.transaction).unwrap())
        .then(t => new Transaction(t));
  }

  update(b_id: string, transaction: Transaction): Promise<Transaction> {
    return this.ynabAPI.transactions
        .updateTransaction(
            b_id, transaction.id, {transaction: transaction.toSaveObject()})
        .then(resp => fromNullable(resp.data.transaction).unwrap())
        .then(t => new Transaction(t));
  }

  saveAll(b_id: string, transactions: Transaction[]): Promise<Transaction[]> {
    return this.ynabAPI.transactions
        .createTransactions(
            b_id, {transactions: transactions.map(t => t.toSaveObject())})
        .then(resp => fromNullable(resp.data.transactions).unwrap())
        .then(ts => ts.map(t => new Transaction(t)));
  }
}
