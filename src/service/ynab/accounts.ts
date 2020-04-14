import {API} from 'ynab';

import {Account} from '../../beans/account';
import {RWService} from '../interfaces';

export class YnabAccountsService implements RWService<Account> {
  constructor(private readonly ynabAPI: API, readonly b_id: string) {}

  getByIds(...ids: string[]): Promise<Account[]> {
    return Promise.all(ids.map(
        id => this.ynabAPI.accounts.getAccountById(this.b_id, id)
                  .then(r => new Account({
                          budget_id: this.b_id,
                          ...r.data.account,
                        }))));
  }

  save(): Promise<Account> {
    return Promise.reject('Save not supported');
  }

  update(): Promise<Account> {
    return Promise.reject('Update not supported');
  }

  delete(): Promise<void> {
    return Promise.reject('Delete not supported');
  }

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

  saveAll(): Promise<Account[]> {
    return Promise.reject('SaveAll not supported');
  }

  updateAll(): Promise<Account[]> {
    return Promise.reject('UpdateAll not supported');
  }

  deleteAll(): Promise<void> {
    return Promise.reject('DeleteAll not supported');
  }
}
