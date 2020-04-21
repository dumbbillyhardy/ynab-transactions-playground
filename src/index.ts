import {promises as fs} from 'fs';
import {google} from 'googleapis';
import PouchDB from 'pouchdb';
import {API} from 'ynab';

import {Account, Budget, Category, CategoryGroup, Transaction} from './beans';
import {Config} from './config';
import {CategoriesAndCategoryGroupsService} from './service/categories_service';
import {AccountCouchDbService, BudgetCouchDbService, TransactionsCouchDbService} from './service/couchdb';
import {FullMigrator} from './service/migrator';
import {SheetsAccountService, SheetsBudgetService, SheetsCategoriesService, SheetsCategoryGroupsService, SheetsTransactionsService} from './service/sheets';
import {YnabAccountsService} from './service/ynab/accounts';
import {YnabCategoriesService} from './service/ynab/categories';
import {YnabTransactionsService} from './service/ynab/transactions';
import {SheetConfig} from './sheet_config';
import {FileSystemTokenStorage, SheetsAuth, TokenGenPromptsReadline} from './sheets_auth';

const couchDbDatabases = {
  'accounts': 'pouchdata/accounts',
  'budgets': 'pouchdata/budgets',
  'transactions': 'pouchdata/transactions',
};


// Load client secrets from a local file.
fs.readFile('config.json', {encoding: 'utf8'})
    .catch((err) => {
      throw new Error('Error loading config secret file:' + err);
    })
    .then((content: string) => {
      const config: Config = JSON.parse(content);

      const SCOPES = config.sheetsAuth.scopes;
      const TOKEN_PATH = config.sheetsAuth.tokenPath;

      const customBudgetSheetConfig =
          new SheetConfig(config.sheetsStorage.budget);
      const customTransactionsSheetConfig =
          new SheetConfig(config.sheetsStorage.transactions);
      const customAccountsSheetConfig =
          new SheetConfig(config.sheetsStorage.accounts);
      const customCategoriesSheetConfig =
          new SheetConfig(config.sheetsStorage.categories);
      const customCategoryGroupsSheetConfig =
          new SheetConfig(config.sheetsStorage.categoryGroups);

      const accessToken = process.argv[2];

      const ynabAPI = new API(accessToken);
      // const budgetService = new YnabBudgetService(ynabAPI);
      const accountsCouch = new PouchDB(couchDbDatabases.accounts);
      const budgetsCouch = new PouchDB(couchDbDatabases.budgets);
      const transactionsCouch = new PouchDB(couchDbDatabases.transactions);

      const credentials = config.sheetsAuth.credentials;
      const tokenStorage = new FileSystemTokenStorage(TOKEN_PATH, credentials);
      const tokenGenPrompts = new TokenGenPromptsReadline();
      const sheetsAuth = new SheetsAuth(SCOPES, tokenStorage, tokenGenPrompts);
      // Authorize a client with credentials, then call the Google Sheets
      // API.
      return sheetsAuth.authorize(credentials).then((auth) => {
        const sheets = google.sheets({version: 'v4', auth});

        const budget_id = 'f1844444-8147-42d0-8f14-92fcdcdaa710';

        // Budget
        const couchDbBudgetService = new BudgetCouchDbService(
            budgetsCouch, (o) => new Budget(o), (b) => b.toSaveObject());
        couchDbBudgetService;
        const sheetsBudgetService = new SheetsBudgetService(
            sheets, customBudgetSheetConfig.toSheetRange(),
            Budget.fromSheetsArray, (b: Budget) => b.toSheetsArray());
        sheetsBudgetService;

        // Accounts
        const couchDbAccountService = new AccountCouchDbService(
            accountsCouch, (o) => new Account(o), (a) => a.toSaveObject());
        const sheetsAccountsService = new SheetsAccountService(
            sheets, customAccountsSheetConfig.toSheetRange(),
            Account.fromSheetsArray, (a: Account) => a.toSheetsArray());
        sheetsAccountsService;
        const ynabAccountsService = new YnabAccountsService(ynabAPI, budget_id);
        const accountsMigrator = new FullMigrator<Account>(
            ynabAccountsService, couchDbAccountService);
        accountsMigrator;

        // Transactions
        const couchDbTransactionsService = new TransactionsCouchDbService(
            transactionsCouch, (o) => new Transaction(o),
            (t) => t.toSaveObject());
        const sheetsTransactionsService = new SheetsTransactionsService(
            sheets, customTransactionsSheetConfig.toSheetRange(),
            Transaction.fromSheetsArray, (t: Transaction) => t.toSheetsArray());
        sheetsTransactionsService;
        const ynabTransactionsService =
            new YnabTransactionsService(ynabAPI, budget_id);
        ynabTransactionsService;
        const transactionsMigrator = new FullMigrator<Transaction>(
            sheetsTransactionsService, couchDbTransactionsService);
        transactionsMigrator;

        // Categories
        const sheetsCategoryGroupsService = new SheetsCategoryGroupsService(
            sheets, customCategoryGroupsSheetConfig.toSheetRange(),
            CategoryGroup.fromSheetsArray,
            (g: CategoryGroup) => g.toSheetsArray());
        const sheetsOnlyCategoriesService = new SheetsCategoriesService(
            sheets, customCategoriesSheetConfig.toSheetRange(),
            Category.fromSheetsArray, (c: Category) => c.toSheetsArray());
        const sheetsCategoriesService = new CategoriesAndCategoryGroupsService(
            sheetsCategoryGroupsService, sheetsOnlyCategoriesService);
        const ynabCategoriesService =
            new YnabCategoriesService(ynabAPI, budget_id);
        const categoriesMigrator = new FullMigrator<CategoryGroup>(
            ynabCategoriesService, sheetsCategoriesService);
        categoriesMigrator;

        return Promise.all([
          accountsMigrator.migrate(),
          categoriesMigrator.migrate(),
          transactionsMigrator.migrate(),
        ]);
      });
    })
    .catch(console.log);
