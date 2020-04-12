import {RWService} from './interfaces';

export class TopLevelMigrator<T> {
  constructor(
      readonly fromService: RWService<T>, readonly toService: RWService<T>) {}

  migrate(last_server_state?: number): Promise<T[]> {
    last_server_state;
    return this.fromService.getAll().then(
        (objs) => this.toService.saveAll(objs));
  }
}
