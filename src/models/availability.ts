export type Availability = {
  order: string[];
  timeSlots: TimeSlot[];
};

export interface GetAvailabilityRequest {
  /** Unix timestamp for the start time to check availability for. */
  startTime: number;
  /** Unix timestamp for the end time to check availability for. */
  endTime: number;
  participants: Participant[];
  durationMinutes: number;
  intervalMinutes?: number;
  roundTo30Minutes?: boolean;
  availabilityRules?: AvailabilityRules;
}

export type TimeSlot = {
  accounts: string[];
  startTime: string;
  endTime: string;
};

export interface AvailabilityRules {
  availabilityMethod?: AvailabilityMethod;
  buffer?: MeetingBuffer;
  defaultOpenHours?: OpenHours[];
  roundRobinEventId?: string;
}

export interface MeetingBuffer {
  before: number;
  after: number;
}

export interface OpenHours {
  days: number[];
  timezone: string;
  start: string;
  end: string;
}

export interface Participant {
  email: string;
  calendarIds?: string[];
  openHours?: OpenHours[];
}

export enum AvailabilityMethod {
  MaxFairness = 'max-fairness',
  MaxAvailability = 'max-availability',
}
