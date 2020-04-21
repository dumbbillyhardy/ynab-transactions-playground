import {API} from 'ynab';

import {CategoryGroup} from '../../beans/category';
import {RWService} from '../interfaces';

export class YnabCategoriesService implements RWService<CategoryGroup> {
  constructor(private readonly ynabAPI: API, readonly b_id: string) {}

  getByIds(...ids: string[]): Promise<CategoryGroup[]> {
    return Promise.all(ids.map(
        id => this.ynabAPI.categories.getCategoryById(this.b_id, id)
                  .then(resp => new CategoryGroup({
                          id: '',
                          budget_id: this.b_id,
                          categories: [{
                            budget_id: this.b_id,
                            ...resp.data.category,
                          }]
                        }))));
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

  getAll(): Promise<CategoryGroup[]> {
    return this.ynabAPI.categories.getCategories(this.b_id).then(resp => {
      return resp.data.category_groups
          .map(g => ({
                 budget_id: this.b_id,
                 id: g.id,
                 name: g.name,
                 categories: g.categories.map(c => ({
                                                budget_id: this.b_id,
                                                ...c,
                                              })),
               }))
          .map(g => new CategoryGroup(g));
    });
  }

  saveAll(): Promise<CategoryGroup[]> {
    return Promise.reject('SaveAll not supported');
  }

  updateAll(): Promise<CategoryGroup[]> {
    return Promise.reject('UpdateAll not supported');
  }

  deleteAll(): Promise<void> {
    return Promise.reject('DeleteAll not supported');
  }
}
