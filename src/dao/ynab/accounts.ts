import {API} from 'ynab';

import {Account} from '../../beans/account';
import {ChildDAO} from '../interfaces';

export class YnabAccountsDAO implements ChildDAO<Account> {
  constructor(private readonly ynabAPI: API) {}

  getAllForParent(b_id: string): Promise<Account[]> {
    return this.ynabAPI.accounts.getAccounts(b_id).then(resp => {
      return resp.data.accounts.map(a => new Account(a));
    });
  }

  getById(b_id: string, id: string): Promise<Account> {
    return this.ynabAPI.accounts.getAccountById(b_id, id).then(
        resp => new Account(resp.data.account));
  }

  save(): Promise<Account> {
    return Promise.reject('Save not supported');
  }

  update(): Promise<Account> {
    return Promise.reject('Update not supported');
  }

  delete(): Promise<Account> {
    return Promise.reject('Delete not supported');
  }

  saveAll(): Promise<Account[]> {
    return Promise.reject('SaveAll not supported');
  }
}
