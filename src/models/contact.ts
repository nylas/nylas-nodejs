import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';
import Model from './model';
import NylasConnection from '../nylas-connection';

export interface EmailAddressProperties {
  type: string;
  email: string;
}

export class EmailAddress extends Model implements EmailAddressProperties {
  type = '';
  email = '';

  constructor(props?: EmailAddressProperties) {
    super();
    this.initAttributes(props);
  }

  // TODO::Can probably remove toJSONs in classes that extend Model
  toJSON() {
    return {
      type: this.type,
      email: this.email,
    };
  }
}

EmailAddress.attributes = {
  type: Attributes.String({
    modelKey: 'type',
  }),
  email: Attributes.String({
    modelKey: 'email',
  }),
};

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IMAddressProperties {
  type: string;
  imAddress: string;
}

export class IMAddress extends Model implements IMAddressProperties {
  type = '';
  imAddress = '';

  constructor(props?: IMAddressProperties) {
    super();
    this.initAttributes(props);
  }

  toJSON() {
    return {
      type: this.type,
      im_address: this.imAddress,
    };
  }
}

IMAddress.attributes = {
  type: Attributes.String({
    modelKey: 'type',
  }),
  imAddress: Attributes.String({
    modelKey: 'imAddress',
    jsonKey: 'im_address',
  }),
};

// TODO::Check if "address" is deprecated
export interface PhysicalAddressProperties {
  type: string;
  format: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  address?: string;
}

class PhysicalAddress extends Model implements PhysicalAddressProperties {
  type = '';
  format = '';
  streetAddress = '';
  city = '';
  postalCode = '';
  state = '';
  country = '';
  address = '';

  constructor(props?: PhysicalAddressProperties) {
    super();
    this.initAttributes(props);
  }

  toJSON() {
    const json: { [key: string]: any } = {
      type: this.type,
      format: this.format,
    };
    if (this.format == 'unstructured') {
      json.address = this.address;
    } else {
      json.street_address = this.streetAddress;
      json.postal_code = this.postalCode;
      json.state = this.state;
      json.city = this.city;
      json.country = this.country;
    }
    return json;
  }
}

PhysicalAddress.attributes = {
  type: Attributes.String({
    modelKey: 'type',
  }),
  format: Attributes.String({
    modelKey: 'format',
  }),
  address: Attributes.String({
    modelKey: 'address',
  }),
  streetAddress: Attributes.String({
    modelKey: 'streetAddress',
    jsonKey: 'street_address',
  }),
  city: Attributes.String({
    modelKey: 'city',
  }),
  postalCode: Attributes.String({
    modelKey: 'postalCode',
    jsonKey: 'postal_code',
  }),
  state: Attributes.String({
    modelKey: 'state',
  }),
  country: Attributes.String({
    modelKey: 'country',
  }),
};

export interface PhoneNumberProperties {
  type: string;
  number: string;
}

export class PhoneNumber extends Model implements PhoneNumberProperties {
  type = '';
  number = '';

  constructor(props?: PhoneNumberProperties) {
    super();
    this.initAttributes(props);
  }

  toJSON() {
    return {
      type: this.type,
      number: this.number,
    };
  }
}

PhoneNumber.attributes = {
  type: Attributes.String({
    modelKey: 'type',
  }),
  number: Attributes.String({
    modelKey: 'number',
  }),
};

export interface WebPageProperties {
  type: string;
  url: string;
}

export class WebPage extends Model implements WebPageProperties {
  type = '';
  url = '';

  constructor(props?: WebPageProperties) {
    super();
    this.initAttributes(props);
  }

  toJSON() {
    const json = {
      type: this.type,
      url: this.url,
    };
    return json;
  }
}

WebPage.attributes = {
  type: Attributes.String({
    modelKey: 'type',
  }),
  url: Attributes.String({
    modelKey: 'url',
  }),
};

export interface GroupProperties {
  name: string;
  path: string;
  id?: string;
  accountId?: string;
  object?: string;
}

export class Group extends Model implements GroupProperties {
  name = '';
  path = '';
  id?: string;
  accountId?: string;
  object?: string;

  constructor(props?: GroupProperties) {
    super();
    this.initAttributes(props);
  }
}

Group.attributes = {
  name: Attributes.String({
    modelKey: 'name',
  }),
  path: Attributes.String({
    modelKey: 'path',
  }),
  id: Attributes.String({
    modelKey: 'id',
    readOnly: true,
  }),
  object: Attributes.String({
    modelKey: 'object',
    readOnly: true,
  }),
  accountId: Attributes.String({
    modelKey: 'accountId',
    jsonKey: 'account_id',
    readOnly: true,
  }),
};

export interface ContactProperties {
  givenName?: string;
  middleName?: string;
  surname?: string;
  suffix?: string;
  nickname?: string;
  birthday?: string;
  companyName?: string;
  jobTitle?: string;
  officeLocation?: string;
  notes?: string;
  pictureUrl?: string;
  emailAddresses?: EmailAddressProperties[];
  imAddresses?: IMAddressProperties[];
  physicalAddresses?: PhysicalAddressProperties[];
  phoneNumbers?: PhoneNumberProperties[];
  webPages?: WebPageProperties[];
  groups?: GroupProperties[];
  source?: string;
}

export class Contact extends RestfulModel implements ContactProperties {
  givenName?: string;
  middleName?: string;
  surname?: string;
  suffix?: string;
  nickname?: string;
  birthday?: string;
  companyName?: string;
  jobTitle?: string;
  officeLocation?: string;
  notes?: string;
  pictureUrl?: string;
  emailAddresses?: EmailAddress[];
  imAddresses?: IMAddress[];
  physicalAddresses?: PhysicalAddress[];
  phoneNumbers?: PhoneNumber[];
  webPages?: WebPage[];
  groups?: Group[];
  source?: string;

  constructor(connection: NylasConnection, props?: ContactProperties) {
    super(connection);
    this.initAttributes(props);
  }

  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return super.save(params, callback);
  }

  getPicture(
    params: { [key: string]: any } = {},
    callback?: (error: Error | null, result?: any) => void
  ) {
    return this.get(params, callback, '/picture');
  }
}

Contact.collectionName = 'contacts';
Contact.attributes = {
  ...RestfulModel.attributes,
  givenName: Attributes.String({
    modelKey: 'givenName',
    jsonKey: 'given_name',
  }),
  middleName: Attributes.String({
    modelKey: 'middleName',
    jsonKey: 'middle_name',
  }),
  surname: Attributes.String({
    modelKey: 'surname',
  }),
  suffix: Attributes.String({
    modelKey: 'suffix',
  }),
  nickname: Attributes.String({
    modelKey: 'nickname',
  }),
  birthday: Attributes.String({
    modelKey: 'birthday',
  }),
  companyName: Attributes.String({
    modelKey: 'companyName',
    jsonKey: 'company_name',
  }),
  jobTitle: Attributes.String({
    modelKey: 'jobTitle',
    jsonKey: 'job_title',
  }),
  managerName: Attributes.String({
    modelKey: 'managerName',
    jsonKey: 'manager_name',
  }),
  officeLocation: Attributes.String({
    modelKey: 'officeLocation',
    jsonKey: 'office_location',
  }),
  notes: Attributes.String({
    modelKey: 'notes',
  }),
  pictureUrl: Attributes.String({
    modelKey: 'pictureUrl',
    jsonKey: 'picture_url',
  }),
  emailAddresses: Attributes.Collection({
    modelKey: 'emailAddresses',
    jsonKey: 'emails',
    itemClass: EmailAddress,
  }),
  imAddresses: Attributes.Collection({
    modelKey: 'imAddresses',
    jsonKey: 'im_addresses',
    itemClass: IMAddress,
  }),
  physicalAddresses: Attributes.Collection({
    modelKey: 'physicalAddresses',
    jsonKey: 'physical_addresses',
    itemClass: PhysicalAddress,
  }),
  phoneNumbers: Attributes.Collection({
    modelKey: 'phoneNumbers',
    jsonKey: 'phone_numbers',
    itemClass: PhoneNumber,
  }),
  webPages: Attributes.Collection({
    modelKey: 'webPages',
    jsonKey: 'web_pages',
    itemClass: WebPage,
  }),
  groups: Attributes.Collection({
    modelKey: 'groups',
    itemClass: Group,
  }),
  source: Attributes.String({
    modelKey: 'source',
  }),
};
