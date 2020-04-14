import {ReadOnlyService} from '../service/interfaces';
import {ById, Cache} from './cache';

export class CachedService<U extends ById<string>> implements
    ReadOnlyService<U> {
  constructor(
      readonly delegate: ReadOnlyService<U>, readonly cache: Cache<string, U>) {
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

  getById(id: string): Promise<U> {
    if (this.cache.has(id)) {
      const val = this.cache.get(id);
      if (val.isSome()) {
        return Promise.resolve(val.unwrap());
      }
      return Promise.reject('Value not found');
    }
    return this.delegate.getById(id).then((obj) => {
      this.cache.store(obj);
      return obj;
    });
  }

  bust() {
    this.cache.clear();
  }
}
