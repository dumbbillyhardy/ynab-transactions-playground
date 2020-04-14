export interface ReadOnlyService<T> {
  getByIds(...ids: string[]): Promise<T[]>;
  getAll(): Promise<T[]>;
}

export interface AppendOnlyService<T> {
  save(obj: T): Promise<T>;
  saveAll(objs: T[]): Promise<T[]>;
}

export interface UpdateOnlyService<T> {
  update(obj: T): Promise<T>;
  delete(id: string): Promise<void>;
  updateAll(objs: T[]): Promise<T[]>;
  deleteAll(): Promise<void>;
}

export interface RWService<T> extends ReadOnlyService<T>, AppendOnlyService<T>,
                                      UpdateOnlyService<T> {}
