import {RWService} from './interfaces';

export class FullMigrator<T> {
  constructor(
      readonly fromService: RWService<T>, readonly toService: RWService<T>) {}

  migrate(): Promise<T[]> {
    return this.toService.deleteAll()
        .then(() => this.fromService.getAll())
        .then((objs) => this.toService.saveAll(objs));
  }
}
