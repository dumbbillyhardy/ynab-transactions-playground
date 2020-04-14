import {promises as fs} from 'fs';
import {google} from 'googleapis';
import {API} from 'ynab';

import {Account, Budget, Category, CategoryGroup, CategoryGroupSaveObject, Transaction} from './beans';
import {Config} from './config';
import {FullMigrator} from './service/migrator';
import {SheetsAccountService, SheetsBudgetService, SheetsTransactionsService} from './service/sheets';
import {SheetsCategoriesService, SheetsCategoryGroupsService, SheetsOnlyCategoriesService} from './service/sheets/categories';
import {YnabAccountsService} from './service/ynab/accounts';
import {YnabCategoriesService} from './service/ynab/categories';
import {YnabTransactionsService} from './service/ynab/transactions';
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
          new SheetConfig(config.sheetsStorage.accounts);
      const customCategoriesSheetConfig =
          new SheetConfig(config.sheetsStorage.categories);
      const customCategoryGroupsSheetConfig =
          new SheetConfig(config.sheetsStorage.categoryGroups);

      const accessToken = process.argv[2];

      const ynabAPI = new API(accessToken);
      // const budgetService = new YnabBudgetService(ynabAPI);

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
        const sheetsBudgetService = new SheetsBudgetService(
            sheets, customBudgetSheetConfig.toSheetRange(),
            Budget.fromSheetsArray, (b: Budget) => b.toSheetsArray());
        sheetsBudgetService;

        // Accounts
        const sheetsAccountsService = new SheetsAccountService(
            sheets, customAccountsSheetConfig.toSheetRange(),
            Account.fromSheetsArray, (a: Account) => a.toSheetsArray());
        const ynabAccountsService = new YnabAccountsService(ynabAPI, budget_id);
        const accountsMigrator = new FullMigrator<Account>(
            ynabAccountsService, sheetsAccountsService);
        accountsMigrator;

        // Transactions
        const sheetsTransactionsService = new SheetsTransactionsService(
            sheets, customTransactionsSheetConfig.toSheetRange(),
            Transaction.fromSheetsArray, (t: Transaction) => t.toSheetsArray());
        const ynabTransactionsService =
            new YnabTransactionsService(ynabAPI, budget_id);
        const transactionsMigrator = new FullMigrator<Transaction>(
            ynabTransactionsService, sheetsTransactionsService);
        transactionsMigrator;

        // Categories
        const sheetsCategoryGroupsService = new SheetsCategoryGroupsService(
            sheets, customCategoryGroupsSheetConfig.toSheetRange(),
            CategoryGroupSaveObject.fromSheetsArray,
            (g: CategoryGroupSaveObject) => g.toSheetsArray());
        const sheetsOnlyCategoryService = new SheetsOnlyCategoriesService(
            sheets, customCategoriesSheetConfig.toSheetRange(),
            Category.fromSheetsArray, (c: Category) => c.toSheetsArray());
        const sheetsCategoriesService = new SheetsCategoriesService(
            sheetsCategoryGroupsService, sheetsOnlyCategoryService);
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
