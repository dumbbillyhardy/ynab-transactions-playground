import {Account, Budget, Transaction} from '../../beans';

import {SheetsTopLevelService} from './sheets';

export class SheetsBudgetService extends SheetsTopLevelService<Budget> {}
export class SheetsTransactionsService extends
    SheetsTopLevelService<Transaction> {}
export class SheetsAccountService extends SheetsTopLevelService<Account> {}
export * from './categories';
