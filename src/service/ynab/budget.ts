import {API} from 'ynab';

import {Budget} from '../../beans';
import {RWService} from '../interfaces';

export class YnabBudgetService implements RWService<Budget> {
  constructor(private readonly ynabAPI: API) {}

  getByIds(...ids: string[]): Promise<Budget[]> {
    return Promise.all(ids.map(
        id => this.ynabAPI.budgets.getBudgetById(id).then(
            r => Budget.parseYnab(r.data.budget))));
  }

  save(): Promise<Budget> {
    return Promise.reject('Save not supported');
  }

  update(): Promise<Budget> {
    return Promise.reject('Update not supported');
  }

  delete(): Promise<void> {
    return Promise.reject('Delete not supported');
  }

  getAll(): Promise<Budget[]> {
    return this.ynabAPI.budgets.getBudgets().then(
        r => r.data.budgets.map(Budget.parseYnab));
  }

  saveAll(): Promise<Budget[]> {
    return Promise.reject('SaveAll not supported');
  }

  updateAll(): Promise<Budget[]> {
    return Promise.reject('UpdateAll not supported');
  }

  deleteAll(): Promise<void> {
    return Promise.reject('DeleteAll not supported');
  }
}
