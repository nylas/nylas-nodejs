import { camelCase, snakeCase } from 'change-case';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as mime from 'mime-types';
import { Readable } from 'node:stream';
import { File as _File, Blob as _Blob } from 'formdata-node';
import { CreateAttachmentRequest } from './models/attachments.js';

export function createFileRequestBuilder(
  filePath: string
): CreateAttachmentRequest {
  const stats = fs.statSync(filePath);
  const filename = path.basename(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';
  const content = fs.createReadStream(filePath);

  return {
    filename,
    contentType,
    content,
    size: stats.size,
  };
}

/**
 * Converts a ReadableStream to a base64 encoded string.
 * @param stream The ReadableStream containing the binary data.
 * @returns The stream base64 encoded to a string.
 */
export function streamToBase64(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    stream.on('end', () => {
      const base64 = Buffer.concat(chunks).toString('base64');
      resolve(base64);
    });
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Converts a ReadableStream to a File-like object that can be used with FormData.
 * @param attachment The attachment containing the stream and metadata.
 * @param mimeType The MIME type for the file (optional).
 * @returns A File-like object that properly handles the stream.
 */
export function attachmentStreamToFile(
  attachment: CreateAttachmentRequest,
  mimeType?: string
): any {
  if (mimeType != null && typeof mimeType !== 'string') {
    throw new Error('Invalid mimetype, expected string.');
  }
  const content = attachment.content;
  if (typeof content === 'string' || Buffer.isBuffer(content)) {
    throw new Error('Invalid attachment content, expected ReadableStream.');
  }

  // Create a file-shaped object that FormData can handle properly
  const fileObject = {
    type: mimeType || attachment.contentType,
    name: attachment.filename,
    [Symbol.toStringTag]: 'File',
    stream(): NodeJS.ReadableStream {
      return content;
    },
  };

  // Add size if available
  if (attachment.size !== undefined) {
    (fileObject as any).size = attachment.size;
  }

  return fileObject;
}

/**
 * Encodes the content of each attachment to base64.
 * Handles ReadableStream, Buffer, and string content types.
 * @param attachments The attachments to encode.
 * @returns The attachments with their content encoded to base64.
 */
export async function encodeAttachmentContent(
  attachments: CreateAttachmentRequest[]
): Promise<CreateAttachmentRequest[]> {
  return await Promise.all(
    attachments.map(async (attachment) => {
      let base64EncodedContent: string;

      if (attachment.content instanceof Readable) {
        // ReadableStream -> base64
        base64EncodedContent = await streamToBase64(attachment.content);
      } else if (Buffer.isBuffer(attachment.content)) {
        // Buffer -> base64
        base64EncodedContent = attachment.content.toString('base64');
      } else {
        // string (assumed to already be base64)
        base64EncodedContent = attachment.content as string;
      }

      return { ...attachment, content: base64EncodedContent };
    })
  );
}

/**
 * @deprecated Use encodeAttachmentContent instead. This alias is provided for backwards compatibility.
 * Encodes the content of each attachment stream to base64.
 * @param attachments The attachments to encode.
 * @returns The attachments with their content encoded to base64.
 */
export async function encodeAttachmentStreams(
  attachments: CreateAttachmentRequest[]
): Promise<CreateAttachmentRequest[]> {
  return encodeAttachmentContent(attachments);
}

/**
 * The type of function that converts a string to a different casing.
 * @ignore Not for public use.
 */
type CasingFunction = (input: string, options?: any) => string;

/**
 * Applies the casing function and ensures numeric parts are preceded by underscores in snake_case.
 * @param casingFunction The original casing function.
 * @param input The string to convert.
 * @returns The converted string.
 */
function applyCasing(casingFunction: CasingFunction, input: string): string {
  const transformed = casingFunction(input);

  if (casingFunction === snakeCase) {
    return transformed.replace(/(\d+)/g, '_$1');
  } else {
    return transformed.replace(/_+(\d+)/g, (match, p1) => p1);
  }
}

/**
 * A utility function that recursively converts all keys in an object to a given case.
 * @param obj The object to convert
 * @param casingFunction The function to use to convert the keys
 * @param excludeKeys An array of keys to exclude from conversion
 * @returns The converted object
 * @ignore Not for public use.
 */
function convertCase(
  obj: Record<string, unknown>,
  casingFunction: CasingFunction,
  excludeKeys?: string[]
): Record<string, unknown> {
  const newObj = {} as Record<string, unknown>;
  for (const key in obj) {
    if (excludeKeys?.includes(key)) {
      newObj[key] = obj[key];
    } else if (Array.isArray(obj[key])) {
      newObj[applyCasing(casingFunction, key)] = (obj[key] as any[]).map(
        (item) => {
          if (typeof item === 'object') {
            return convertCase(item, casingFunction);
          } else {
            return item;
          }
        }
      );
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[applyCasing(casingFunction, key)] = convertCase(
        obj[key] as Record<string, unknown>,
        casingFunction
      );
    } else {
      newObj[applyCasing(casingFunction, key)] = obj[key];
    }
  }
  return newObj;
}

/**
 * A utility function that recursively converts all keys in an object to camelCase.
 * @param obj The object to convert
 * @param exclude An array of keys to exclude from conversion
 * @returns The converted object
 * @ignore Not for public use.
 */
export function objKeysToCamelCase(
  obj: Record<string, unknown>,
  exclude?: string[]
): any {
  return convertCase(obj, camelCase, exclude);
}

/**
 * A utility function that recursively converts all keys in an object to snake_case.
 * @param obj The object to convert
 * @param exclude An array of keys to exclude from conversion
 * @returns The converted object
 */
export function objKeysToSnakeCase(
  obj: Record<string, unknown>,
  exclude?: string[]
): any {
  return convertCase(obj, snakeCase, exclude);
}

/**
 * A better "Partial" type that makes all properties optional, including nested ones.
 * @see https://grrr.tech/posts/2021/typescript-partial/
 */
export type Subset<K> = {
  [attr in keyof K]?: K[attr] extends object
    ? Subset<K[attr]>
    : K[attr] extends object | null
      ? Subset<K[attr]> | null
      : K[attr] extends object | null | undefined
        ? Subset<K[attr]> | null | undefined
        : K[attr];
};

/**
 * Safely encodes a path template with replacements.
 * @param pathTemplate The path template to encode.
 * @param replacements The replacements to encode.
 * @returns The encoded path.
 */
export function safePath(
  pathTemplate: string,
  replacements: Record<string, string>
): string {
  return pathTemplate.replace(/\{(\w+)\}/g, (_, key) => {
    const val = replacements[key];
    if (val == null) throw new Error(`Missing replacement for ${key}`);

    // Decode first (handles already encoded values), then encode
    // This prevents double encoding while ensuring everything is properly encoded
    try {
      const decoded = decodeURIComponent(val);
      return encodeURIComponent(decoded);
    } catch {
      // If decoding fails, the value wasn't properly encoded, so just encode it
      return encodeURIComponent(val);
    }
  });
}

// Extracts all {varName} from a string as a union type
export type ExtractPathParams<S extends string> =
  S extends `${string}{${infer Param}}${infer Rest}`
    ? Param | ExtractPathParams<Rest>
    : never;

// Type-safe path params object
export interface PathParams<Path extends string> {
  path: Path;
  params: Record<ExtractPathParams<Path>, string>;
  toString(): string;
  toPath(): string;
}

// Helper to create PathParams with type safety and runtime interpolation
export function makePathParams<Path extends string>(
  path: Path,
  params: Record<ExtractPathParams<Path>, string>
): string {
  return safePath(path, params);
}

/**
 * Calculates the total payload size for a message request, including body and attachments.
 * This is used to determine if multipart/form-data should be used instead of JSON.
 * @param requestBody The message request body
 * @returns The total estimated payload size in bytes
 */
export function calculateTotalPayloadSize(requestBody: any): number {
  let totalSize = 0;

  // Calculate size of the message body (JSON payload without attachments)
  const messagePayloadWithoutAttachments = {
    ...requestBody,
    attachments: undefined,
  };
  const messagePayloadString = JSON.stringify(
    objKeysToSnakeCase(messagePayloadWithoutAttachments)
  );
  totalSize += Buffer.byteLength(messagePayloadString, 'utf8');

  // Add attachment sizes
  const attachmentSize =
    requestBody.attachments?.reduce((total: number, attachment: any) => {
      return total + (attachment.size || 0);
    }, 0) || 0;

  totalSize += attachmentSize;

  return totalSize;
}
