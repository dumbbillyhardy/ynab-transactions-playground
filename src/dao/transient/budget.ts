import {Budget, BudgetData} from '../../beans';
import {fromNullable} from '../../util/option';
import {TopLevelDAO} from '../interfaces';

export class TransientBudgetDAO implements TopLevelDAO<Budget> {
  readonly budgets: Map<string, Budget>;

  constructor(budgets: Map<string, BudgetData>) {
    this.budgets = new Map(Array.from(budgets.entries()).map((val) => {
      return [val[0], new Budget(val[1])];
    }));
  }

  getAll(): Promise<Budget[]> {
    return Promise.resolve(
        Array.from(this.budgets.values()).map(v => new Budget(v.budget)));
  }

  getById(id: string): Promise<Budget> {
    return Promise.resolve()
        .then(() => fromNullable(this.budgets.get(id)))
        .then(b => b.unwrap());
  }

  save(budget: Budget): Promise<Budget> {
    if (this.budgets.has(budget.id)) {
      return Promise.reject('Budget already exists');
    }
    this.budgets.set(budget.id, budget);
    return Promise.resolve(budget);
  }

  update(budget: Budget): Promise<Budget> {
    if (!this.budgets.has(budget.id)) {
      return Promise.reject('Budget does not already exist');
    }
    this.budgets.set(budget.id, budget);
    return Promise.resolve(budget);
  }

  delete(id: string): Promise<void> {
    if (!this.budgets.has(id)) {
      return Promise.reject('Budget does not exist');
    }
    this.budgets.delete(id);
    return Promise.resolve();
  }

  saveAll(budgets: Budget[]): Promise<Budget[]> {
    return Promise.all(budgets.map(b => this.save(b)));
  }
}
