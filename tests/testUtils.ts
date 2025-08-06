/* istanbul ignore file */
import { Readable } from 'stream';

export interface MockedFormData {
  append(key: string, value: any): void;
  _getAppendedData(): Record<string, any>;
}

export const mockResponse = (body: string, status = 200): any => {
  const headers: Record<string, string> = {};

  const headersObj = {
    entries() {
      return Object.entries(headers);
    },

    get(key: string) {
      return headers[key];
    },

    set(key: string, value: string) {
      headers[key] = value;
      return headers;
    },

    raw() {
      const rawHeaders: Record<string, string[]> = {};
      Object.keys(headers).forEach((key) => {
        rawHeaders[key] = [headers[key]];
      });
      return rawHeaders;
    },
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
      this.push(null);
    },
  });
};

export class MockFormData implements MockedFormData {
  private data: Record<string, any> = {};

  append(key: string, value: any) {
    this.data[key] = value;
  }

  _getAppendedData() {
    return this.data;
  }
}
