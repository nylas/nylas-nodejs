/* istanbul ignore file */
import { Readable } from 'stream';
import { vi } from 'vitest';

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
    ok: status >= 200 && status < 300,
    statusText: status === 200 ? 'OK' : 'Error',
    text: vi.fn().mockResolvedValue(body),
    json: vi.fn().mockResolvedValue(JSON.parse(body)),
    headers: headersObj,
    url: '',
    type: 'basic',
    redirected: false,
    body: null,
    bodyUsed: false,
    clone: vi.fn().mockReturnThis(),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    blob: vi.fn().mockResolvedValue(new Blob()),
    formData: vi.fn().mockResolvedValue(new FormData()),
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
