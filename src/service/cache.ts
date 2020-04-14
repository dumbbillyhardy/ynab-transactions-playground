import {fromNullable, Option} from '../util/option';

export interface ById<T> {
  id: T;
}

export interface Cache<T, U extends ById<T>> {
  getAll(): Option<U[]>;
  get(id: T): Option<U>;
  has(id: T): boolean;
  store(obj: U): void;
  size(): number;
  clear(): void;
}

export class InMemoryCache<T, U extends ById<T>> implements Cache<T, U> {
  readonly map: Map<T, U> = new Map();

  getAll(): Option<U[]> {
    return fromNullable(this.map)
        .filter((map) => map.size > 0)
        .map((map) => [...map.values()]);
  }

  get(id: T): Option<U> {
    return fromNullable(this.map.get(id));
  }

  has(id: T): boolean {
    return this.map.has(id);
  }

  storeAll(objs: U[]) {
    for (const obj of objs) {
      this.map.set(obj.id, obj);
    }
  }

  store(obj: U) {
    this.map.set(obj.id, obj);
  }

  size() {
    return this.map.size;
  }

  clear() {
    this.map.clear();
  }
}
