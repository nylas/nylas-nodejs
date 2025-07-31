import APIClient from '../../src/apiClient';
import { Contacts } from '../../src/resources/contacts';
jest.mock('../../src/apiClient');

describe('Contacts', () => {
  let apiClient: jest.Mocked<APIClient>;
  let contacts: Contacts;

  beforeAll(() => {
    apiClient = new APIClient({
      apiKey: 'apiKey',
      apiUri: 'https://test.api.nylas.com',
      timeout: 30,
      headers: {},
    }) as jest.Mocked<APIClient>;

    contacts = new Contacts(apiClient);
    apiClient.request.mockResolvedValue({});
  });

  describe('list', () => {
    it('should call apiClient.request with the correct params', async () => {
      await contacts.list({
        identifier: 'id123',
        queryParams: {
          email: 'test@email.com',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/contacts',
        queryParams: {
          email: 'test@email.com',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should paginate correctly if a nextCursor is present', async () => {
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [
          {
            id: 'id',
            name: 'name',
          },
        ],
        nextCursor: 'cursor123',
      });
      const contactList = await contacts.list({
        identifier: 'id123',
        queryParams: {
          email: 'test@email.com',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [
          {
            id: 'id',
            name: 'name',
          },
        ],
      });
      await contactList.next();

      expect(apiClient.request).toBeCalledTimes(2);
      expect(apiClient.request).toHaveBeenLastCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/contacts',
        queryParams: {
          email: 'test@email.com',
          pageToken: 'cursor123',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should not paginate if nextCursor is not present', async () => {
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [
          {
            id: 'id',
            name: 'name',
          },
        ],
      });
      const contactList = await contacts.list({
        identifier: 'id123',
        queryParams: {
          email: 'test@email.com',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
      apiClient.request.mockResolvedValueOnce({
        requestId: 'request123',
        data: [
          {
            id: 'id',
            name: 'name',
          },
        ],
      });
      await contactList.next();

      expect(apiClient.request).toBeCalledTimes(1);
    });

    //TODO::More iterator tests
  });

  describe('find', () => {
    it('should call apiClient.request with the correct params', async () => {
      await contacts.find({
        identifier: 'id123',
        contactId: 'contact123',
        queryParams: {
          profilePicture: true,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/contacts/contact123',
        queryParams: {
          profilePicture: true,
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });

    it('should URL encode identifier and contactId in find', async () => {
      await contacts.find({
        identifier: 'id 123',
        contactId: 'contact/123',
        queryParams: {},
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/contacts/contact%2F123',
        })
      );
    });

    it('should not double encode already-encoded identifier and contactId in find', async () => {
      await contacts.find({
        identifier: 'id%20123',
        contactId: 'contact%2F123',
        queryParams: {},
        overrides: {},
      });
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/v3/grants/id%20123/contacts/contact%2F123',
        })
      );
    });
  });

  describe('create', () => {
    it('should call apiClient.request with the correct params', async () => {
      await contacts.create({
        identifier: 'id123',
        requestBody: {
          displayName: 'Test',
          birthday: '1960-12-31',
          companyName: 'Nylas',
          emails: [
            {
              email: 'test@gmail.com',
              type: 'home',
            },
          ],
          givenName: 'Test',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'POST',
        path: '/v3/grants/id123/contacts',
        body: {
          displayName: 'Test',
          birthday: '1960-12-31',
          companyName: 'Nylas',
          emails: [
            {
              email: 'test@gmail.com',
              type: 'home',
            },
          ],
          givenName: 'Test',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('update', () => {
    it('should call apiClient.request with the correct params', async () => {
      await contacts.update({
        identifier: 'id123',
        contactId: 'contact123',
        requestBody: {
          birthday: '1960-12-31',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/v3/grants/id123/contacts/contact123',
        body: {
          birthday: '1960-12-31',
        },
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('destroy', () => {
    it('should call apiClient.request with the correct params', async () => {
      await contacts.destroy({
        identifier: 'id123',
        contactId: 'contact123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'DELETE',
        path: '/v3/grants/id123/contacts/contact123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });

  describe('contact group', () => {
    it('should call apiClient.request with the correct params', async () => {
      await contacts.groups({
        identifier: 'id123',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/id123/contacts/groups',
        overrides: {
          apiUri: 'https://test.api.nylas.com',
          headers: { override: 'bar' },
        },
      });
    });
  });
});
