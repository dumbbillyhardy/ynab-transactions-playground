import {sheets_v4} from 'googleapis';

import {Category, CategoryGroup, CategoryGroupSaveObject} from '../../beans';
import {SheetRange} from '../../sheet_config';
import {TopLevelDAO} from '../interfaces';

export class SheetsCategoriesDAO implements TopLevelDAO<CategoryGroup> {
  constructor(
      readonly categoryGroupService: SheetsCategoryGroupsDAO,
      readonly categoryService: SheetsOnlyCategoriesDAO) {}

  getAll(): Promise<CategoryGroup[]> {
    return Promise
        .all([
          this.categoryGroupService.getAll(),
          this.categoryService.getAll(),
        ])
        .then(([groups, categories]) => {
          return groups.map(g => {
            return new CategoryGroup({
              budget_id: g.budget_id,
              id: g.id,
              name: g.name,
              categories: categories.filter(c => c.category.group_id === g.id)
            });
          });
        });
  }

  getById(): Promise<CategoryGroup> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(row: CategoryGroup): Promise<CategoryGroup> {
    return this.saveAll([row]).then((rows) => rows[0]);
  }

  update(): Promise<CategoryGroup> {
    throw new Error('Not implemented');
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
}

export class SheetsCategoryGroupsDAO implements
    TopLevelDAO<CategoryGroupSaveObject> {
  constructor(
      readonly sheetsService: sheets_v4.Sheets, readonly sheetRange: SheetRange,
      readonly factory: (row: any[]) => CategoryGroupSaveObject,
      readonly serializer: (group: CategoryGroupSaveObject) => any[]) {}

  getAll(): Promise<CategoryGroupSaveObject[]> {
    return this.sheetsService.spreadsheets.values.get(this.sheetRange)
        .then((val) => val.data.values!.map(this.factory));
  }

  getById(): Promise<CategoryGroupSaveObject> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(row: CategoryGroupSaveObject): Promise<CategoryGroupSaveObject> {
    return this.saveAll([row]).then((rows) => rows[0]);
  }

  update(): Promise<CategoryGroupSaveObject> {
    throw new Error('Not implemented');
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
}

export class SheetsOnlyCategoriesDAO implements TopLevelDAO<Category> {
  constructor(
      readonly sheetsService: sheets_v4.Sheets, readonly sheetRange: SheetRange,
      readonly factory: (row: any[]) => Category,
      readonly serializer: (group: Category) => any[]) {}

  getAll(): Promise<Category[]> {
    return this.sheetsService.spreadsheets.values.get(this.sheetRange)
        .then((val) => val.data.values!.map(this.factory));
  }

  getById(): Promise<Category> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(row: Category): Promise<Category> {
    return this.saveAll([row]).then((rows) => rows[0]);
  }

  update(): Promise<Category> {
    throw new Error('Not implemented');
  }

  saveAll(groups: Category[]): Promise<Category[]> {
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
}
