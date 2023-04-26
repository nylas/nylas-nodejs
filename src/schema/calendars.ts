import { z } from 'zod';
import { ListQueryParams } from './request';
import { ItemResponseSchema, ListResponseSchema } from './response';

export interface ListCalendersQueryParams extends ListQueryParams {
  /** Metadata */
  metadataPair?: Record<string, string>;
}

export interface CreateCalenderRequestBody {
  name: string;
  description: string;
  location: string;
  timezone: string;
  metadata: Record<string, string>;
}

export interface UpdateCalenderRequestBody extends CreateCalenderRequestBody {
  hexColor?: string;
  hexForegroundColor?: string;
}

const CalendarSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  timezone: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
  id: z.string(),
  grantId: z.string(),
  object: z.literal('calendar'),
  readOnly: z.boolean(),
  isPrimary: z.boolean().nullable(),
  isOwnedByUser: z.boolean(),
  hexColor: z.string().optional(),
  hexForegroundColor: z.string().optional(),
});

export type Calendar = z.infer<typeof CalendarSchema>;
export const CalendarResponseSchema = ItemResponseSchema.extend({
  data: CalendarSchema,
});

export const CalendarListResponseSchema = ListResponseSchema.extend({
  data: z.array(CalendarSchema),
});
export type CalendarList = z.infer<typeof CalendarListResponseSchema>;

export interface GetAvailabilityRequestBody {
  /** Unix timestamp for the start time to check availability for. */
  startTime: number;
  /** Unix timestamp for the end time to check availability for. */
  endTime: number;
  durationMinutes: number;
  intervalMinutes: number;
  roundTo30Minutes: boolean;
  accounts: {
    accountId: string;
    calendarIds: string[];
  }[];
  availabilityRules: {
    availabilityMethod: 'max-fairness' | 'max-availability' | 'collective';
    buffer: {
      before: number;
      after: number;
    };
    openHours: {
      emails: string[];
      days: number[];
      timezone: string;
      start: string;
      end: string;
      objectType?: 'open_hours';
    }[];
  };
}

export const AvailabilitySchema = z.object({
  order: z.array(z.string()),
  timeSlots: z.array(
    z.object({
      accounts: z.array(z.string()),
      startTime: z.string(),
      endTime: z.string(),
    })
  ),
});

export const AvailabilityResponseSchema = ItemResponseSchema.extend({
  data: AvailabilitySchema,
});

export type Availability = z.infer<typeof AvailabilityResponseSchema>;
