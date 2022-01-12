import Model from './model';
import Attributes from './attributes';

export type AccessTokenProperties = {
  accessToken: string;
  accountId: string;
  emailAddress: string;
  provider: string;
  tokenType: string;
};

export default class AccessToken extends Model
  implements AccessTokenProperties {
  accessToken = '';
  accountId = '';
  emailAddress = '';
  provider = '';
  tokenType = 'bearer';

  constructor(props?: AccessTokenProperties) {
    super();
    this.initAttributes(props);
  }
}

AccessToken.attributes = {
  accessToken: Attributes.String({
    modelKey: 'accessToken',
    jsonKey: 'access_token',
  }),
  accountId: Attributes.String({
    modelKey: 'accountId',
    jsonKey: 'account_id',
  }),
  emailAddress: Attributes.String({
    modelKey: 'emailAddress',
    jsonKey: 'email_address',
  }),
  provider: Attributes.String({
    modelKey: 'provider',
  }),
  tokenType: Attributes.String({
    modelKey: 'tokenType',
    jsonKey: 'token_type',
  }),
};
