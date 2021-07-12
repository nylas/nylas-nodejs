import RestfulModel, { SaveCallback } from './restful-model';
import Attributes from './attributes';

export class EmailAddress extends RestfulModel {
  type?: string;
  email?: string;

  toJSON() {
    return {
      type: this.type,
      email: this.email,
    };
  }
}

EmailAddress.collectionName = 'email_addresses';
EmailAddress.attributes = {
  ...RestfulModel.attributes,
  type: Attributes.String({
    modelKey: 'type',
  }),
  email: Attributes.String({
    modelKey: 'email',
  }),
};

class IMAddress extends RestfulModel {
  type?: string;
  imAddress?: string;

  toJSON() {
    return {
      type: this.type,
      im_address: this.imAddress,
    };
  }
}

IMAddress.collectionName = 'im_addresses';
IMAddress.attributes = {
  ...RestfulModel.attributes,
  type: Attributes.String({
    modelKey: 'type',
  }),
  imAddress: Attributes.String({
    modelKey: 'imAddress',
    jsonKey: 'im_address',
  }),
};

class PhysicalAddress extends RestfulModel {
  type?: string;
  format?: string;
  address?: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;

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

PhysicalAddress.collectionName = 'physical_addresses';
PhysicalAddress.attributes = {
  ...RestfulModel.attributes,
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

export class PhoneNumber extends RestfulModel {
  type?: string;
  number?: string;

  toJSON() {
    return {
      type: this.type,
      number: this.number,
    };
  }
}

PhoneNumber.collectionName = 'phone_numbers';
PhoneNumber.attributes = {
  ...RestfulModel.attributes,
  type: Attributes.String({
    modelKey: 'type',
  }),
  number: Attributes.String({
    modelKey: 'number',
  }),
};

export class WebPage extends RestfulModel {
  type?: string;
  url?: string;

  toJSON() {
    const json = {
      type: this.type,
      url: this.url,
    };
    return json;
  }
}

WebPage.collectionName = 'web_pages';
WebPage.attributes = {
  ...RestfulModel.attributes,
  type: Attributes.String({
    modelKey: 'type',
  }),
  url: Attributes.String({
    modelKey: 'url',
  }),
};

export class Group extends RestfulModel {
  type?: string;
  path?: string;
}

Group.collectionName = 'groups';
Group.attributes = {
  ...RestfulModel.attributes,
  name: Attributes.String({
    modelKey: 'name',
  }),
  path: Attributes.String({
    modelKey: 'path',
  }),
};

export class Contact extends RestfulModel {
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

  save(params: {} | SaveCallback = {}, callback?: SaveCallback) {
    return this._save(params, callback);
  }

  getPicture(
    params: { [key: string]: any } = {},
    callback?: (error: Error | null, result?: any) => void
  ) {
    return this._get(params, callback, '/picture');
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
