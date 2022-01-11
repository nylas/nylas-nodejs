import NylasConnection from '../nylas-connection';
import Model from './model';
import Attributes from './attributes';
import Account from './account';

export enum Scope {
  Email = 'email',
  EmailModify = 'email.modify',
  EmailReadOnly = 'email.read_only',
  EmailSend = 'email.send',
  EmailFoldersAndLabels = 'email.folders_and_labels',
  EmailMetadata = 'email.metadata',
  EmailDrafts = 'email.drafts',
  Calendar = 'calendar',
  CalendarReadOnly = 'calendar.read_only',
  RoomResourcesReadOnly = 'room_resources.read_only',
  Contacts = 'contacts',
  ContactsReadOnly = 'contacts.read_only',
}

export type VirtualCalendarProperties = {
  name: string;
  emailAddress: string;
  clientId: string;
  scopes: Scope[];
  settings?: Record<string, string>;
};

export class VirtualCalendar extends Model
  implements VirtualCalendarProperties {
  provider = 'nylas';
  name = '';
  emailAddress = '';
  clientId = '';
  scopes: Scope[] = [];
  settings = {};

  constructor(props?: VirtualCalendarProperties) {
    super();
    this.initAttributes(props);
  }
}
VirtualCalendar.attributes = {
  provider: Attributes.String({
    modelKey: 'provider',
  }),
  clientId: Attributes.String({
    modelKey: 'clientId',
    jsonKey: 'client_id',
  }),
  emailAddress: Attributes.String({
    modelKey: 'emailAddress',
    jsonKey: 'email',
  }),
  name: Attributes.String({
    modelKey: 'name',
  }),
  scopes: Attributes.EnumList({
    modelKey: 'scopes',
    itemClass: Scope,
  }),
  settings: Attributes.Object({
    modelKey: 'settings',
  }),
};

export enum NativeAuthenticationProvider {
  Gmail = 'gmail',
  Yahoo = 'yahoo',
  Exchange = 'exchange',
  Outlook = 'outlook',
  Imap = 'imap',
  Icloud = 'icloud',
  Hotmail = 'hotmail',
  Aol = 'aol',
  Office365 = 'office365',
}

export type NativeAuthenticationProperties = VirtualCalendarProperties & {
  settings: Record<string, string>;
  provider: NativeAuthenticationProvider;
};

type AuthorizationCode = {
  code: string;
};

export class NativeAuthentication extends Model
  implements NativeAuthenticationProperties {
  clientId = '';
  name = '';
  emailAddress = '';
  provider = NativeAuthenticationProvider.Gmail;
  settings = {};
  scopes: Scope[] = [];

  constructor(props?: NativeAuthenticationProperties) {
    super();
    this.initAttributes(props);
  }

  toJSON(): Record<string, unknown> {
    const json = super.toJSON();
    json['scopes'] = this.scopes.join();
    return json;
  }

  fromJSON(json: Record<string, any>): this {
    if (json['scopes']) {
      json['scopes'] = json['scopes'].split(',');
    }
    return super.fromJSON(json);
  }
}
NativeAuthentication.attributes = {
  clientId: Attributes.String({
    modelKey: 'clientId',
    jsonKey: 'client_id',
  }),
  name: Attributes.String({
    modelKey: 'name',
  }),
  emailAddress: Attributes.String({
    modelKey: 'emailAddress',
    jsonKey: 'email_address',
  }),
  provider: Attributes.Enum({
    modelKey: 'provider',
    itemClass: NativeAuthenticationProvider,
  }),
  scopes: Attributes.EnumList({
    modelKey: 'scopes',
    itemClass: Scope,
  }),
  settings: Attributes.Object({
    modelKey: 'settings',
  }),
};

export default class Connect {
  connection: NylasConnection;
  clientId: string;
  clientSecret: string;

  constructor(
    connection: NylasConnection,
    clientId: string,
    clientSecret: string
  ) {
    this.connection = connection;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  authorize(
    auth: VirtualCalendarProperties | NativeAuthenticationProperties
  ): Promise<AuthorizationCode> {
    // https://docs.nylas.com/reference#connectauthorize
    if (!this.clientId) {
      throw new Error(
        'connect.authorize() cannot be called until you provide a clientId via Nylas.config()'
      );
    }

    let authClass: VirtualCalendar | NativeAuthentication;
    if (!auth.clientId) {
      auth.clientId = this.clientId;
    }
    if (auth.hasOwnProperty('scopes')) {
      authClass = new NativeAuthentication(
        auth as NativeAuthenticationProperties
      );
    } else {
      authClass = new VirtualCalendar(auth as VirtualCalendarProperties);
    }

    return this.connection
      .request({
        method: 'POST',
        path: '/connect/authorize',
        body: authClass.toJSON(),
      })
      .then((json: AuthorizationCode) => {
        return json;
      });
  }

  token(code: string): Promise<Account> {
    // https://docs.nylas.com/reference#connecttoken
    if (!this.clientId) {
      throw new Error(
        'connect.token() cannot be called until you provide a clientId via Nylas.config()'
      );
    }
    if (!this.clientSecret) {
      throw new Error(
        'connect.token() cannot be called until you provide a clientSecret via Nylas.config()'
      );
    }
    return this.connection
      .request({
        method: 'POST',
        path: '/connect/token',
        body: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
        },
      })
      .then(json => {
        return new Account(this.connection).fromJSON(json);
      });
  }
}
