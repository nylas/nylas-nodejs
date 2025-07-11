/**
 * Types and interfaces for third-party developers building extensions or integrations with the Nylas SDK.
 * 
 * This module provides type-only exports for:
 * - Configuration types
 * - Base classes and interfaces
 * - Resource parameter interfaces
 * - Request/response types
 * - Error types
 * - Constants and utility types
 * 
 * @example
 * ```typescript
 * import type { NylasConfig, ListMessagesParams, NylasResponse } from 'nylas/types';
 * 
 * // Use types for configuration
 * const config: NylasConfig = {
 *   apiKey: 'your-api-key',
 *   apiUri: 'https://api.us.nylas.com'
 * };
 * 
 * // Use types for method parameters
 * const params: ListMessagesParams = {
 *   identifier: 'grant-id',
 *   queryParams: { limit: 10 }
 * };
 * ```
 */

// Configuration types
export type {
  NylasConfig,
  OverridableNylasConfig,
  Overrides,
  Region,
} from './config.js';

export {
  REGION_CONFIG,
  DEFAULT_SERVER_URL,
  DEFAULT_REGION,
} from './config.js';

// Base classes and interfaces
export type { AsyncListResponse } from './resources/resource.js';
export { Resource } from './resources/resource.js';
export type { default as APIClient } from './apiClient.js';

// Export enum values that need to be used at runtime
export { WhenType } from './models/events.js';

// APIClient types
export type { RequestOptionsParams } from './apiClient.js';
export { FLOW_ID_HEADER, REQUEST_ID_HEADER } from './apiClient.js';

// Response types
export type {
  NylasResponse,
  NylasListResponse,
  NylasBaseResponse,
  ListResponseInnerType,
} from './models/response.js';

// Common query parameter types
export type { ListQueryParams } from './models/listQueryParams.js';

// Error types
export type {
  AbstractNylasApiError,
  AbstractNylasSdkError,
  NylasApiError,
  NylasOAuthError,
  NylasSdkTimeoutError,
  NylasApiErrorResponse,
  NylasApiErrorResponseData,
  NylasOAuthErrorResponse,
} from './models/error.js';

// Resource parameter interfaces - Applications
export type {
  FindRedirectUrisParams,
  CreateRedirectUrisParams,
  UpdateRedirectUrisParams,
  DestroyRedirectUrisParams,
} from './resources/redirectUris.js';

// Resource parameter interfaces - Auth
// Note: Auth interfaces are mostly internal

// Resource parameter interfaces - Attachments
// Note: Attachment interfaces are mostly internal

// Resource parameter interfaces - Bookings
export type {
  FindBookingParams,
  CreateBookingParams,
  ConfirmBookingParams,
  RescheduleBookingParams,
  DestroyBookingParams,
} from './resources/bookings.js';

// Resource parameter interfaces - Calendars
export type {
  FindCalendarParams,
  ListCalendersParams,
  CreateCalendarParams,
  UpdateCalendarParams,
  DestroyCalendarParams,
  GetAvailabilityParams,
  GetFreeBusyParams,
} from './resources/calendars.js';

// Resource parameter interfaces - Configurations
export type {
  FindConfigurationParams,
  ListConfigurationsParams,
  CreateConfigurationParams,
  UpdateConfigurationParams,
  DestroyConfigurationParams,
} from './resources/configurations.js';

// Resource parameter interfaces - Drafts
export type {
  ListDraftsParams,
  FindDraftParams,
  CreateDraftParams,
  UpdateDraftParams,
} from './resources/drafts.js';

// Resource parameter interfaces - Events
export type {
  FindEventParams,
  ListEventParams,
  CreateEventParams,
  UpdateEventParams,
  DestroyEventParams,
  ListImportEventParams,
} from './resources/events.js';

// Resource parameter interfaces - Folders
// Note: Folder interfaces are mostly internal

// Resource parameter interfaces - Grants
export type {
  ListGrantsParams,
  FindGrantParams,
  UpdateGrantParams,
  DestroyGrantParams,
} from './resources/grants.js';

// Resource parameter interfaces - Messages
export type {
  ListMessagesParams,
  FindMessageParams,
  UpdateMessageParams,
  DestroyMessageParams,
  SendMessageParams,
  ListScheduledMessagesParams,
  FindScheduledMessageParams,
  StopScheduledMessageParams,
  CleanMessagesParams,
} from './resources/messages.js';

// Resource parameter interfaces - Notetakers
export type {
  ListNotetakersParams,
  CreateNotetakerParams,
  FindNotetakerParams,
  UpdateNotetakerParams,
  CancelNotetakerParams,
  LeaveNotetakerParams,
  DownloadNotetakerMediaParams,
} from './resources/notetakers.js';

// Resource parameter interfaces - Sessions
export type {
  CreateSessionParams,
  DestroySessionParams,
} from './resources/sessions.js';

// Resource parameter interfaces - SmartCompose
export type {
  ComposeMessageParams,
  ComposeMessageReplyParams,
} from './resources/smartCompose.js';

// Resource parameter interfaces - Threads
export type {
  ListThreadsParams,
  FindThreadParams,
  UpdateThreadParams,
  DestroyThreadParams,
} from './resources/threads.js';

// Resource parameter interfaces - Webhooks
export type {
  FindWebhookParams,
  CreateWebhookParams,
  UpdateWebhookParams,
  DestroyWebhookParams,
} from './resources/webhooks.js';

// Utility constants
export { SDK_VERSION } from './version.js';

// Re-export all model types for convenience
export * from './models/index.js'; 