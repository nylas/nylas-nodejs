import Attributes, { Attribute } from './attributes';
import Contact, { EmailAddress, PhoneNumber, WebPage } from './contact';
import Model from './model';
import NylasConnection from '../nylas-connection';

type LinkProperties = {
  description?: string;
  url?: string;
};

class Link extends Model implements LinkProperties {
  description = '';
  url = '';
  static attributes: Record<string, Attribute> = {
    description: Attributes.String({
      modelKey: 'description',
    }),
    url: Attributes.String({
      modelKey: 'url',
    }),
  };

  constructor(props?: LinkProperties) {
    super();
    this.initAttributes(props);
  }
}

type NameProperties = {
  firstName?: string;
  lastName?: string;
};

class Name extends Model implements NameProperties {
  firstName = '';
  lastName = '';
  static attributes: Record<string, Attribute> = {
    firstName: Attributes.String({
      modelKey: 'firstName',
      jsonKey: 'first_name',
    }),
    lastName: Attributes.String({
      modelKey: 'lastName',
      jsonKey: 'last_name',
    }),
  };

  constructor(props?: NameProperties) {
    super();
    this.initAttributes(props);
  }
}

export type NeuralSignatureContactProperties = {
  jobTitles?: string[];
  links?: Link[];
  phoneNumbers?: string[];
  emails?: string[];
  names?: Name[];
};

export default class NeuralSignatureContact extends Model
  implements NeuralSignatureContactProperties {
  jobTitles?: string[];
  links?: Link[];
  phoneNumbers?: string[];
  emails?: string[];
  names?: Name[];
  static attributes: Record<string, Attribute> = {
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

  constructor(props?: NeuralSignatureContactProperties) {
    super();
    this.initAttributes(props);
  }

  toJSON(): Record<string, unknown> {
    return {
      job_titles: this.jobTitles,
      links: this.links,
      phone_numbers: this.phoneNumbers,
      emails: this.emails,
      names: this.names ? this.names.map(name => name.toJSON()) : this.names,
    };
  }

  toContactObject(connection: NylasConnection): Contact {
    const contact = new Contact(connection);

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
        contactEmails.push(new EmailAddress({ type: 'personal', email: email }))
      );
      contact.emailAddresses = contactEmails;
    }
    if (this.phoneNumbers) {
      const contactNumbers: PhoneNumber[] = [];
      this.phoneNumbers.forEach(number =>
        contactNumbers.push(new PhoneNumber({ type: 'mobile', number: number }))
      );
      contact.phoneNumbers = contactNumbers;
    }
    if (this.links) {
      const webPages: WebPage[] = [];
      this.links.forEach(link => {
        if (link['url']) {
          webPages.push(new WebPage({ type: 'homepage', url: link['url'] }));
        }
      });
      contact.webPages = webPages;
    }

    return contact;
  }
}
