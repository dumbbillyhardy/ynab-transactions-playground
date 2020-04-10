import {Account, Budget, Transaction} from '../../beans';

import {SheetsTopLevelDAO} from './sheets';

export class SheetsBudgetDAO extends SheetsTopLevelDAO<Budget> {}
export class SheetsTransactionsDAO extends SheetsTopLevelDAO<Transaction> {}
export class SheetsAccountDAO extends SheetsTopLevelDAO<Account> {}
export * from './categories';
