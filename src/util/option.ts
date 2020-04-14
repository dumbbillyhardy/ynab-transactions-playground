export interface Option<T> {
  isSome(): this is Some<T>;
  isNone(): this is None<T>;
  map<R>(fn: (value: T) => R): Option<R>;
  flatMap<R>(fn: (value: T) => Option<R>): Option<R>;
  filter(fn: (value: T) => boolean): Option<T>;
  unwrap(error?: string): T;
  unwrapOr<U>(defaultV: T): T|U;
}

export class None<T> implements Option<T> {
  isSome(): this is Some<T> {
    return false;
  }

  isNone(): this is None<T> {
    return true;
  }

  map<R>(): Option<R> {
    return new None();
  }

  flatMap<R>(): Option<R> {
    return new None();
  }

  filter(): Option<T> {
    return new None();
  }

  unwrap(error?: string): T {
    throw new Error(error ?? 'Tried to unwrap None');
  }

  unwrapOr<U>(defaultV: U): T|U {
    return defaultV;
  }
}

export class Some<T> implements Option<T> {
  constructor(readonly value: T) {}

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None<T> {
    return false;
  }

  map<R>(fn: (value: T) => R): Option<R> {
    return new Some(fn(this.value));
  }

  flatMap<R>(fn: (value: T) => Option<R>): Option<R> {
    return fn(this.value);
  }

  filter(fn: (value: T) => boolean): Option<T> {
    if (fn(this.value)) {
      return this;
    }
    return new None();
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr<U>(): T|U {
    return this.value;
  }
}

export function fromNullable<T>(maybe?: T|null): Option<T> {
  return maybe == null ? new None() : new Some(maybe!);
}
