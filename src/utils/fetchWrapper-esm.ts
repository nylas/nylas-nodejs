/**
 * Fetch wrapper for ESM builds - uses static imports for optimal performance
 */

import fetch, { Request, Response } from 'node-fetch';
import type { RequestInit, HeadersInit } from 'node-fetch';

/**
 * Get fetch function - uses static import for ESM
 */
export async function getFetch(): Promise<typeof fetch> {
  return fetch;
}

/**
 * Get Request constructor - uses static import for ESM
 */
export async function getRequest(): Promise<typeof Request> {
  return Request;
}

/**
 * Get Response constructor - uses static import for ESM
 */
export async function getResponse(): Promise<typeof Response> {
  return Response;
}

// Export types directly
export type { RequestInit, HeadersInit, Request, Response };
