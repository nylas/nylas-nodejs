/**
 * Fetch wrapper for Workers/Edge environments (Cloudflare Workers, Vercel Edge, etc.)
 * Uses native Web APIs (fetch, Request, Response) available in these environments
 */

/**
 * Get fetch function - uses native Workers fetch
 * In Workers environments, fetch is a native built-in
 */
export async function getFetch(): Promise<typeof fetch> {
  return fetch;
}

/**
 * Get Request constructor - uses native Workers Request
 * In Workers environments, Request is a native built-in
 */
export async function getRequest(): Promise<typeof Request> {
  return Request;
}

/**
 * Get Response constructor - uses native Workers Response
 * In Workers environments, Response is a native built-in
 */
export async function getResponse(): Promise<typeof Response> {
  return Response;
}

// Export type aliases for Web API types
export type RequestInit = globalThis.RequestInit;
export type HeadersInit = globalThis.HeadersInit;
export type Request = globalThis.Request;
export type Response = globalThis.Response;
