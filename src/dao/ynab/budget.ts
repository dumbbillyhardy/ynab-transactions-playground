import {API} from 'ynab';

import {Account, Budget} from '../../beans';
import {TopLevelDAO} from '../interfaces';

export class YnabBudgetDAO implements TopLevelDAO<Budget> {
  constructor(private readonly ynabAPI: API) {}

  getAll(): Promise<Budget[]> {
    return this.ynabAPI.budgets.getBudgets().then(budgetsResponse => {
      return budgetsResponse.data.budgets.map(
          b => new Budget({
            id: b.id,
            name: b.name,
            first_month: b.first_month,
            last_month: b.last_month,
            accounts: b.accounts?.map(a => new Account({
                                        budget_id: b.id,
                                        ...a,
                                      })),
          }));
    });
  }

  getById(id: string): Promise<Budget> {
    return this.ynabAPI.budgets.getBudgetById(id).then(
        budgetResponse => new Budget({
          id: budgetResponse.data.budget.id,
          name: budgetResponse.data.budget.name,
          first_month: budgetResponse.data.budget.first_month,
          last_month: budgetResponse.data.budget.last_month,
          accounts: budgetResponse.data.budget.accounts?.map(
              a => new Account({
                budget_id: budgetResponse.data.budget.id,
                ...a,
              })),
        }));
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
