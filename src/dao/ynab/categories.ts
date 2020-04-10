import {API} from 'ynab';

import {Category, CategoryGroup, CategoryGroupSaveObject} from '../../beans/category';
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

export class YnabCategoryGroupDAO implements
    TopLevelDAO<CategoryGroupSaveObject> {
  constructor(private readonly ynabAPI: API, readonly b_id: string) {}

  getAll(): Promise<CategoryGroupSaveObject[]> {
    return this.ynabAPI.categories.getCategories(this.b_id).then(resp => {
      return resp.data.category_groups.map(
          g => new CategoryGroup(g).toSaveObject());
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

export class YnabCategoryDAO implements TopLevelDAO<Category> {
  constructor(private readonly ynabAPI: API, readonly b_id: string) {}

  getAll(): Promise<Category[]> {
    return this.ynabAPI.categories.getCategories(this.b_id).then(resp => {
      return resp.data.category_groups.flatMap(g => {
        return g.categories.map(c => {
          return new Category({
            ...c,
            group_id: g.id,
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
