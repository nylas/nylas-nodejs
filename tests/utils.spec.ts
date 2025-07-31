import {
  createFileRequestBuilder,
  objKeysToCamelCase,
  objKeysToSnakeCase,
  makePathParams,
  encodeAttachmentContent,
  encodeAttachmentStreams,
} from '../src/utils';
import { Readable } from 'stream';
import { CreateAttachmentRequest } from '../src/models/attachments';

jest.mock('node:fs', () => {
  return {
    statSync: jest.fn(),
    createReadStream: jest.fn(),
  };
});

jest.mock('mime-types', () => {
  return {
    lookup: jest.fn(),
  };
});

describe('createFileRequestBuilder', () => {
  const MOCK_FILE_PATH = 'path/to/mock/file.txt';
  const mockedStatSync = {
    size: 100,
  };
  const mockedReadStream = {};

  beforeEach(() => {
    jest.resetAllMocks();
    require('node:fs').statSync.mockReturnValue(mockedStatSync);
    require('node:fs').createReadStream.mockReturnValue(mockedReadStream);
  });

  it('should return correct file details for a given filePath', () => {
    require('mime-types').lookup.mockReturnValue('text/plain');

    const result = createFileRequestBuilder(MOCK_FILE_PATH);

    expect(result).toEqual({
      filename: 'file.txt',
      contentType: 'text/plain',
      content: mockedReadStream,
      size: mockedStatSync.size,
    });
  });

  it('should default contentType to application/octet-stream if mime lookup fails', () => {
    require('mime-types').lookup.mockReturnValue(null);

    const result = createFileRequestBuilder(MOCK_FILE_PATH);

    expect(result.contentType).toBe('application/octet-stream');
  });

  it('should default contentType to application/octet-stream for files without extensions', () => {
    require('mime-types').lookup.mockReturnValue(null);

    const result = createFileRequestBuilder('path/to/mock/fileWithoutExt');

    expect(result.contentType).toBe('application/octet-stream');
  });
});

describe('convertCase', () => {
  it('should convert basic object keys to camelCase', () => {
    const obj = { first_name: 'John', last_name: 'Doe' };
    const result = objKeysToCamelCase(obj);
    expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
  });

  it('should convert nested object keys to camelCase', () => {
    const obj = { user_data: { first_name: 'John', last_name: 'Doe' } };
    const result = objKeysToCamelCase(obj);
    expect(result).toEqual({
      userData: { firstName: 'John', lastName: 'Doe' },
    });
  });

  it('should handle arrays correctly for camelCase', () => {
    const obj = {
      names: ['John', 'Jane'],
      users: [
        { user_id: 1, user_name: 'John' },
        { user_id: 2, user_name: 'Jane' },
      ],
    };
    const result = objKeysToCamelCase(obj);
    expect(result).toEqual({
      names: ['John', 'Jane'],
      users: [
        { userId: 1, userName: 'John' },
        { userId: 2, userName: 'Jane' },
      ],
    });
  });

  it('should convert basic object keys to snake_case', () => {
    const obj = { firstName: 'John', lastName: 'Doe' };
    const result = objKeysToSnakeCase(obj);
    expect(result).toEqual({ first_name: 'John', last_name: 'Doe' });
  });

  it('should convert nested object keys to snake_case', () => {
    const obj = { userData: { firstName: 'John', lastName: 'Doe' } };
    const result = objKeysToSnakeCase(obj);
    expect(result).toEqual({
      user_data: { first_name: 'John', last_name: 'Doe' },
    });
  });

  it('should handle arrays correctly for snake_case', () => {
    const obj = {
      names: ['John', 'Jane'],
      users: [
        { userId: 1, userName: 'John' },
        { userId: 2, userName: 'Jane' },
      ],
    };
    const result = objKeysToSnakeCase(obj);
    expect(result).toEqual({
      names: ['John', 'Jane'],
      users: [
        { user_id: 1, user_name: 'John' },
        { user_id: 2, user_name: 'Jane' },
      ],
    });
  });

  it('should exclude specified keys from camelCase conversion', () => {
    const obj = { first_name: 'John', last_name: 'Doe' };
    const result = objKeysToCamelCase(obj, ['last_name']);
    expect(result).toEqual({ firstName: 'John', last_name: 'Doe' });
  });

  it('should exclude specified keys from snake_case conversion', () => {
    const obj = { firstName: 'John', lastName: 'Doe' };
    const result = objKeysToSnakeCase(obj, ['lastName']);
    expect(result).toEqual({ first_name: 'John', lastName: 'Doe' });
  });

  it('should handle null and undefined values in camelCase conversion', () => {
    const obj = { first_name: 'John', address_data: null, user_age: undefined };
    const result = objKeysToCamelCase(obj);
    expect(result).toEqual({
      firstName: 'John',
      addressData: null,
      userAge: undefined,
    });
  });

  it('should handle null and undefined values in snake_case conversion', () => {
    const obj = { firstName: 'John', addressData: null, userAge: undefined };
    const result = objKeysToSnakeCase(obj);
    expect(result).toEqual({
      first_name: 'John',
      address_data: null,
      user_age: undefined,
    });
  });

  it('should handle numerical key names in snake_case conversion', () => {
    const obj = { firstName: 'John', current2024Status: 'confirmed' };
    const result = objKeysToSnakeCase(obj);
    expect(result).toEqual({
      first_name: 'John',
      current_2024_status: 'confirmed',
    });
  });

  it('should handle numerical key names in camelCase conversion', () => {
    const obj = { first_name: 'John', current_2024_status: 'confirmed' };
    const result = objKeysToCamelCase(obj);
    expect(result).toEqual({
      firstName: 'John',
      current2024Status: 'confirmed',
    });
  });
});

describe('makePathParams and safePath', () => {
  it('should URL encode path params with special characters', () => {
    const path = makePathParams(
      '/v3/grants/{identifier}/contacts/{contactId}',
      {
        identifier: 'id 123',
        contactId: 'contact/123',
      }
    );
    expect(path).toBe('/v3/grants/id%20123/contacts/contact%2F123');
  });

  it('should not double encode already-encoded params (backwards compatibility)', () => {
    const path = makePathParams(
      '/v3/grants/{identifier}/contacts/{contactId}',
      {
        identifier: 'id%20123', // already encoded
        contactId: 'contact%2F123', // already encoded
      }
    );
    expect(path).toBe('/v3/grants/id%20123/contacts/contact%2F123');
  });

  it('should throw if a required param is missing', () => {
    expect(() =>
      makePathParams('/v3/grants/{identifier}/contacts/{contactId}', {
        identifier: 'id123',
        // contactId missing
      } as any)
    ).toThrow('Missing replacement for contactId');
  });

  it('should work with no params in the path', () => {
    const path = makePathParams('/v3/grants', {});
    expect(path).toBe('/v3/grants');
  });

  it('should handle params that need no encoding', () => {
    const path = makePathParams('/v3/grants/{identifier}', {
      identifier: 'plainid',
    });
    expect(path).toBe('/v3/grants/plainid');
  });

  // Additional tests for the improved safePath implementation
  it('should handle mixed encoded and unencoded content correctly', () => {
    const path = makePathParams('/v3/grants/{identifier}', {
      identifier: 'test%20already encoded', // partially encoded
    });
    expect(path).toBe('/v3/grants/test%20already%20encoded');
  });

  it('should handle malformed percent encoding gracefully', () => {
    const path = makePathParams('/v3/grants/{identifier}', {
      identifier: 'test%2 incomplete', // incomplete percent encoding
    });
    expect(path).toBe('/v3/grants/test%252%20incomplete');
  });

  it('should handle unicode characters correctly', () => {
    const path = makePathParams('/v3/grants/{identifier}', {
      identifier: 'test 中文 unicode',
    });
    expect(path).toBe('/v3/grants/test%20%E4%B8%AD%E6%96%87%20unicode');
  });

  it('should handle complex URI components with multiple special characters', () => {
    const path = makePathParams('/v3/grants/{identifier}', {
      identifier: 'user@domain.com/folder?query=value#anchor',
    });
    expect(path).toBe(
      '/v3/grants/user%40domain.com%2Ffolder%3Fquery%3Dvalue%23anchor'
    );
  });

  it('should preserve correctly encoded URIs with complex characters', () => {
    const path = makePathParams('/v3/grants/{identifier}', {
      identifier: 'user%40domain.com%2Ffolder%3Fquery%3Dvalue%23anchor', // pre-encoded
    });
    expect(path).toBe(
      '/v3/grants/user%40domain.com%2Ffolder%3Fquery%3Dvalue%23anchor'
    );
  });

  it('should handle empty strings', () => {
    const path = makePathParams('/v3/grants/{identifier}', {
      identifier: '',
    });
    expect(path).toBe('/v3/grants/');
  });

  it('should handle strings with only special characters', () => {
    const path = makePathParams('/v3/grants/{identifier}', {
      identifier: '/@#$%^&*()',
    });
    expect(path).toBe('/v3/grants/%2F%40%23%24%25%5E%26*()');
  });
});

describe('encodeAttachmentContent', () => {
  // Helper function to create a readable stream from a string
  const createReadableStream = (content: string): NodeJS.ReadableStream => {
    const stream = new Readable();
    stream.push(content);
    stream.push(null); // Signal end of stream
    return stream;
  };

  it('should encode Buffer content to base64', async () => {
    const testContent = 'Hello, World!';
    const buffer = Buffer.from(testContent, 'utf8');
    const expectedBase64 = buffer.toString('base64');

    const attachments: CreateAttachmentRequest[] = [
      {
        filename: 'test.txt',
        contentType: 'text/plain',
        content: buffer,
        size: buffer.length,
      },
    ];

    const result = await encodeAttachmentContent(attachments);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe(expectedBase64);
    expect(result[0].filename).toBe('test.txt');
    expect(result[0].contentType).toBe('text/plain');
    expect(result[0].size).toBe(buffer.length);
  });

  it('should encode ReadableStream content to base64', async () => {
    const testContent = 'Stream content test';
    const stream = createReadableStream(testContent);
    const expectedBase64 = Buffer.from(testContent, 'utf8').toString('base64');

    const attachments: CreateAttachmentRequest[] = [
      {
        filename: 'stream.txt',
        contentType: 'text/plain',
        content: stream,
        size: testContent.length,
      },
    ];

    const result = await encodeAttachmentContent(attachments);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe(expectedBase64);
    expect(result[0].filename).toBe('stream.txt');
    expect(result[0].contentType).toBe('text/plain');
  });

  it('should pass through string content unchanged', async () => {
    const base64Content = 'SGVsbG8sIFdvcmxkIQ=='; // "Hello, World!" in base64

    const attachments: CreateAttachmentRequest[] = [
      {
        filename: 'string.txt',
        contentType: 'text/plain',
        content: base64Content,
        size: 13,
      },
    ];

    const result = await encodeAttachmentContent(attachments);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe(base64Content);
    expect(result[0].filename).toBe('string.txt');
    expect(result[0].contentType).toBe('text/plain');
  });

  it('should handle mixed content types in a single request', async () => {
    const bufferContent = Buffer.from('Buffer content', 'utf8');
    const streamContent = createReadableStream('Stream content');
    const stringContent = 'U3RyaW5nIGNvbnRlbnQ='; // Already base64

    const attachments: CreateAttachmentRequest[] = [
      {
        filename: 'buffer.txt',
        contentType: 'text/plain',
        content: bufferContent,
        size: bufferContent.length,
      },
      {
        filename: 'stream.txt',
        contentType: 'text/plain',
        content: streamContent,
        size: 14,
      },
      {
        filename: 'string.txt',
        contentType: 'text/plain',
        content: stringContent,
        size: 13,
      },
    ];

    const result = await encodeAttachmentContent(attachments);

    expect(result).toHaveLength(3);

    // Buffer should be converted to base64
    expect(result[0].content).toBe(bufferContent.toString('base64'));
    expect(result[0].filename).toBe('buffer.txt');

    // Stream should be converted to base64
    expect(result[1].content).toBe(
      Buffer.from('Stream content', 'utf8').toString('base64')
    );
    expect(result[1].filename).toBe('stream.txt');

    // String should be passed through
    expect(result[2].content).toBe(stringContent);
    expect(result[2].filename).toBe('string.txt');
  });

  it('should handle binary Buffer content correctly', async () => {
    // Create a buffer with binary data (some non-text bytes)
    const binaryData = new Uint8Array([0x00, 0x01, 0x02, 0xff, 0xfe, 0xfd]);
    const buffer = Buffer.from(binaryData);
    const expectedBase64 = buffer.toString('base64');

    const attachments: CreateAttachmentRequest[] = [
      {
        filename: 'binary.bin',
        contentType: 'application/octet-stream',
        content: buffer,
        size: buffer.length,
      },
    ];

    const result = await encodeAttachmentContent(attachments);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe(expectedBase64);
    expect(result[0].filename).toBe('binary.bin');
    expect(result[0].contentType).toBe('application/octet-stream');
  });

  it('should handle empty Buffer', async () => {
    const emptyBuffer = Buffer.alloc(0);
    const expectedBase64 = emptyBuffer.toString('base64'); // Should be empty string

    const attachments: CreateAttachmentRequest[] = [
      {
        filename: 'empty.txt',
        contentType: 'text/plain',
        content: emptyBuffer,
        size: 0,
      },
    ];

    const result = await encodeAttachmentContent(attachments);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe(expectedBase64);
    expect(result[0].filename).toBe('empty.txt');
  });

  it('should handle large Buffer content', async () => {
    // Create a 1KB buffer with repeating pattern
    const largeContent = 'A'.repeat(1024);
    const largeBuffer = Buffer.from(largeContent, 'utf8');
    const expectedBase64 = largeBuffer.toString('base64');

    const attachments: CreateAttachmentRequest[] = [
      {
        filename: 'large.txt',
        contentType: 'text/plain',
        content: largeBuffer,
        size: largeBuffer.length,
      },
    ];

    const result = await encodeAttachmentContent(attachments);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe(expectedBase64);
    expect(result[0].filename).toBe('large.txt');
    expect(result[0].size).toBe(1024);
  });
});

describe('encodeAttachmentStreams (backwards compatibility)', () => {
  it('should work the same as encodeAttachmentContent', async () => {
    const testContent = 'Backwards compatibility test';
    const buffer = Buffer.from(testContent, 'utf8');

    const attachments: CreateAttachmentRequest[] = [
      {
        filename: 'compat.txt',
        contentType: 'text/plain',
        content: buffer,
        size: buffer.length,
      },
    ];

    const newResult = await encodeAttachmentContent(attachments);
    const oldResult = await encodeAttachmentStreams(attachments);

    expect(oldResult).toEqual(newResult);
    expect(oldResult[0].content).toBe(buffer.toString('base64'));
  });
});
