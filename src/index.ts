import {promises as fs} from 'fs';
import {google} from 'googleapis';
import {API} from 'ynab';

import {Account, Budget, Transaction} from './beans';
import {config} from './config';
import {ChildMigrator} from './dao/migrator';
import {SheetsAccountDAO, SheetsBudgetDAO, SheetsTransactionsDAO} from './dao/sheets';
import {YnabAccountsDAO} from './dao/ynab/accounts';
import {YnabTransactionsDAO} from './dao/ynab/transactions';
import {SheetConfig} from './sheet_config';
import {FileSystemTokenStorage, SheetsAuth, TokenGenPromptsReadline} from './sheets_auth';


const SCOPES = config.sheetsAuth.scopes;
const TOKEN_PATH = config.sheetsAuth.tokenPath;

const customBudgetSheetConfig = new SheetConfig(config.sheetsStorage.budget);
const customTransactionsSheetConfig =
    new SheetConfig(config.sheetsStorage.transactions);
const customAccountsSheetConfig =
    new SheetConfig(config.aspireStorage.accounts);

const accessToken = process.argv[2];

const ynabAPI = new API(accessToken);
// const budgetService = new YnabBudgetDAO(ynabAPI);
const ynabTransactionsDAO = new YnabTransactionsDAO(ynabAPI);
const ynabAccountsDAO = new YnabAccountsDAO(ynabAPI);



// Load client secrets from a local file.
fs.readFile('credentials.json', {encoding: 'utf8'})
    .catch((err) => {
      throw new Error('Error loading client secret file:' + err);
    })
    .then((content) => {
      const credentials = JSON.parse(content);
      const tokenStorage = new FileSystemTokenStorage(TOKEN_PATH, credentials);
      const tokenGenPrompts = new TokenGenPromptsReadline();
      const sheetsAuth = new SheetsAuth(SCOPES, tokenStorage, tokenGenPrompts);
      // Authorize a client with credentials, then call the Google Sheets
      // API.
      return sheetsAuth.authorize(credentials);
    })
    .then((auth) => {
      const sheets = google.sheets({version: 'v4', auth});

      // Budget
      const sheetsBudgetService = new SheetsBudgetDAO(
          sheets, customBudgetSheetConfig.toSheetRange(),
          Budget.fromSheetsArray, (b: Budget) => b.toSheetsArray());

      // Accounts
      const sheetsAccountsService = new SheetsAccountDAO(
          sheets, customAccountsSheetConfig.toSheetRange(),
          Account.fromSheetsArray, (parent_id: string, a: Account) => {
            parent_id;
            return a.toAspireArray();
          });
      const accountsMigrator =
          new ChildMigrator<Account>(ynabAccountsDAO, sheetsAccountsService);

      // Transactions
      const sheetsTransactionsService = new SheetsTransactionsDAO(
          sheets, customTransactionsSheetConfig.toSheetRange(),
          Transaction.fromSheetsArray, (parent_id: string, t: Transaction) => {
            parent_id;
            return t.toAspire();
          });

      // Migrator
      const transactionsMigrator = new ChildMigrator<Transaction>(
          ynabTransactionsDAO, sheetsTransactionsService);
      transactionsMigrator;

      return sheetsBudgetService.getAll().then((budgets) => {
        return Promise.all(budgets
                               .filter(b => b.name === 'Billy')
                               //.map(b => transactionsMigrator.migrate(b.id)));
                               .map(b => accountsMigrator.migrate(b.id)));
      });
    })
    .catch(console.log);
