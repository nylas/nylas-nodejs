import APIClient from '../../src/apiClient';
import { Drafts } from '../../src/resources/drafts';

describe('Draft list query serialization', () => {
  it('serializes all anyEmail addresses as one comma-separated query value', async () => {
    const apiClient = new APIClient({
      apiKey: 'test',
      apiUri: 'https://api.us.nylas.com',
      timeout: 30,
      headers: {},
    });
    const request = jest.spyOn(apiClient, 'request').mockResolvedValue({
      data: [],
      requestId: 'request-id',
    });
    const queryParams = {
      anyEmail: ['first@example.com', 'second@example.com'],
      subject: 'Example',
    };

    await new Drafts(apiClient).list({ identifier: 'grant-id', queryParams });

    const { url } = apiClient.requestOptions(request.mock.calls[0][0]);
    expect(url.searchParams.getAll('any_email')).toEqual([
      'first@example.com,second@example.com',
    ]);
    expect(url.searchParams.get('subject')).toBe('Example');
    expect(queryParams.anyEmail).toEqual([
      'first@example.com',
      'second@example.com',
    ]);
  });
});
