import {Category} from '../beans/category';

export interface CategoriesDAO {
  getAllInBudget(b_id: string): Promise<Category[]>;
  getById(b_id: string, t_id: string): Promise<Category>;
  save(b_id: string, category: Category): Promise<Category>;
  update(b_id: string, category: Category): Promise<Category>;
  saveAll(b_id: string, categories: Category[]): Promise<Category[]>;
}

export interface TopLevelDAO<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T>;
  save(obj: T): Promise<T>;
  update(obj: T): Promise<T>;
  saveAll(objs: T[]): Promise<T[]>;
}

export interface ChildDAO<T> {
  getAllForParent(parent_id: string): Promise<T[]>;
  getById(parent_id: string, id: string): Promise<T>;
  save(parent_id: string, obj: T): Promise<T>;
  update(parent_id: string, obj: T): Promise<T>;
  saveAll(parent_id: string, objs: T[]): Promise<T[]>;
}
