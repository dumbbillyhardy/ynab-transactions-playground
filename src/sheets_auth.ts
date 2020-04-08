import {promises as fs} from 'fs';
import {OAuth2Client} from 'google-auth-library';
import {google} from 'googleapis';
import * as readline from 'readline';

export interface ClientInfo {
  client_secret: string;
  client_id: string;
  redirect_uris: string[];
}

export interface Credentials {
  installed: ClientInfo;
}

export interface CredentialStorage {
  read(): Promise<Credentials>;
  write(cred: Credentials): Promise<void>;
}

export interface TokenStorage {
  read(): Promise<OAuth2Client>;
  write(token: OAuth2Client): Promise<void>;
}

export class FileSystemTokenStorage implements TokenStorage {
  constructor(
      readonly token_file: string,
      readonly credentials: Credentials,
  ) {}

  read(): Promise<OAuth2Client> {
    // Load client secrets from a local file.
    return fs.readFile(this.token_file, {encoding: 'utf8'})
        .catch((err) => {
          throw new Error(`Error loading client secret file: ${err}`);
        })
        .then((token) => {
          const oAuth2Client = new google.auth.OAuth2(
              this.credentials.installed.client_id,
              this.credentials.installed.client_secret,
              this.credentials.installed.redirect_uris[0]);
          oAuth2Client.setCredentials(JSON.parse(token));
          return oAuth2Client;
        });
  }

  write(token: OAuth2Client): Promise<void> {
    return fs.writeFile(this.token_file, JSON.stringify(token)).then(() => {
      console.log('Token stored to ', this.token_file);
    });
  }
}

export interface TokenGenPrompts {
  get(authUrl: string): Promise<string>;
}

export class TokenGenPromptsReadline implements TokenGenPrompts {
  get(authUrl: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    return new Promise<string>((res) => {
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        res(code);
      });
    });
  }
}

export class SheetsAuth {
  constructor(
      readonly scopes: string[],
      readonly token_storage: TokenStorage,
      readonly token_gen_prompts: TokenGenPrompts,
  ) {}

  authorize(credentials: Credentials): Promise<OAuth2Client> {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client =
        new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    return this.token_storage.read().then((token) => token, (err) => {
      console.error(err);
      return this.getNewToken(oAuth2Client);
    });
  }

  getNewToken(oAuth2Client): Promise<OAuth2Client> {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
    });
    return this.token_gen_prompts.get(authUrl).then((code) => {
      return new Promise<OAuth2Client>((res, rej) => {
        oAuth2Client.getToken(code, (err, token) => {
          if (err) {
            console.error('Error while trying to retrieve access token', err);
            rej();
            return;
          }
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          this.token_storage.write(token).then(() => res(token), (err) => {
            console.error(err);
            res(token);
          });
        });
      });
    });
  }
}
