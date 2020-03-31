export interface TopLevelDAO<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
  save(obj: T): Promise<T>;
  update(obj: T): Promise<T>;
  saveAll(objs: T[]): Promise<T[]>;
}

export interface ChildDAO<T> {
  getAllForParent(parent_id: string): Promise<T[]>;
  getById(parent_id: string, t_id: string): Promise<T>;
  save(parent_id: string, transaction: T): Promise<T>;
  update(parent_id: string, transaction: T): Promise<T>;
  saveAll(parent_id: string, transactions: T[]): Promise<T[]>;
}
