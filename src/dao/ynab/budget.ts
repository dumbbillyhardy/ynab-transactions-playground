import {API} from 'ynab';

import {Budget} from '../../beans';
import {RWService} from '../interfaces';

export class YnabBudgetDAO implements RWService<Budget> {
  constructor(private readonly ynabAPI: API) {}

  getAll(): Promise<Budget[]> {
    return this.ynabAPI.budgets.getBudgets().then(budgetsResponse => {
      return budgetsResponse.data.budgets.map(Budget.parseYnab);
    });
  }

  getById(id: string): Promise<Budget> {
    return this.ynabAPI.budgets.getBudgetById(id).then(
        budgetResponse => Budget.parseYnab(budgetResponse.data.budget));
  }

  save(): Promise<Budget> {
    return Promise.reject('Save not supported');
  }

  update(): Promise<Budget> {
    return Promise.reject('Update not supported');
  }

  delete(): Promise<Budget> {
    return Promise.reject('Delete not supported');
  }

  saveAll(): Promise<Budget[]> {
    return Promise.reject('SaveAll not supported');
  }
}
