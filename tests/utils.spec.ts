import {
  createFileRequestBuilder,
  objKeysToCamelCase,
  objKeysToSnakeCase,
} from '../src/utils';

jest.mock('fs', () => {
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
    require('fs').statSync.mockReturnValue(mockedStatSync);
    require('fs').createReadStream.mockReturnValue(mockedReadStream);
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
