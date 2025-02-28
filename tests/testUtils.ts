/* istanbul ignore file */
import fetch from 'node-fetch';
import { Readable } from 'stream';

export interface MockedFormData {
  append(key: string, value: any): void;
  _getAppendedData(): Record<string, any>;
}

export const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

export const mockResponse = (body: string, status = 200): any => {
  const headersMap = new Map<string, string>();
  
  const headersObj = {
    entries: () => headersMap.entries(),
    get: (key: string) => headersMap.get(key),
    set: (key: string, value: string) => headersMap.set(key, value),
    raw: () => {
      const rawHeaders: Record<string, string[]> = {};
      headersMap.forEach((value, key) => {
        rawHeaders[key] = [value];
      });
      return rawHeaders;
    }
  };
  
  return {
    status,
    text: jest.fn().mockResolvedValue(body),
    json: jest.fn().mockResolvedValue(JSON.parse(body)),
    headers: headersObj,
  };
};

export const createReadableStream = (text: string): NodeJS.ReadableStream => {
  return new Readable({
    read(): void {
      this.push(text);
      this.push(null); // indicates EOF
    },
  });
};
