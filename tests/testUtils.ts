/* istanbul ignore file */
import { Readable } from 'stream';

export interface MockedFormData {
  append(key: string, value: any): void;
  _getAppendedData(): Record<string, any>;
}

export const mockResponse = (body: string, status = 200): any => {
  const headers: Record<string, string> = {};

  const headersObj = {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    entries() {
      return Object.entries(headers);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    get(key: string) {
      return headers[key];
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    set(key: string, value: string) {
      headers[key] = value;
      return headers;
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
    text: () => Promise.resolve(body),
    json: () => Promise.resolve(JSON.parse(body)),
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

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  append(key: string, value: any) {
    this.data[key] = value;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  _getAppendedData() {
    return this.data;
  }
}
