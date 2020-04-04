export interface ArbitraryDataTopLevelStore<T> {
  getAll(): Promise<T[]>;
  getById(): Promise<T>;
  save(row: T): Promise<T>;
  saveAll(rows: T[]): Promise<T[]>;
  update(row: T): Promise<T>;
}

export interface ArbitraryDataChildStore<T> {
  getAllForParent(parent_id: string): Promise<T[]>;
  getById(): Promise<T>;
  save(parent_id: string, row: T): Promise<T>;
  saveAll(parent_id: string, rows: T[]): Promise<T[]>;
  update(parent_id: string, row: T): Promise<T>;
}
