import { NylasListResponse } from './response.js';
import { ListQueryParams } from './listQueryParams.js';

/**
 * Enum representing the supported meeting providers.
 */
export type NotetakerMeetingProvider =
  'Google Meet' | 'Microsoft Teams' | 'Zoom Meeting';

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
 * What Notetaker records.
 * `audio_video` produces an MP4 recording of the meeting's video and audio.
 * `audio` produces an MP3 audio-only recording.
 */
export type NotetakerRecordingType = 'audio_video' | 'audio';

/**
 * Optional settings that tune how Notetaker transcribes audio.
 * `transcription` must be true for these settings to take effect.
 */
export interface NotetakerTranscriptionSettings {
  /**
   * Language codes the audio is expected to contain.
   * When provided, it must contain at least one supported code.
   */
  expectedLanguages?: string[];
  /**
   * Language to use if Notetaker does not detect one of the expected languages.
   */
  fallbackLanguage?: string;
  /**
   * Domain-specific terms that bias transcription toward recognizing them,
   * such as names, acronyms, and product names.
   */
  keywords?: string[];
  /**
   * When true, Notetaker adds known speaker names to the keyword set.
   */
  useSpeakerNamesAsKeywords?: boolean;
}

/**
 * Custom instructions for the AI model that generates a summary or action items.
 */
export interface NotetakerCustomInstructionsSettings {
  /**
   * A custom prompt for the AI model.
   */
  customInstructions?: string;
}

/**
 * A message the Notetaker bot posts to the meeting chat shortly after joining.
 */
export interface NotetakerOnJoinMessage {
  /**
   * The message format. Currently only `text` is supported.
   */
  type: 'text';
  /**
   * The message text. HTML tags are stripped before the message is sent.
   */
  content: string;
  /**
   * Delay in milliseconds between the bot joining and the message being posted.
   */
  sendAfterMs: number;
}

/**
 * A message the Notetaker bot posts to the meeting chat when a new participant joins.
 */
export interface NotetakerOnParticipantJoinMessage {
  /**
   * The message format. Currently only `text` is supported.
   */
  type: 'text';
  /**
   * The message text. HTML tags are stripped before the message is sent.
   */
  content: string;
  /**
   * Trailing debounce window in milliseconds.
   * A burst of joins inside the window produces a single message.
   */
  debounceMs: number;
}

/**
 * Custom announcements the Notetaker bot posts to the meeting chat.
 */
export interface NotetakerMessages {
  /**
   * Messages the bot sends shortly after it joins the meeting. Up to 10.
   */
  onJoin?: NotetakerOnJoinMessage[] | null;
  /**
   * Messages the bot sends when a new participant joins the meeting. Up to 10.
   */
  onParticipantJoin?: NotetakerOnParticipantJoinMessage[] | null;
}

/**
 * The image formats Notetaker accepts for video output.
 */
export type NotetakerVideoOutputMediaType =
  'image/png' | 'image/jpeg' | 'image/webp';

/**
 * A static image for the Notetaker bot to show as its camera feed.
 * Send `mediaType` and base64 `data` together to upload an image,
 * or an empty object to disable video output.
 */
export type NotetakerVideoOutputUpload =
  | {
      /**
       * The image MIME type. Must match the actual file content.
       */
      mediaType: NotetakerVideoOutputMediaType;
      /**
       * The base64-encoded image bytes.
       */
      data: string;
      /** Read-only; not accepted on writes. */
      size?: never;
      /** Read-only; not accepted on writes. */
      previewUrl?: never;
      /** Read-only; not accepted on writes. */
      previewUrlExpiresAt?: never;
    }
  | Record<string, never>;

/**
 * The stored video output image returned in Notetaker responses.
 */
export interface NotetakerVideoOutput {
  /**
   * The image MIME type.
   */
  mediaType?: NotetakerVideoOutputMediaType;
  /**
   * The size of the stored image, in bytes.
   */
  size?: number;
  /**
   * A signed URL for previewing the stored image. Valid for 1 hour.
   */
  previewUrl?: string;
  /**
   * When `previewUrl` expires, in Unix timestamp format.
   */
  previewUrlExpiresAt?: number;
}

/**
 * Interface representing Notetaker settings.
 * Cannot be used together with the deprecated `name` and `meetingSettings` fields.
 */
export interface NotetakerConfigSettings {
  /**
   * The display name shown when the Notetaker joins a meeting.
   */
  name?: string;
  /**
   * What Notetaker records.
   * When no level of the configuration hierarchy sets it, Notetaker records audio and video.
   */
  recordingType?: NotetakerRecordingType;
  /**
   * When true, Notetaker transcribes the meeting's audio.
   */
  transcription?: boolean;
  /**
   * Optional settings that tune how Notetaker transcribes audio.
   * On create, send `null` or `{}` to clear inherited settings.
   * On update, `null` removes this Notetaker's override and restores the
   * inherited settings, and `{}` clears them.
   */
  transcriptionSettings?: NotetakerTranscriptionSettings | null;
  /**
   * When true, Notetaker generates a summary of the meeting.
   * Requires `transcription` to also be true.
   */
  summary?: boolean;
  /**
   * Settings for the summary.
   */
  summarySettings?: NotetakerCustomInstructionsSettings;
  /**
   * When true, Notetaker generates a list of action items.
   * Requires `transcription` to also be true.
   */
  actionItems?: boolean;
  /**
   * Settings for the action items.
   */
  actionItemsSettings?: NotetakerCustomInstructionsSettings;
  /**
   * Seconds of continuous silence after which Notetaker leaves the meeting.
   * Must be between 10 and 3600.
   */
  leaveAfterSilenceSeconds?: number;
  /**
   * Seconds Notetaker waits after joining before it can leave automatically.
   * Must be between 0 and 3600.
   */
  leaveDetectionDelaySeconds?: number;
  /**
   * Custom announcements the Notetaker bot posts to the meeting chat.
   */
  messages?: NotetakerMessages;
  /**
   * A static image the Notetaker bot shows as its camera feed.
   */
  videoOutput?: NotetakerVideoOutputUpload;
  /**
   * How long Notetaker media is kept before Nylas deletes it, in seconds.
   * Must be between 300 and 2592000.
   */
  retentionTime?: number;
}

/**
 * A deduplication policy as returned in calendar and event responses.
 * Requests accept only "inherit" and "disable"; responses can also carry the
 * resolved "active" or "inactive" policy.
 */
export type NotetakerDeduplicationPolicy =
  'inherit' | 'disable' | 'active' | 'inactive';

/**
 * Notetaker settings for calendar and event sync.
 * Calendar and event sync do not support `videoOutput`.
 */
export type NotetakerSyncSettings = Omit<
  NotetakerConfigSettings,
  'videoOutput'
> & {
  videoOutput?: never;
};

/**
 * Notetaker settings as returned in Notetaker responses.
 * Responses can include stored metadata that the API rejects on writes, so
 * send only the fields you want to change in an update instead of the
 * fetched settings.
 */
export interface NotetakerConfigSettingsResponse extends Omit<
  NotetakerConfigSettings,
  'videoOutput'
> {
  /**
   * The stored video output image, if one is set.
   */
  videoOutput?: NotetakerVideoOutput;
}

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
  /**
   * Optional settings that tune how Notetaker transcribes audio.
   */
  transcriptionSettings?: NotetakerTranscriptionSettings | null;
  /**
   * When true, Notetaker generates a summary of the meeting.
   * If summary is true, transcription must also be true.
   */
  summary?: boolean;
  /**
   * Settings for the summary.
   */
  summarySettings?: NotetakerCustomInstructionsSettings;
  /**
   * When true, Notetaker generates a list of action items.
   * If actionItems is true, transcription must also be true.
   */
  actionItems?: boolean;
  /**
   * Settings for the action items.
   */
  actionItemsSettings?: NotetakerCustomInstructionsSettings;
  /**
   * Seconds of silence after which Notetaker leaves the meeting.
   * Must be between 10 and 3600.
   */
  leaveAfterSilenceSeconds?: number;
  /**
   * Custom announcements the Notetaker bot posts to the meeting chat.
   */
  messages?: NotetakerMessages;
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
   * The API omits this field for Notetakers that use Notetaker settings: those
   * created with `notetakerSettings` or `configId`, and those that inherit a
   * Notetaker configuration, such as a workspace or application configuration.
   * Read `notetakerSettings.name` for those.
   */
  name?: string;
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
   * The calendar ID associated with the Notetaker bot, if applicable.
   */
  calendarId?: string;
  /**
   * The event ID associated with the Notetaker bot, if applicable.
   */
  eventId?: string;
  /**
   * Notetaker Meeting Settings.
   * The API omits this field for Notetakers that use Notetaker settings (see
   * `name`). Read `notetakerSettings` for those.
   */
  meetingSettings?: NotetakerMeetingSettings;
  /**
   * The Notetaker's settings.
   * Returned for Notetakers that use Notetaker settings (see `name`).
   */
  notetakerSettings?: NotetakerConfigSettingsResponse;
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
   * The ID of an existing configuration to use for this Notetaker.
   * Cannot be used together with `notetakerSettings` or the deprecated
   * `name` and `meetingSettings` fields.
   */
  configId?: string;

  /**
   * Notetaker settings.
   * Cannot be used together with `configId` or the deprecated `name` and `meetingSettings` fields.
   */
  notetakerSettings?: NotetakerConfigSettings;

  /**
   * The display name for the Notetaker bot.
   * Default: Nylas Notetaker
   * @deprecated Use `notetakerSettings.name` instead.
   */
  name?: string;

  /**
   * Notetaker Meeting Settings
   * @deprecated Use `notetakerSettings` instead.
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
   * Notetaker settings to change. Omitted fields keep their current values.
   * `transcriptionSettings`, `messages`, and `videoOutput` are replaced whole,
   * so send the complete object you want to end up with.
   * Cannot be used together with the deprecated `name` and `meetingSettings` fields.
   */
  notetakerSettings?: NotetakerConfigSettings;

  /**
   * The display name for the Notetaker bot.
   * Default: Nylas Notetaker
   * @deprecated Use `notetakerSettings.name` instead.
   */
  name?: string;

  /**
   * Notetaker Meeting Settings
   * @deprecated Use `notetakerSettings` instead.
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
