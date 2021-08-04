import RestfulModel from './restful-model';
import Attributes from './attributes';
import { Contact, EmailAddress, PhoneNumber, WebPage } from './contact';

class Link extends RestfulModel {
  description?: string;
  url?: string;

  toJSON() {
    return {
      description: this.description,
      url: this.url,
    };
  }
}

Link.collectionName = 'link';
Link.attributes = {
  description: Attributes.String({
    modelKey: 'description',
  }),
  url: Attributes.String({
    modelKey: 'url',
  }),
};

class Name extends RestfulModel {
  firstName?: string;
  lastName?: string;

  toJSON() {
    return {
      type: this.firstName,
      email: this.lastName,
    };
  }
}

Name.collectionName = 'name';
Name.attributes = {
  firstName: Attributes.String({
    modelKey: 'firstName',
    jsonKey: 'first_name',
  }),
  lastName: Attributes.String({
    modelKey: 'lastName',
    jsonKey: 'last_name',
  }),
};

export default class NeuralSignatureContact extends RestfulModel {
  jobTitles?: string[];
  links?: Link[];
  phoneNumbers?: string[];
  emails?: string[];
  names?: Name[];

  toJSON() {
    return {
      job_titles: this.jobTitles,
      links: this.links,
      phone_numbers: this.phoneNumbers,
      emails: this.emails,
      names: this.names ? this.names.map(name => name.toJSON()) : this.names,
    };
  }

  toContactObject(): Contact {
    const contact = new Contact(this.connection);

    if (this.names) {
      contact.givenName = this.names[0].firstName;
      contact.surname = this.names[0].lastName;
    }
    if (this.jobTitles) {
      contact.jobTitle = this.jobTitles[0];
    }
    if (this.emails) {
      const contactEmails: EmailAddress[] = [];
      this.emails.forEach(email =>
        contactEmails.push(
          new EmailAddress(this.connection, { type: 'personal', email: email })
        )
      );
      contact.emailAddresses = contactEmails;
    }
    if (this.phoneNumbers) {
      const contactNumbers: PhoneNumber[] = [];
      this.phoneNumbers.forEach(number =>
        contactNumbers.push(
          new PhoneNumber(this.connection, { type: 'mobile', number: number })
        )
      );
      contact.phoneNumbers = contactNumbers;
    }
    if (this.links) {
      const webPages: WebPage[] = [];
      this.links.forEach(link => {
        if (link['url']) {
          webPages.push(
            new WebPage(this.connection, { type: 'homepage', url: link['url'] })
          );
        }
      });
      contact.webPages = webPages;
    }

    return contact;
  }
}

NeuralSignatureContact.collectionName = 'signature_contact';
NeuralSignatureContact.attributes = {
  jobTitles: Attributes.StringList({
    modelKey: 'jobTitles',
    jsonKey: 'job_titles',
  }),
  links: Attributes.Collection({
    modelKey: 'links',
    itemClass: Link,
  }),
  phoneNumbers: Attributes.StringList({
    modelKey: 'phoneNumbers',
    jsonKey: 'phone_numbers',
  }),
  emails: Attributes.StringList({
    modelKey: 'emails',
  }),
  names: Attributes.Collection({
    modelKey: 'names',
    itemClass: Name,
  }),
};
