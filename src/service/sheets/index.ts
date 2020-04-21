import {Account, Budget, Category, CategoryGroup, Transaction} from '../../beans';

import {SheetsTopLevelService} from './sheets';

export class SheetsBudgetService extends SheetsTopLevelService<Budget> {}
export class SheetsTransactionsService extends
    SheetsTopLevelService<Transaction> {}
export class SheetsAccountService extends SheetsTopLevelService<Account> {}
export class SheetsCategoryGroupsService extends
    SheetsTopLevelService<CategoryGroup> {}
export class SheetsCategoriesService extends SheetsTopLevelService<Category> {}
