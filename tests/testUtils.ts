import fetch from 'node-fetch';
import { Readable } from 'stream';

export interface MockedFormData {
  append(key: string, value: any): void;
  _getAppendedData(): Record<string, any>;
}

export const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

export const mockResponse = (body: string, status = 200): any => {
  return {
    status,
    text: jest.fn().mockResolvedValue(body),
    json: jest.fn().mockResolvedValue(JSON.parse(body)),
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
