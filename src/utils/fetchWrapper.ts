/**
 * Fetch wrapper - intelligently detects environment and uses appropriate implementation
 * - In Workers/Edge environments: uses native Web APIs
 * - In Node.js: uses node-fetch polyfill
 */

// Types for the dynamic import result
interface NodeFetchModule {
  default: any; // fetch function
  Request: any; // Request constructor
  Response: any; // Response constructor
}

// Cache for the dynamically imported module
let nodeFetchModule: NodeFetchModule | null = null;

/**
 * Get fetch function - uses native fetch in Workers, node-fetch in Node.js
 */
export async function getFetch(): Promise<any> {
  // Use native fetch if available (Workers, modern browsers, or test mocks)
  if (typeof globalThis !== 'undefined' && globalThis.fetch) {
    return globalThis.fetch;
  }

  // Fallback to node-fetch for Node.js environments
  if (!nodeFetchModule) {
    // Use Function constructor to prevent TypeScript from converting to require()
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    nodeFetchModule = (await dynamicImport('node-fetch')) as NodeFetchModule;
  }

  return nodeFetchModule.default;
}

/**
 * Get Request constructor - uses native Request in Workers, node-fetch in Node.js
 */
export async function getRequest(): Promise<any> {
  // Use native Request if available (Workers, modern browsers, or test mocks)
  if (typeof globalThis !== 'undefined' && globalThis.Request) {
    return globalThis.Request;
  }

  // Fallback to node-fetch for Node.js environments
  if (!nodeFetchModule) {
    // Use Function constructor to prevent TypeScript from converting to require()
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    nodeFetchModule = (await dynamicImport('node-fetch')) as NodeFetchModule;
  }

  return nodeFetchModule.Request;
}

/**
 * Get Response constructor - uses native Response in Workers, node-fetch in Node.js
 */
export async function getResponse(): Promise<any> {
  // Use native Response if available (Workers, modern browsers, or test mocks)
  if (typeof globalThis !== 'undefined' && globalThis.Response) {
    return globalThis.Response;
  }

  // Fallback to node-fetch for Node.js environments
  if (!nodeFetchModule) {
    // Use Function constructor to prevent TypeScript from converting to require()
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    nodeFetchModule = (await dynamicImport('node-fetch')) as NodeFetchModule;
  }

  return nodeFetchModule.Response;
}

// Export types as any for compatibility
export type RequestInit = any;
export type HeadersInit = any;
export type Request = any;
export type Response = any;
