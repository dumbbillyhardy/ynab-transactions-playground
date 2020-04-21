import {RWService} from '../interfaces';

export interface ById<T> {
  id: T;
}

export class CouchDbService<T extends ById<string>> implements RWService<T> {
  constructor(readonly db: PouchDB.Database) {}

  private _getByIds(...ids: string[]):
      Promise<(PouchDB.Core.Document<T>& PouchDB.Core.RevisionIdMeta)[]> {
    return Promise.all(ids.map((id) => {
      return this.db.get<T>(id);
    }));
  }

  getByIds(...ids: string[]): Promise<T[]> {
    return this._getByIds(...ids);
  }

  save(obj: T): Promise<T> {
    return this.db
        .post<T>({
          ...obj,
          '_id': obj.id,
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
    return this.db.allDocs<T>({include_docs: true}).then((docs) => {
      return docs.rows.map(row => row.doc).filter(r => r != null).map(r => r!);
    });
  }

  saveAll(objs: T[]): Promise<T[]> {
    return this.db
        .bulkDocs<T>(objs.map(o => ({
                                ...o,
                                '_id': o.id,
                              })))
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
