import { camelCase, snakeCase } from 'change-case';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
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
        item => {
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
