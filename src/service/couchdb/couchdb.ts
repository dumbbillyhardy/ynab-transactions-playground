import {RWService} from '../interfaces';

export interface ById<T> {
  id: T;
}

export class CouchDbService<T extends ById<string>, U> implements RWService<T> {
  constructor(
      readonly db: PouchDB.Database,
      readonly factory: (row: U) => T,
      readonly serailizer: (o: T) => U,
  ) {}

  private _getByIds(...ids: string[]):
      Promise<(PouchDB.Core.Document<U>& PouchDB.Core.RevisionIdMeta)[]> {
    return Promise.all(ids.map((id) => {
      return this.db.get<U>(id);
    }));
  }

  getByIds(...ids: string[]): Promise<T[]> {
    return this._getByIds(...ids).then((objs) => objs.map(this.factory));
  }

  save(obj: T): Promise<T> {
    const id = obj.id;
    return Promise.resolve(obj)
        .then(this.serailizer)
        .then((obj) => ({
                ...obj,
                '_id': id,
              }))
        .then((obj) => {
          return this.db.post<U>(obj);
        })
        .then((doc) => {
          return {
            ...obj,
            id: doc.id,
          };
        });
  }

  update(obj: T): Promise<T> {
    return this.updateAll([obj]).then(objs => objs[0]);
  }

  delete(id: string): Promise<void> {
    return this._getByIds(id)
        .then((docs) => {
          return this.db.remove(docs[0]);
        })
        .then();
  }

  getAll(): Promise<T[]> {
    return this.db.allDocs<U>({include_docs: true}).then((docs) => {
      return docs.rows.map(row => row.doc)
          .filter(r => r != null)
          .map(r => r!)
          .map(this.factory);
    });
  }

  saveAll(objs: T[]): Promise<T[]> {
    return this.db
        .bulkDocs<U>(objs.map(o => {
          return {
            ...this.serailizer(o),
            '_id': o.id,
          };
        }))
        .then((docs) => {
          const ret: Array<T> = [];
          for (let i = 0; i < objs.length; i++) {
            ret.push({
              ...objs[i],
              ...docs[i],
            });
          }
          return ret;
        });
  }

  updateAll(objs: T[]): Promise<T[]> {
    return this.saveAll(objs);
  }

  deleteAll(): Promise<void> {
    return Promise.resolve();
    //    return this.db.destroy().then();
  }
}
