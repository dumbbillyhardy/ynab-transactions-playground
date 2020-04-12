import {API} from 'ynab';

import {Account} from '../../beans/account';
import {TopLevelDAO} from '../interfaces';

export class YnabAccountsDAO implements TopLevelDAO<Account> {
  constructor(private readonly ynabAPI: API, readonly b_id: string) {}

  getAll(): Promise<Account[]> {
    return this.ynabAPI.accounts.getAccounts(this.b_id).then(resp => {
      return resp.data.accounts
          .map(a => new Account({
                 budget_id: this.b_id,
                 ...a,
               }))
          .filter(a => !a.account.closed);
    });
  }

  getById(id: string): Promise<Account> {
    return this.ynabAPI.accounts.getAccountById(this.b_id, id)
        .then(resp => new Account({
                budget_id: this.b_id,
                ...resp.data.account,
              }));
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
