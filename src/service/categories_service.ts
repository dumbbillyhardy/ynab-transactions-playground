import {Category, CategoryGroup} from '../beans';

import {RWService} from './interfaces';

export interface CategoryGroupsService extends RWService<CategoryGroup> {}
export interface CategoriesService extends RWService<Category> {}

export class CategoriesAndCategoryGroupsService implements
    RWService<CategoryGroup> {
  constructor(
      readonly categoryGroupService: CategoryGroupsService,
      readonly categoryService: CategoriesService) {}

  getByIds(...ids: string[]): Promise<CategoryGroup[]> {
    return this.categoryGroupService.getByIds(...ids).then(
        (groups) => Promise.all(groups.map((group) => {
          return this.categoryService
              .getByIds(
                  ...group.categories.filter(c => c.id != null).map(c => c.id!))
              .then((categories) => new CategoryGroup({
                      ...group,
                      categories,
                    }));
        })));
  }

  save(row: CategoryGroup): Promise<CategoryGroup> {
    return this.saveAll([row]).then((rows) => rows[0]);
  }

  update(group: CategoryGroup): Promise<CategoryGroup> {
    return Promise
        .all([
          this.categoryGroupService.update(group),
          this.categoryService.updateAll(group.categories),
        ])
        .then(([group, categories]) => new CategoryGroup({
                ...group,
                categories,
              }));
  }

  delete(): Promise<void> {
    throw new Error('Not implemented');
  }

  getAll(): Promise<CategoryGroup[]> {
    return Promise
        .all([
          this.categoryGroupService.getAll(),
          this.categoryService.getAll(),
        ])
        .then(([groups, categories]) => {
          return groups.map(g => {
            return new CategoryGroup({
              ...g,
              categories: categories.filter(c => c.category.group_id === g.id)
            });
          });
        });
  }

  saveAll(groups: CategoryGroup[]): Promise<CategoryGroup[]> {
    return Promise
        .all([
          this.categoryGroupService.saveAll(groups),
          this.categoryService.saveAll(groups.flatMap(g => {
            g.categories.forEach(c => c.group_id = g.id);
            return g.categories;
          })),
        ])
        .then(() => groups);
  }

  updateAll(groups: CategoryGroup[]): Promise<CategoryGroup[]> {
    return Promise
        .all([
          this.categoryGroupService.updateAll(groups),
          this.categoryService.updateAll(groups.flatMap(g => {
            g.categories.forEach(c => c.group_id = g.id);
            return g.categories;
          })),
        ])
        .then(() => groups);
  }

  deleteAll(): Promise<void> {
    return Promise
        .all([
          this.categoryGroupService.deleteAll(),
          this.categoryService.deleteAll()
        ])
        .then();
  }
}
