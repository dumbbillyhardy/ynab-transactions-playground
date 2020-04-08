import * as fs from 'fs';
import {google} from 'googleapis';
import {API} from 'ynab';

import {Account, Budget, Transaction} from './beans';
import {ChildMigrator} from './dao/migrator';
import {SheetsAccountDAO, SheetsBudgetDAO, SheetsTransactionsDAO} from './dao/sheets';
import {YnabAccountsDAO} from './dao/ynab/accounts';
import {YnabTransactionsDAO} from './dao/ynab/transactions';
import {SheetConfig} from './sheet_config';
import {FileSystemTokenStorage, SheetsAuth, TokenGenPromptsReadline} from './sheets_auth';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const customSpreadsheetId = '19tIbdPyrwrb_pLsp5QTV6y24RpptC9U-86agbmvupPI';
const customBudgetSheetConfig =
    new SheetConfig(customSpreadsheetId, 'Budgets', 'A', 'D', 2);
const customTransactionsSheetConfig =
    new SheetConfig(customSpreadsheetId, 'Transactions', 'B', 'G', 9);
const aspireSpreadsheetId = '1o4XJt1vCImrj2AR7IYnTJvz1JdVQhmhAE3aOsw6KfHQ';
const customAccountsSheetConfig =
    new SheetConfig(aspireSpreadsheetId, 'Configuration', 'H', 'H', 9, 23);

const accessToken = process.argv[2];

const ynabAPI = new API(accessToken);
// const budgetService = new YnabBudgetDAO(ynabAPI);
const ynabTransactionsDAO = new YnabTransactionsDAO(ynabAPI);
const ynabAccountsDAO = new YnabAccountsDAO(ynabAPI);



// Load client secrets from a local file.
new Promise<string>((res, rej) => {
  fs.readFile('credentials.json', {encoding: 'utf8'}, (err, content) => {
    if (err) {
      console.log('Error loading client secret file:', err);
      rej(err);
    }
    res(content);
  });
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
