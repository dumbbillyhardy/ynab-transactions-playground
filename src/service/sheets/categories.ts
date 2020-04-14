import {sheets_v4} from 'googleapis';

import {Category, CategoryGroup, CategoryGroupSaveObject} from '../../beans';
import {SheetRange} from '../../sheet_config';
import {RWService} from '../interfaces';

export class SheetsCategoriesService implements RWService<CategoryGroup> {
  constructor(
      readonly categoryGroupService: SheetsCategoryGroupsService,
      readonly categoryService: SheetsOnlyCategoriesService) {}

  getByIds(...ids: string[]): Promise<CategoryGroup[]> {
    return this.categoryGroupService.getByIds(...ids).then(
        (groups) => Promise.all(groups.map((group) => {
          return this.categoryService.getByIds(...group.categoryIds)
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
          this.categoryGroupService.update(group.toSaveObject()),
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
          this.categoryGroupService.saveAll(groups.map(g => g.toSaveObject())),
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
          this.categoryGroupService.updateAll(
              groups.map(g => g.toSaveObject())),
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

export class SheetsCategoryGroupsService implements
    RWService<CategoryGroupSaveObject> {
  constructor(
      readonly sheetsService: sheets_v4.Sheets, readonly sheetRange: SheetRange,
      readonly factory: (row: any[]) => CategoryGroupSaveObject,
      readonly serializer: (group: CategoryGroupSaveObject) => any[]) {}

  getByIds(...ids: string[]): Promise<CategoryGroupSaveObject[]> {
    ids;
    throw new Error('Not implemented, try using cached service.');
  }

  save(group: CategoryGroupSaveObject): Promise<CategoryGroupSaveObject> {
    return this.saveAll([group]).then((groups) => groups[0]);
  }

  update(group: CategoryGroupSaveObject): Promise<CategoryGroupSaveObject> {
    group;
    throw new Error('Not implemented');
  }

  delete(id: string): Promise<void> {
    id;
    throw new Error('Not implemented');
  }

  getAll(): Promise<CategoryGroupSaveObject[]> {
    return this.sheetsService.spreadsheets.values.get(this.sheetRange)
        .then((val) => val.data.values!.map(this.factory));
  }

  saveAll(groups: CategoryGroupSaveObject[]):
      Promise<CategoryGroupSaveObject[]> {
    return this.sheetsService.spreadsheets.values
        .append({
          ...this.sheetRange,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: groups.map(this.serializer),
          }
        })
        .then(() => groups);
  }

  updateAll(groups: CategoryGroupSaveObject[]):
      Promise<CategoryGroupSaveObject[]> {
    groups;
    throw new Error('Not implemented');
  }

  deleteAll(): Promise<void> {
    return this.sheetsService.spreadsheets.values
        .clear({
          ...this.sheetRange,
        })
        .then();
  }
}

export class SheetsOnlyCategoriesService implements RWService<Category> {
  constructor(
      readonly sheetsService: sheets_v4.Sheets, readonly sheetRange: SheetRange,
      readonly factory: (row: any[]) => Category,
      readonly serializer: (group: Category) => any[]) {}

  getByIds(...ids: string[]): Promise<Category[]> {
    ids;
    throw new Error('Not implemented, try using cached service.');
  }

  save(row: Category): Promise<Category> {
    return this.saveAll([row]).then((rows) => rows[0]);
  }

  update(category: Category): Promise<Category> {
    category;
    throw new Error('Not implemented');
  }

  delete(id: string): Promise<void> {
    id;
    throw new Error('Not implemented');
  }

  getAll(): Promise<Category[]> {
    return this.sheetsService.spreadsheets.values.get(this.sheetRange)
        .then((val) => val.data.values!.map(this.factory));
  }

  saveAll(categories: Category[]): Promise<Category[]> {
    return this.sheetsService.spreadsheets.values
        .append({
          ...this.sheetRange,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: categories.map(this.serializer),
          }
        })
        .then(() => categories);
  }

  updateAll(categories: Category[]): Promise<Category[]> {
    categories;
    throw new Error('Not implemented');
  }

  deleteAll(): Promise<void> {
    return this.sheetsService.spreadsheets.values
        .clear({
          ...this.sheetRange,
        })
        .then();
  }
}
