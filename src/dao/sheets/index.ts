import {Account, Budget, Transaction} from '../../beans';

import {SheetsChildDAO, SheetsTopLevelDAO} from './sheets';

export class SheetsBudgetDAO extends SheetsTopLevelDAO<Budget> {}
export class SheetsTransactionsDAO extends SheetsChildDAO<Transaction> {}
export class SheetsAccountDAO extends SheetsChildDAO<Account> {}
