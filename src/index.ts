import * as fs from 'fs';
import {OAuth2Client} from 'google-auth-library';
import {google} from 'googleapis';
import * as readline from 'readline';
import {API} from 'ynab';

import {Budget} from './beans/budget';
import {Transaction} from './beans/transaction';
import {SheetsBudgetDAO, SheetsTransactionsDAO} from './dao/sheets';
import {YnabTransactionsDAO} from './dao/ynab/transactions';
import {SheetRangeBuilder} from './sheet_range';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const spreadsheetId = '19tIbdPyrwrb_pLsp5QTV6y24RpptC9U-86agbmvupPI';
const transSpreadsheetId = '1o4XJt1vCImrj2AR7IYnTJvz1JdVQhmhAE3aOsw6KfHQ';
const budgetRange = 'A2:D';
const transactionsRange = 'B9:G';
const accessToken = process.argv[2];

const ynabAPI = new API(accessToken);
// const budgetService = new YnabBudgetDAO(ynabAPI);
const transactionsService = new YnabTransactionsDAO(ynabAPI);

// Load client secrets from a local file.
fs.readFile('credentials.json', {encoding: 'utf8'}, (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content))
      .then((auth) => {
        const sheets = google.sheets({version: 'v4', auth});

        // Budget
        const budgetRangeBuilder =
            new SheetRangeBuilder(budgetRange, spreadsheetId)
                .withSheetPrefix('Budgets');
        const sheetsBudgetService = new SheetsBudgetDAO(
            sheets, budgetRangeBuilder, Budget.fromSheetsArray,
            (b: Budget) => b.toSheetsArray());

        // Transactions
        const transactionsRangeBuilder =
            new SheetRangeBuilder(transactionsRange, transSpreadsheetId)
                .withSheetPrefix('Transactions');
        const sheetsTransactionsService = new SheetsTransactionsDAO(
            sheets, transactionsRangeBuilder, Transaction.fromSheetsArray,
            (parent_id: string, t: Transaction) => {
              parent_id;
              return t.toAspire();
            });

        return sheetsBudgetService.getAll().then((budgets) => {
          return Promise.all(
              budgets.filter(b => b.name === 'Billy')
                  .map(
                      b => transactionsService.getAllForParent(b.id).then(
                          (transactions) => {
                            return sheetsTransactionsService.saveAll(
                                b.id, transactions);
                          })));
        });
      })
      .catch(console.log);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 */
function authorize(credentials): Promise<OAuth2Client> {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client =
      new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  return new Promise<OAuth2Client>((res) => {
    fs.readFile(TOKEN_PATH, {encoding: 'utf8'}, (err, token) => {
      if (err) {
        res(getNewToken(oAuth2Client));
        return;
      }
      oAuth2Client.setCredentials(JSON.parse(token));
      res(oAuth2Client);
    });
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token
 *     for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client): Promise<OAuth2Client> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise<OAuth2Client>((res, rej) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('Error while trying to retrieve access token', err);
          rej();
          return;
        }
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) {
            console.error(err);
            rej();
            return;
          }
          console.log('Token stored to ', TOKEN_PATH);
        });
        res(oAuth2Client);
      });
    });
  });
}
