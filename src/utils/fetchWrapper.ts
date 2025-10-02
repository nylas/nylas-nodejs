/**
 * Fetch wrapper for CJS builds - uses dynamic imports for node-fetch compatibility
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
 * Get fetch function - uses dynamic import for CJS
 */
export async function getFetch(): Promise<any> {
  // In test environment, use global fetch (mocked by jest-fetch-mock)
  if (typeof global !== 'undefined' && global.fetch) {
    return global.fetch;
  }

  if (!nodeFetchModule) {
    // Use Function constructor to prevent TypeScript from converting to require()
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    nodeFetchModule = (await dynamicImport('node-fetch')) as NodeFetchModule;
  }

  return nodeFetchModule.default;
}

/**
 * Get Request constructor - uses dynamic import for CJS
 */
export async function getRequest(): Promise<any> {
  // In test environment, use global Request or a mock
  if (typeof global !== 'undefined' && global.Request) {
    return global.Request;
  }

  if (!nodeFetchModule) {
    // Use Function constructor to prevent TypeScript from converting to require()
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    nodeFetchModule = (await dynamicImport('node-fetch')) as NodeFetchModule;
  }

  return nodeFetchModule.Request;
}

/**
 * Get Response constructor - uses dynamic import for CJS
 */
export async function getResponse(): Promise<any> {
  // In test environment, use global Response or a mock
  if (typeof global !== 'undefined' && global.Response) {
    return global.Response;
  }

  if (!nodeFetchModule) {
    // Use Function constructor to prevent TypeScript from converting to require()
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    nodeFetchModule = (await dynamicImport('node-fetch')) as NodeFetchModule;
  }

  return nodeFetchModule.Response;
}

// Export types as any for CJS compatibility
export type RequestInit = any;
export type HeadersInit = any;
export type Request = any;
export type Response = any;
