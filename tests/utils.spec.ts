import {
  createFileRequestBuilder,
  objKeysToCamelCase,
  objKeysToSnakeCase,
  makePathParams,
  encodeAttachmentContent,
  encodeAttachmentStreams,
  attachmentStreamToFile,
  streamToBase64,
  calculateTotalPayloadSize,
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

describe('streamToBase64', () => {
  // Helper function to create a readable stream from a string
  const createReadableStream = (content: string): NodeJS.ReadableStream => {
    const stream = new Readable();
    stream.push(content);
    stream.push(null); // Signal end of stream
    return stream;
  };

  it('should convert stream to base64', async () => {
    const testContent = 'Hello, World!';
    const stream = createReadableStream(testContent);
    const expectedBase64 = Buffer.from(testContent, 'utf8').toString('base64');

    const result = await streamToBase64(stream);

    expect(result).toBe(expectedBase64);
  });

  it('should handle stream errors', async () => {
    const errorStream = new Readable({
      read(): void {
        // Implement _read to avoid the "not implemented" error
      },
    });
    const testError = new Error('Stream error test');

    // Emit error after a short delay to ensure the error handler is set up
    setTimeout(() => {
      errorStream.emit('error', testError);
    }, 10);

    await expect(streamToBase64(errorStream)).rejects.toThrow(
      'Stream error test'
    );
  });

  it('should handle empty stream', async () => {
    const emptyStream = createReadableStream('');
    const result = await streamToBase64(emptyStream);
    expect(result).toBe('');
  });
});

describe('attachmentStreamToFile', () => {
  // Helper function to create a readable stream from a string
  const createReadableStream = (content: string): NodeJS.ReadableStream => {
    const stream = new Readable();
    stream.push(content);
    stream.push(null); // Signal end of stream
    return stream;
  };

  it('should convert stream attachment to file object', () => {
    const stream = createReadableStream('test content');
    const attachment: CreateAttachmentRequest = {
      filename: 'test.txt',
      contentType: 'text/plain',
      content: stream,
      size: 12,
    };

    const result = attachmentStreamToFile(attachment);

    expect(result.name).toBe('test.txt');
    expect(result.type).toBe('text/plain');
    expect(result.size).toBe(12);
    expect(typeof result.stream).toBe('function');
    expect(result.stream()).toBe(stream);
    expect(result[Symbol.toStringTag]).toBe('File');
  });

  it('should use mimeType parameter when provided', () => {
    const stream = createReadableStream('test content');
    const attachment: CreateAttachmentRequest = {
      filename: 'test.txt',
      contentType: 'text/plain',
      content: stream,
    };

    const result = attachmentStreamToFile(attachment, 'application/json');

    expect(result.type).toBe('application/json');
  });

  it('should throw error for invalid mimeType parameter', () => {
    const stream = createReadableStream('test content');
    const attachment: CreateAttachmentRequest = {
      filename: 'test.txt',
      contentType: 'text/plain',
      content: stream,
    };

    expect(() => {
      attachmentStreamToFile(attachment, 123 as any);
    }).toThrow('Invalid mimetype, expected string.');
  });

  it('should throw error for string content', () => {
    const attachment: CreateAttachmentRequest = {
      filename: 'test.txt',
      contentType: 'text/plain',
      content: 'string content',
    };

    expect(() => {
      attachmentStreamToFile(attachment);
    }).toThrow('Invalid attachment content, expected ReadableStream.');
  });

  it('should throw error for Buffer content', () => {
    const attachment: CreateAttachmentRequest = {
      filename: 'test.txt',
      contentType: 'text/plain',
      content: Buffer.from('buffer content'),
    };

    expect(() => {
      attachmentStreamToFile(attachment);
    }).toThrow('Invalid attachment content, expected ReadableStream.');
  });

  it('should handle attachment without size', () => {
    const stream = createReadableStream('test content');
    const attachment: CreateAttachmentRequest = {
      filename: 'test.txt',
      contentType: 'text/plain',
      content: stream,
    };

    const result = attachmentStreamToFile(attachment);

    expect(result.name).toBe('test.txt');
    expect(result.type).toBe('text/plain');
    expect(result.size).toBeUndefined();
    expect(result.stream()).toBe(stream);
  });

  it('should return content stream when stream() method is called', () => {
    const stream = createReadableStream('test content');
    const attachment: CreateAttachmentRequest = {
      filename: 'test.txt',
      contentType: 'text/plain',
      content: stream,
    };

    const result = attachmentStreamToFile(attachment);
    const returnedStream = result.stream();

    expect(returnedStream).toBe(stream);
  });
});

describe('calculateTotalPayloadSize', () => {
  it('should calculate total payload size including message body and attachments', () => {
    const requestBody = {
      to: [{ email: 'test@example.com' }],
      subject: 'Test',
      body: 'Test body',
      attachments: [
        { filename: 'file1.txt', size: 100 },
        { filename: 'file2.txt', size: 200 },
      ],
    };

    const result = calculateTotalPayloadSize(requestBody);

    // Should include JSON body size + attachment sizes
    expect(result).toBeGreaterThan(0);
    expect(result).toBeGreaterThanOrEqual(300); // At least the attachment sizes
  });

  it('should calculate size without attachments', () => {
    const requestBody = {
      to: [{ email: 'test@example.com' }],
      subject: 'Test',
      body: 'Test body',
    };

    const result = calculateTotalPayloadSize(requestBody);

    // Should only include JSON body size
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1000); // Should be relatively small without attachments
  });

  it('should handle empty attachments array', () => {
    const requestBody = {
      to: [{ email: 'test@example.com' }],
      subject: 'Test',
      attachments: [],
    };

    const result = calculateTotalPayloadSize(requestBody);

    expect(result).toBeGreaterThan(0);
  });

  it('should handle attachments without size property', () => {
    const requestBody = {
      to: [{ email: 'test@example.com' }],
      subject: 'Test',
      attachments: [
        { filename: 'file1.txt' },
        { filename: 'file2.txt', size: 200 },
      ],
    };

    const result = calculateTotalPayloadSize(requestBody);

    // Should only count attachments with size property
    expect(result).toBeGreaterThanOrEqual(200);
  });

  it('should handle undefined attachments', () => {
    const requestBody = {
      to: [{ email: 'test@example.com' }],
      subject: 'Test',
    };

    const result = calculateTotalPayloadSize(requestBody);

    expect(result).toBeGreaterThan(0);
  });

  it('should handle large attachments', () => {
    const requestBody = {
      to: [{ email: 'test@example.com' }],
      subject: 'Test',
      attachments: [
        { filename: 'large1.txt', size: 1000000 },
        { filename: 'large2.txt', size: 2000000 },
      ],
    };

    const result = calculateTotalPayloadSize(requestBody);

    expect(result).toBeGreaterThanOrEqual(3000000);
  });
});

describe('convertCase with nested arrays', () => {
  it('should recursively convert object items in arrays to camelCase', () => {
    const obj = {
      items: [
        { user_id: 1, user_name: 'John' },
        { user_id: 2, user_name: 'Jane' },
        'plain string',
        123,
      ],
    };
    const result = objKeysToCamelCase(obj);
    expect(result).toEqual({
      items: [
        { userId: 1, userName: 'John' },
        { userId: 2, userName: 'Jane' },
        'plain string',
        123,
      ],
    });
  });

  it('should recursively convert object items in arrays to snake_case', () => {
    const obj = {
      items: [
        { userId: 1, userName: 'John' },
        { userId: 2, userName: 'Jane' },
        'plain string',
        123,
      ],
    };
    const result = objKeysToSnakeCase(obj);
    expect(result).toEqual({
      items: [
        { user_id: 1, user_name: 'John' },
        { user_id: 2, user_name: 'Jane' },
        'plain string',
        123,
      ],
    });
  });

  it('should handle deeply nested objects in arrays', () => {
    const obj = {
      users: [
        {
          user_id: 1,
          profile: { first_name: 'John', last_name: 'Doe' },
        },
        {
          user_id: 2,
          profile: { first_name: 'Jane', last_name: 'Smith' },
        },
      ],
    };
    const result = objKeysToCamelCase(obj);
    expect(result).toEqual({
      users: [
        {
          userId: 1,
          profile: { firstName: 'John', lastName: 'Doe' },
        },
        {
          userId: 2,
          profile: { firstName: 'Jane', lastName: 'Smith' },
        },
      ],
    });
  });
});
