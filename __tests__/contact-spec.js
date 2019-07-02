import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Contact from '../src/models/contact';

describe('Contact', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    testContext.connection.request = jest.fn(() => {
      return Promise.resolve();
    });
    testContext.contact = new Contact(testContext.connection);
  });

  describe('save', () => {
    test('should do a POST request if the contact has no id', done => {
      testContext.contact.id = undefined;
      testContext.contact.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          body: {
            id: undefined,
            object: 'contact',
            account_id: undefined,
            given_name: undefined,
            middle_name: undefined,
            surname: undefined,
            suffix: undefined,
            nickname: undefined,
            birthday: undefined,
            job_title: undefined,
            manager_name: undefined,
            company_name: undefined,
            office_location: undefined,
            notes: undefined,
            picture_url: undefined,
            emails: [],
            im_addresses: [],
            physical_addresses: [],
            phone_numbers: [],
            web_pages: [],
            groups:[],
          },
          qs: {},
          path: '/contacts',
        });
        done();
      });
    });
    test('should do a POST request if the contact has no id', done => {
      testContext.contact.id = '1257';
      testContext.contact.save().then(() => {
        expect(testContext.connection.request).toHaveBeenCalledWith({
          method: 'PUT',
          body: {
            id: '1257',
            object: 'contact',
            account_id: undefined,
            given_name: undefined,
            middle_name: undefined,
            surname: undefined,
            suffix: undefined,
            nickname: undefined,
            birthday: undefined,
            job_title: undefined,
            manager_name: undefined,
            company_name: undefined,
            office_location: undefined,
            notes: undefined,
            picture_url: undefined,
            emails: [],
            im_addresses: [],
            physical_addresses: [],
            phone_numbers: [],
            web_pages: [],
            groups:[],
          },
          qs: {},
          path: '/contacts/1257',
        });
        done();
      });
    });
  });

  describe('picture url', () => {
    test('should make GET request for the picture', () => {
      testContext.contact.id = 'a_pic_url';
      testContext.contact.getPicture();
      expect(testContext.connection.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/contacts/a_pic_url/picture',
        qs: {},
      });
    });
  });

  describe('when the request succeeds', () => {
    beforeEach(() => {
      testContext.connection.request = jest.fn(() => {
        const contactJSON = {
          id: '1257',
          object: 'contact',
          account_id: '1234',
          given_name: 'John',
          middle_name: 'Jacob',
          surname: 'Jingleheimer Schmidt',
          suffix: 'II',
          nickname: 'John',
          birthday: '2019-07-01',
          company_name: 'Life',
          job_title: 'artist',
          manager_name: 'April',
          office_location: 'SF, CA, USA',
          notes: 'lalala',
          picture_url: 'example.com',
          emails: [{'type': 'work', 'email': 'john@test.com'}],
          im_addresses: [{'type': 'yahoo', 'im_address': 'jjj'}],
          physical_addresses: [{'type': 'home', 'city': 'Boston'}],
          phone_numbers: [{'type': 'mobile', 'number': '555-444-3333'}],
          web_pages: [{'type': 'blog', 'url': 'johnblogs.com'}],
          groups: [{id: '123', 'object': 'contact', 'account_id': '1234', 'name': 'Fam', 'path': 'Fam'}],
          source: 'Contacts',
        };
        return Promise.resolve(contactJSON);
      });
    });

    test('should resolve with the contact object', done => {
      testContext.contact.save().then(contact => {
        console.log('THIS IS THE CONTACT', contact);
        expect(contact.id).toBe('1257');
        expect(contact.object).toBe('contact');
        expect(contact.accountId).toBe('1234');
        expect(contact.givenName).toBe('John');
        expect(contact.middleName).toBe('Jacob');
        expect(contact.surname).toBe('Jingleheimer Schmidt');
        expect(contact.suffix).toBe('II');
        expect(contact.nickname).toBe('John');
        expect(contact.birthday).toBe('2019-07-01');
        expect(contact.companyName).toBe('Life');
        expect(contact.jobTitle).toBe('artist');
        expect(contact.managerName).toBe('April');
        expect(contact.officeLocation).toBe('SF, CA, USA');
        expect(contact.notes).toBe('lalala');
        expect(contact.pictureUrl).toBe('example.com');
        expect(contact.emailAddresses[0].toJSON()).toEqual({'type': 'work', 'email': 'john@test.com'});
        expect(contact.imAddresses[0].toJSON()).toEqual({'type': 'yahoo', 'im_address': 'jjj'});
        expect(contact.physicalAddresses[0].toJSON()).toEqual({'type': 'home', 'city': 'Boston'});
        expect(contact.phoneNumbers[0].toJSON()).toEqual({'type': 'mobile', 'number': '555-444-3333'});
        expect(contact.webPages[0].toJSON()).toEqual({'type': 'blog', 'url': 'johnblogs.com'});
        expect(contact.groups[0].toJSON()).toEqual({id: '123', 'object': 'contact', 'account_id': '1234', 'name': 'Fam', 'path': 'Fam'});
        expect(contact.source).toBe('Contacts');
        done();
      });
    });

    test('should call the callback with the contact object', done => {
      testContext.contact.save((err, contact) => {
        expect(err).toBe(null);
        expect(contact.id).toBe('1257');
        expect(contact.givenName).toBe('John');
        expect(contact.middleName).toBe('Jacob');
        expect(contact.surname).toBe('Jingleheimer Schmidt');
        done();
      });
    });
  });

  describe('when the request fails', () => {
    beforeEach(() => {
      testContext.error = new Error('Network error');
      testContext.connection.request = jest.fn(() =>
        Promise.reject(testContext.error)
      );
    });

    test('should reject with the error', done => {
      testContext.contact.save().catch(err => {
        expect(err).toBe(testContext.error);
        done();
      });
    });

    test('should call the callback with the error', done => {
      testContext.contact
        .save((err, contact) => {
          expect(err).toBe(testContext.error);
          expect(contact).toBe(undefined);
          done();
        })
        .catch(() => {});
    });
  });
});
