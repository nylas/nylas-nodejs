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
            email_addresses: [],
            im_addresses: [],
            physical_addresses: [],
            phone_numbers: [],
            web_pages: [],
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
            email_addresses: [],
            im_addresses: [],
            physical_addresses: [],
            phone_numbers: [],
            web_pages: [],
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
          given_name: 'John',
          middle_name: 'Jacob',
          surname: 'Jingleheimer Schmidt',
        };
        return Promise.resolve(contactJSON);
      });
    });

    test('should resolve with the contact object', done => {
      testContext.contact.save().then(contact => {
        expect(contact.id).toBe('1257');
        expect(contact.givenName).toBe('John');
        expect(contact.middleName).toBe('Jacob');
        expect(contact.surname).toBe('Jingleheimer Schmidt');
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
