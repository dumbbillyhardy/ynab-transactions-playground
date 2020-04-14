import {ReadOnlyService} from '../service/interfaces';
import {ById, Cache} from './cache';

export class CachedService<U extends ById<string>> implements
    ReadOnlyService<U> {
  constructor(
      readonly delegate: ReadOnlyService<U>, readonly cache: Cache<string, U>) {
  }

  getByIds(...ids: string[]): Promise<U[]> {
    const to_request: string[] = [];
    return Promise
        .all(ids.map((id) => {
                  if (this.cache.has(id)) {
                    const val = this.cache.get(id);
                    if (val.isSome()) {
                      return Promise.resolve(val.unwrap());
                    }
                    return Promise.reject('Value not found');
                  }
                  to_request.push(id);
                  return null;
                })
                 .filter(o => o == null)
                 .map(o => o!))
        .then((ret) => {
          return this.delegate.getByIds(...to_request).then((objs: U[]) => {
            for (const obj of objs) {
              this.cache.store(obj);
            }
            ret.push(...objs);
            return ret;
          });
        });
  }

  getAll(): Promise<U[]> {
    if (this.cache.size() > 0) {
      const val = this.cache.getAll()
      if (val.isSome()) {
        return Promise.resolve(val.unwrap());
      }
      return Promise.reject('Values not found');
    }
    return this.delegate.getAll().then((objs) => {
      for (const o of objs) {
        this.cache.store(o);
      }
      return objs;
    });
  }

  bust() {
    this.cache.clear();
  }
}
