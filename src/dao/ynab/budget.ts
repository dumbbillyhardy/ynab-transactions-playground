import {API} from 'ynab';

import {Budget} from '../../beans';
import {TopLevelDAO} from '../interfaces';

export class YnabBudgetDAO implements TopLevelDAO<Budget> {
  constructor(private readonly ynabAPI: API) {}

  getAll(): Promise<Budget[]> {
    return this.ynabAPI.budgets.getBudgets().then(budgetsResponse => {
      return budgetsResponse.data.budgets.map(b => new Budget(b));
    });
  }

  getById(id: string): Promise<Budget> {
    return this.ynabAPI.budgets.getBudgetById(id).then(
        budgetResponse => new Budget(budgetResponse.data.budget));
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
