import { camelCase, snakeCase } from 'change-case';

type CasingFunction = (input: string, options?: any) => string;

function convertCase(
  obj: Record<string, unknown>,
  casingFunction: CasingFunction,
  excludeKeys?: string[]
) {
  const newObj = {} as Record<string, unknown>;
  for (const key in obj) {
    if (excludeKeys?.includes(key)) {
      newObj[key] = obj[key];
    } else if (Array.isArray(obj[key])) {
      newObj[casingFunction(key)] = (obj[key] as any[]).map(item => {
        if (typeof item === 'object') {
          return convertCase(item, casingFunction);
        } else {
          return item;
        }
      });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[casingFunction(key)] = convertCase(
        obj[key] as Record<string, unknown>,
        casingFunction
      );
    } else {
      newObj[casingFunction(key)] = obj[key];
    }
  }
  return newObj;
}

// function that recursively converts all keys in an object to camelCase
export function objKeysToCamelCase(
  obj: Record<string, unknown>,
  exclude?: string[]
): Record<string, unknown> {
  return convertCase(obj, camelCase, exclude);
}

// function that recursively converts all keys in an object to snake_case
export function objKeysToSnakeCase(
  obj: Record<string, unknown>,
  exclude?: string[]
): Record<string, unknown> {
  return convertCase(obj, snakeCase, exclude);
}
