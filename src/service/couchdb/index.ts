import {Account, Budget, Transaction} from '../../beans';
import {CouchDbService} from './couchdb';

export * from './couchdb';

export class AccountCouchDbService extends CouchDbService<Account> {}
export class BudgetCouchDbService extends CouchDbService<Budget> {}
export class TransactionsCouchDbService extends CouchDbService<Transaction> {}
