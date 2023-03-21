import { z } from 'zod';

export const APIObjects = z.union([
  z.literal('event'),
  z.literal('calendar'),
  z.literal('contact'),
  z.literal('file'),
  z.literal('message'),
  z.literal('label'),
]);
