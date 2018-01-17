import _ from 'underscore';

import RestfulModel from './restful-model';
import Attributes from './attributes';

class EmailAddress extends RestfulModel {
  toJSON() {
    const json = {
      type: this.type,
      email: this.email,
    };
    return json;
  }
}
EmailAddress.collectionName = 'email_addresses';
EmailAddress.attributes = _.extend({}, RestfulModel.attributes, {
  type: Attributes.String({
    modelKey: 'type',
  }),
  email: Attributes.String({
    modelKey: 'email',
  }),
});

class IMAddress extends RestfulModel {
  toJSON() {
    const json = {
      type: this.type,
      im_address: this.im_address,
    };
    return json;
  }
}
IMAddress.collectionName = 'im_addresses';
IMAddress.attributes = _.extend({}, RestfulModel.attributes, {
  type: Attributes.String({
    modelKey: 'type',
  }),
  imAddress: Attributes.String({
    modelKey: 'imAddress',
    jsonKey: 'im_address',
  }),
});

class PhysicalAddress extends RestfulModel {
  toJSON() {
    const json = {
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
PhysicalAddress.attributes = _.extend({}, RestfulModel.attributes, {
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
  }),
  city: Attributes.String({
    modelKey: 'city',
  }),
  postalCode: Attributes.String({
    modelKey: 'postalCode',
  }),
  state: Attributes.String({
    modelKey: 'state',
  }),
  country: Attributes.String({
    modelKey: 'country',
  }),
});

class PhoneNumber extends RestfulModel {
  toJSON() {
    const json = {
      type: this.type,
      number: this.number,
    };
    return json;
  }
}

PhoneNumber.collectionName = 'phone_numbers';
PhoneNumber.attributes = _.extend({}, RestfulModel.attributes, {
  type: Attributes.String({
    modelKey: 'type',
  }),
  number: Attributes.String({
    modelKey: 'number',
  }),
});

class WebPage extends RestfulModel {
  toJSON() {
    const json = {
      type: this.type,
      url: this.url,
    };
    return json;
  }
}
WebPage.collectionName = 'web_pages';
WebPage.attributes = _.extend({}, RestfulModel.attributes, {
  type: Attributes.String({
    modelKey: 'type',
  }),
  url: Attributes.String({
    modelKey: 'url',
  }),
});

export default class Contact extends RestfulModel {
  save(params = {}, callback = null) {
    return this._save(params, callback);
  }

  getPicture(params = {}, callback = null) {
    return this._get(params, callback, '/picture');
  }
}
Contact.collectionName = 'contacts';
Contact.attributes = _.extend({}, RestfulModel.attributes, {
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
  birthday: Attributes.Date({
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
    jsonKey: 'email_addresses',
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
});
