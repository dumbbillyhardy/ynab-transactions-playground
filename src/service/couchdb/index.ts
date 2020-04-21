import {Account, Budget, SaveAccountData, SaveBudgetData, SaveTransactionData, Transaction} from '../../beans';

import {CouchDbService} from './couchdb';

export * from './couchdb';

export class AccountCouchDbService extends
    CouchDbService<Account, SaveAccountData> {}
export class BudgetCouchDbService extends
    CouchDbService<Budget, SaveBudgetData> {}
export class TransactionsCouchDbService extends
    CouchDbService<Transaction, SaveTransactionData> {}
