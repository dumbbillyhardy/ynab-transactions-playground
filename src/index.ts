import {promises as fs} from 'fs';
import {google} from 'googleapis';
import {API} from 'ynab';

import {Account, Budget, CategoryGroup, Transaction} from './beans';
import {Config} from './config';
import {TopLevelMigrator} from './dao/migrator';
import {SheetsAccountDAO, SheetsBudgetDAO, SheetsCategoriesDAO, SheetsTransactionsDAO} from './dao/sheets';
import {YnabAccountsDAO} from './dao/ynab/accounts';
import {YnabCategoriesDAO} from './dao/ynab/categories';
import {YnabTransactionsDAO} from './dao/ynab/transactions';
import {SheetConfig} from './sheet_config';
import {FileSystemTokenStorage, SheetsAuth, TokenGenPromptsReadline} from './sheets_auth';

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
          new SheetConfig(config.aspireStorage.accounts);
      const customCategoriesSheetConfig =
          new SheetConfig(config.sheetsStorage.categories);

      const accessToken = process.argv[2];

      const ynabAPI = new API(accessToken);
      // const budgetService = new YnabBudgetDAO(ynabAPI);

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
        const sheetsBudgetService = new SheetsBudgetDAO(
            sheets, customBudgetSheetConfig.toSheetRange(),
            Budget.fromSheetsArray, (b: Budget) => b.toSheetsArray());
        sheetsBudgetService;

        // Accounts
        const sheetsAccountsService = new SheetsAccountDAO(
            sheets, customAccountsSheetConfig.toSheetRange(),
            Account.fromSheetsArray, (a: Account) => a.toAspireArray());
        const ynabAccountsDAO = new YnabAccountsDAO(ynabAPI, budget_id);
        const accountsMigrator = new TopLevelMigrator<Account>(
            ynabAccountsDAO, sheetsAccountsService);
        accountsMigrator;

        // Transactions
        const sheetsTransactionsService = new SheetsTransactionsDAO(
            sheets, customTransactionsSheetConfig.toSheetRange(),
            Transaction.fromSheetsArray, (t: Transaction) => t.toSheetsArray());
        const ynabTransactionsDAO = new YnabTransactionsDAO(ynabAPI, budget_id);
        const transactionsMigrator = new TopLevelMigrator<Transaction>(
            ynabTransactionsDAO, sheetsTransactionsService);
        transactionsMigrator;

        // Categories
        const ynabCategoriesDAO = new YnabCategoriesDAO(ynabAPI, budget_id);
        const sheetsCategoriesService = new SheetsCategoriesDAO(
            sheets, customCategoriesSheetConfig.toSheetRange(),
            () => [] as CategoryGroup[],
            (cs: CategoryGroup[]) => cs.flatMap(c => c.toSheetsArray()));
        const catgoriesMigrator = new TopLevelMigrator<CategoryGroup>(
            ynabCategoriesDAO, sheetsCategoriesService);
        catgoriesMigrator;

        catgoriesMigrator.migrate();
        // transactionsMigrator.migrate();
      });
    })
    .catch(console.log);
