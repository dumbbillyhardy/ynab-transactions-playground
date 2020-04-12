export interface ReadOnlyService<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
}

export interface AppendOnlyService<T> {
  save(obj: T): Promise<T>;
  saveAll(objs: T[]): Promise<T[]>;
}

export interface UpdateOnlyService<T> {
  update(obj: T): Promise<T>;
}

export interface RWService<T> extends ReadOnlyService<T>, AppendOnlyService<T>,
                                      UpdateOnlyService<T> {}
