import {SheetConfigData} from './sheet_config';

export interface ClientInfo {
  client_secret: string;
  client_id: string;
  redirect_uris: string[];
}

export interface Credentials {
  installed: ClientInfo;
}

export interface SheetAuthConfig {
  credentials: Credentials;
  // If modifying these scopes, delete token.json.
  scopes: string[];
  // The file token.json stores the user"s access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  tokenPath: string;
}

export interface Config {
  sheetsAuth: SheetAuthConfig;
  sheetsStorage: {[key: string]: SheetConfigData};
  aspireStorage: {[key: string]: SheetConfigData};
}
