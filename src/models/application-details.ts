import Model from './model';
import Attributes from './attributes';

export type ApplicationDetailsProperties = {
  applicationName?: string;
  iconUrl?: string;
  redirectUris?: string[];
};

export default class ApplicationDetails extends Model
  implements ApplicationDetailsProperties {
  applicationName = '';
  iconUrl = '';
  redirectUris: string[] = [];

  constructor(props?: ApplicationDetailsProperties) {
    super();
    this.initAttributes(props);
  }
}

ApplicationDetails.attributes = {
  applicationName: Attributes.String({
    modelKey: 'applicationName',
    jsonKey: 'application_name',
  }),
  iconUrl: Attributes.String({
    modelKey: 'iconUrl',
    jsonKey: 'icon_url',
  }),
  redirectUris: Attributes.StringList({
    modelKey: 'redirectUris',
    jsonKey: 'redirect_uris',
  }),
};
