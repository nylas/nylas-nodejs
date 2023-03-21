import { camelCase } from 'change-case';

// write a function that recursively converts all keys in an object to camelCase
export function objKeysToCamelCase(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const newObj = {} as Record<string, unknown>;
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      newObj[camelCase(key)] = objKeysToCamelCase(
        obj[key] as Record<string, unknown>
      );
    } else {
      newObj[camelCase(key)] = obj[key];
    }
  }
  return newObj;
}
