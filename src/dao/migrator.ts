import {ChildDAO, TopLevelDAO} from './interfaces';

export class TopLevelMigrator<T> {
  constructor(
      readonly fromDAO: TopLevelDAO<T>, readonly toDAO: TopLevelDAO<T>) {}

  migrate(last_server_state?: number): Promise<T[]> {
    last_server_state;
    return this.fromDAO.getAll().then((objs) => this.toDAO.saveAll(objs));
  }
}

export class ChildMigrator<T> {
  constructor(readonly fromDAO: ChildDAO<T>, readonly toDAO: ChildDAO<T>) {}

  migrate(parent_id: string): Promise<T[]> {
    return this.fromDAO.getAllForParent(parent_id).then(
        (objs) => this.toDAO.saveAll(parent_id, objs));
  }
}
