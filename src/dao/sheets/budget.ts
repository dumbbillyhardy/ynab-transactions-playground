import {Budget} from '../../beans/budget';
import {ArbitraryDataTopLevelStore} from '../../service/interfaces';
import {TopLevelDAO} from '../interfaces';

export class SheetsBudgetDAO implements TopLevelDAO<Budget> {
  constructor(readonly sheetsService: ArbitraryDataTopLevelStore<Budget>) {}

  getAll(): Promise<Budget[]> {
    return this.sheetsService.getAll();
  }

  getById(): Promise<Budget> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(budget: Budget): Promise<Budget> {
    return this.sheetsService.save(budget);
  }

  update(budget: Budget): Promise<Budget> {
    return this.sheetsService.update(budget);
  }

  delete(): Promise<void> {
    throw new Error('Not implemented');
  }

  saveAll(): Promise<Budget[]> {
    throw new Error('Not implemented');
  }
}
