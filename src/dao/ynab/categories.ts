import {API} from 'ynab';

import {Category, CategoryGroup, CategoryGroupSaveObject} from '../../beans/category';
import {RWService} from '../interfaces';

export class YnabCategoriesDAO implements RWService<CategoryGroup> {
  constructor(private readonly ynabAPI: API, readonly b_id: string) {}

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

  getById(id: string): Promise<CategoryGroup> {
    return this.ynabAPI.categories.getCategoryById(this.b_id, id)
        .then(resp => new CategoryGroup({
                budget_id: this.b_id,
                categories: [{
                  budget_id: this.b_id,
                  ...resp.data.category,
                }]
              }));
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

export class YnabCategoryGroupDAO implements
    RWService<CategoryGroupSaveObject> {
  constructor(private readonly ynabAPI: API, readonly b_id: string) {}

  getAll(): Promise<CategoryGroupSaveObject[]> {
    return this.ynabAPI.categories.getCategories(this.b_id).then(resp => {
      return resp.data.category_groups.map(
          g => new CategoryGroup({
                 budget_id: this.b_id,
                 id: g.id,
                 name: g.name,
                 categories: g.categories.map(c => ({
                                                budget_id: this.b_id,
                                                ...c,
                                              })),
               }).toSaveObject());
    });
  }

  getById(): Promise<CategoryGroupSaveObject> {
    return Promise.reject('GetById not supported');
  }

  save(): Promise<CategoryGroupSaveObject> {
    return Promise.reject('Save not supported');
  }

  update(): Promise<CategoryGroupSaveObject> {
    return Promise.reject('Update not supported');
  }

  delete(): Promise<void> {
    return Promise.reject('Delete not supported');
  }

  saveAll(): Promise<CategoryGroupSaveObject[]> {
    return Promise.reject('SaveAll not supported');
  }
}

export class YnabCategoryDAO implements RWService<Category> {
  constructor(private readonly ynabAPI: API, readonly b_id: string) {}

  getAll(): Promise<Category[]> {
    return this.ynabAPI.categories.getCategories(this.b_id).then(resp => {
      return resp.data.category_groups.flatMap(g => {
        return g.categories.map(c => {
          return new Category({
            budget_id: this.b_id,
            group_id: g.id,
            ...c,
          });
        });
      });
    });
  }

  getById(): Promise<Category> {
    return Promise.reject('GetById not supported');
  }

  save(): Promise<Category> {
    return Promise.reject('Save not supported');
  }

  update(): Promise<Category> {
    return Promise.reject('Update not supported');
  }

  delete(): Promise<void> {
    return Promise.reject('Delete not supported');
  }

  saveAll(): Promise<Category[]> {
    return Promise.reject('SaveAll not supported');
  }
}
