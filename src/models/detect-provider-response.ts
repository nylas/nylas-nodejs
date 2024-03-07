import Model from './model';
import Attributes, { Attribute } from './attributes';

export type DetectProviderResponseProperties = {
  authName: string;
  emailAddress: string;
  detected: boolean;
  providerName?: string;
  isImap?: boolean;
};

export default class DetectProviderResponse extends Model
  implements DetectProviderResponseProperties {
  authName = '';
  emailAddress = '';
  detected = false;
  provider?: string;
  isImap?: boolean;
  static attributes: Record<string, Attribute> = {
    authName: Attributes.String({
      modelKey: 'authName',
      jsonKey: 'auth_name',
    }),
    emailAddress: Attributes.String({
      modelKey: 'emailAddress',
      jsonKey: 'email_address',
    }),
    detected: Attributes.Boolean({
      modelKey: 'detected',
    }),
    provider: Attributes.String({
      modelKey: 'provider',
    }),
    isImap: Attributes.Boolean({
      modelKey: 'isImap',
      jsonKey: 'is_imap',
    }),
  };

  constructor(props?: DetectProviderResponseProperties) {
    super();
    this.initAttributes(props);
  }
}
