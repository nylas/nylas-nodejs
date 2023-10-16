import fetch from 'node-fetch';

export const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

export const mockResponse = (body: string, status = 200): any => {
  return {
    status,
    text: jest.fn().mockResolvedValue(body),
    json: jest.fn().mockResolvedValue(JSON.parse(body)),
  };
};
