export type Availability = {
  order: string[];
  timeSlots: TimeSlot[];
};

export interface GetAvailabilityRequest {
  /** Unix timestamp for the start time to check availability for. */
  start_time: number;
  /** Unix timestamp for the end time to check availability for. */
  end_time: number;
  participants: Participant[];
  duration_minutes?: number;
  interval_minutes?: number;
  round_to_30_minutes?: boolean;
  availability_rules?: AvailabilityRules;
}

export type TimeSlot = {
  accounts: string[];
  startTime: string;
  endTime: string;
};

export interface AvailabilityRules {
  availability_method?: AvailabilityMethod;
  buffer?: MeetingBuffer;
  default_open_hours?: OpenHours[];
  round_robin_event_id?: string;
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
  calendar_ids?: string[];
  open_hours?: OpenHours[];
}

export enum AvailabilityMethod {
  MaxFairness = 'max-fairness',
  MaxAvailability = 'max-availability',
}
