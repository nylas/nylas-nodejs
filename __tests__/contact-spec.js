import NylasConnection from '../src/nylas-connection';
import { Contact } from '../src/models/contact';
import Nylas from '../src/nylas';
import fetch from 'node-fetch';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Contact', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext = {};
    testContext.connection = new NylasConnection('123', { clientId: 'foo' });
    jest.spyOn(testContext.connection, 'request');

    const response = receivedBody => {
      return {
        status: 200,
        buffer: () => {
          return Promise.resolve('body');
        },
        json: () => {
          return Promise.resolve(receivedBody);
        },
        headers: new Map(),
      };
    };

    fetch.mockImplementation(req => Promise.resolve(response(req.body)));
    testContext.contact = new Contact(testContext.connection);
  });

  describe('save', () => {
    test('should do a POST request if the contact has no id', done => {
      testContext.contact.id = undefined;
      return testContext.contact.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/contacts'
        );
        expect(options.method).toEqual('POST');
        expect(JSON.parse(options.body)).toEqual({
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
          groups: [],
          source: undefined,
        });
        done();
      });
    });
    test('should do a PUT request if the contact has id', done => {
      testContext.contact.id = '1257';
      return testContext.contact.save().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/contacts/1257'
        );
        expect(options.method).toEqual('PUT');
        expect(JSON.parse(options.body)).toEqual({
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
          groups: [],
          source: undefined,
        });
        done();
      });
    });
  });

  describe('picture url', () => {
    test('should make GET request for the picture', done => {
      testContext.contact.id = 'a_pic_url';
      return testContext.contact.getPicture().then(() => {
        const options = testContext.connection.request.mock.calls[0][0];
        expect(options.url.toString()).toEqual(
          'https://api.nylas.com/contacts/a_pic_url/picture'
        );
        expect(options.method).toEqual('GET');
        expect(options.body).toBeUndefined();
        done();
      });
    });
  });

  describe('when the request succeeds', () => {
    beforeEach(() => {
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
        emails: [{ type: 'work', email: 'john@test.com' }],
        im_addresses: [{ type: 'yahoo', im_address: 'jjj' }],
        physical_addresses: [{ type: 'home', city: 'Boston' }],
        phone_numbers: [{ type: 'mobile', number: '555-444-3333' }],
        web_pages: [{ type: 'blog', url: 'johnblogs.com' }],
        groups: [
          {
            id: '123',
            object: 'contact_group',
            account_id: '1234',
            name: 'Fam',
            path: 'Fam',
          },
        ],
        source: 'inbox',
      };
      testContext.contact = new Contact(testContext.connection, contactJSON);
    });

    test('should resolve with the contact object', done => {
      testContext.contact.save().then(contact => {
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
        expect(contact.emailAddresses[0].toJSON()).toEqual({
          type: 'work',
          email: 'john@test.com',
        });
        expect(contact.imAddresses[0].toJSON()).toEqual({
          type: 'yahoo',
          im_address: 'jjj',
        });
        expect(contact.physicalAddresses[0].toJSON()).toEqual({
          type: 'home',
          city: 'Boston',
        });
        expect(contact.phoneNumbers[0].toJSON()).toEqual({
          type: 'mobile',
          number: '555-444-3333',
        });
        expect(contact.webPages[0].toJSON()).toEqual({
          type: 'blog',
          url: 'johnblogs.com',
        });
        expect(contact.groups[0].toJSON()).toEqual({
          id: '123',
          object: 'contact_group',
          account_id: '1234',
          name: 'Fam',
          path: 'Fam',
        });
        expect(contact.source).toBe('inbox');
        done();
      });
    });

    test('should call the callback with the contact object', done => {
      return testContext.contact.save().then(contact => {
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
