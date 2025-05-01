import { NylasListResponse } from './response.js';
import { ListQueryParams } from './listQueryParams.js';

/**
 * Enum representing the supported meeting providers.
 */
export type NotetakerMeetingProvider =
  | 'Google Meet'
  | 'Microsoft Teams'
  | 'Zoom Meeting';

/**
 * Enum representing the current state of the Notetaker bot.
 */
export type NotetakerState =
  | 'scheduled'
  | 'connecting'
  | 'waiting_for_entry'
  | 'failed_entry'
  | 'attending'
  | 'media_processing'
  | 'media_available'
  | 'media_error'
  | 'media_deleted';

/**
 * Interface representing Notetaker Meeting Settings
 */
export interface NotetakerMeetingSettings {
  /**
   * When true, Notetaker records the meeting's video.
   */
  videoRecording: boolean;
  /**
   * When true, Notetaker records the meeting's audio.
   */
  audioRecording: boolean;
  /**
   * When true, Notetaker transcribes the meeting's audio.
   * If transcription is true, audioRecording must also be true.
   */
  transcription: boolean;
}

/**
 * Interface representing a Nylas Notetaker object.
 */
export interface Notetaker {
  /**
   * The Notetaker ID.
   */
  id: string;
  /**
   * The display name for the Notetaker bot.
   */
  name: string;
  /**
   * When Notetaker joined the meeting, in Unix timestamp format.
   */
  joinTime: number;
  /**
   * The meeting link.
   */
  meetingLink: string;
  /**
   * The meeting provider.
   */
  meetingProvider: NotetakerMeetingProvider;
  /**
   * The current state of the Notetaker bot.
   */
  state: NotetakerState;
  /**
   * Notetaker Meeting Settings
   */
  meetingSettings: NotetakerMeetingSettings;
}

/**
 * Interface representing Notetaker media recording information
 */
export interface NotetakerRecording {
  /**
   * A link to the meeting recording.
   */
  url: string;
  /**
   * The size of the file, in bytes.
   */
  size: number;
  /**
   * The name of the recording file.
   */
  name: string;
  /**
   * The MIME type of the recording file.
   */
  type: string;
  /**
   * When the recording file was uploaded to the storage server, in Unix timestamp format.
   */
  createdAt: number;
  /**
   * When the recording file will be deleted from the storage server, in Unix timestamp format.
   */
  expiresAt: number;
  /**
   * Time-to-live in seconds until the recording file will be deleted from Nylas' storage server.
   */
  ttl: number;
}

/**
 * Interface representing Notetaker media transcript information
 */
export interface NotetakerTranscript {
  /**
   * A link to the meeting transcript.
   */
  url: string;
  /**
   * The size of the file, in bytes.
   */
  size: number;
  /**
   * The name of the transcript file.
   */
  name: string;
  /**
   * The MIME type of the transcript file.
   */
  type: string;
  /**
   * When the transcript file was uploaded to the storage server, in Unix timestamp format.
   */
  createdAt: number;
  /**
   * When the transcript file will be deleted from the storage server, in Unix timestamp format.
   */
  expiresAt: number;
  /**
   * Time-to-live in seconds until the transcript file will be deleted from Nylas' storage server.
   */
  ttl: number;
}

/**
 * Interface representing Notetaker media data
 */
export interface NotetakerMedia {
  /**
   * The meeting recording.
   */
  recording: NotetakerRecording;
  /**
   * The meeting transcript.
   */
  transcript: NotetakerTranscript;
}

/**
 * Interface representing the request body for creating a Notetaker.
 */
export interface CreateNotetakerRequest {
  /**
   * A meeting invitation link that Notetaker uses to join the meeting.
   */
  meetingLink: string;

  /**
   * When Notetaker should join the meeting, in Unix timestamp format.
   * If empty, Notetaker joins the meeting immediately.
   * If you provide a time that's in the past, Nylas returns an error.
   */
  joinTime?: number;

  /**
   * The display name for the Notetaker bot.
   * Default: Nylas Notetaker
   */
  name?: string;

  /**
   * Notetaker Meeting Settings
   */
  meetingSettings?: Partial<NotetakerMeetingSettings>;
}

/**
 * Interface representing the request body for updating a Notetaker.
 */
export interface UpdateNotetakerRequest {
  /**
   * When Notetaker should join the meeting, in Unix timestamp format.
   * If empty, Notetaker joins the meeting immediately.
   * If you provide a time that's in the past, Nylas returns an error.
   */
  joinTime?: number;

  /**
   * The display name for the Notetaker bot.
   * Default: Nylas Notetaker
   */
  name?: string;

  /**
   * Notetaker Meeting Settings
   */
  meetingSettings?: Partial<NotetakerMeetingSettings>;
}

export interface ListNotetakersResponse extends NylasListResponse<Notetaker> {
  /**
   * A cursor pointing to the previous page of results for the request.
   */
  prevCursor?: string;

  /**
   * A cursor pointing to the next page of results for the request.
   */
  nextCursor?: string;
}

/**
 * Interface representing the query parameters for listing notetakers.
 */
export interface ListNotetakersQueryParams extends ListQueryParams {
  /**
   * Filter for Notetaker bots with the specified meeting state.
   */
  state?: NotetakerState;

  /**
   * Filter for Notetaker bots that have join times that start at or after a specific time, in Unix timestamp format.
   */
  joinTimeStart?: number;

  /**
   * Filter for Notetaker bots that have join times that end at or are before a specific time, in Unix timestamp format.
   */
  joinTimeEnd?: number;

  /**
   * The maximum number of objects to return.
   * This field defaults to 50. The maximum allowed value is 200.
   */
  limit?: number;

  /**
   * An identifier that specifies which page of data to return.
   * This value should be taken from the next_cursor response field.
   */
  pageToken?: string;

  /**
   * An identifier that specifies which page of data to return.
   * This value should be taken from the prev_cursor response field.
   */
  prevPageToken?: string;

  /**
   * The field to order the Notetaker bots by.
   * @default created_at
   */
  orderBy?: 'name' | 'join_time' | 'created_at';

  /**
   * The direction to order the Notetaker bots by.
   * @default asc
   */
  orderDirection?: 'asc' | 'desc';
}

/**
 * Interface representing the response from leaving a Notetaker session
 */
export interface NotetakerLeaveResponse {
  /**
   * The Notetaker ID.
   */
  id: string;

  /**
   * A message describing the API response.
   */
  message: string;
}
