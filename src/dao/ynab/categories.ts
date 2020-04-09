import {API} from 'ynab';

import {CategoryGroup} from '../../beans/category';
import {TopLevelDAO} from '../interfaces';

export class YnabCategoriesDAO implements TopLevelDAO<CategoryGroup> {
  constructor(private readonly ynabAPI: API, readonly b_id: string) {}

  getAll(): Promise<CategoryGroup[]> {
    return this.ynabAPI.categories.getCategories(this.b_id).then(resp => {
      return resp.data.category_groups.map(b => new CategoryGroup(b));
    });
  }

  getById(id: string): Promise<CategoryGroup> {
    return this.ynabAPI.categories.getCategoryById(this.b_id, id)
        .then(resp => new CategoryGroup({categories: [resp.data.category]}));
  }

  save(): Promise<CategoryGroup> {
    return Promise.reject('Save not supported');
  }

  update(): Promise<CategoryGroup> {
    return Promise.reject('Update not supported');
  }

  delete(): Promise<void> {
    return Promise.reject('Delete not supported');
  }

  saveAll(): Promise<CategoryGroup[]> {
    return Promise.reject('SaveAll not supported');
  }
}
