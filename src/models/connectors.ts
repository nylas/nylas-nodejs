import { Provider } from './auth.js';
import { ListQueryParams } from './listQueryParams.js';

/**
 * Interface representing the Nylas connector response.
 */
export interface Connector {
  /**
   * The provider type
   */
  provider: Provider;
  /**
   * Optional settings from provider
   */
  settings?: Record<string, unknown>;
  /**
   * Default scopes for the connector
   */
  scope?: string[];
}

/**
 * Interface representing a Google connector creation request.
 */
export interface GoogleCreateConnectorSettings {
  /**
   * The Google Client ID
   */
  clientId: string;
  /**
   * The Google Client Secret
   */
  clientSecret: string;
  /**
   * The Google Pub/Sub topic name
   */
  topicName?: string;
}

/**
 * Interface representing a Microsoft connector creation request.
 */
export interface MicrosoftCreateConnectorSettings {
  /**
   * The Microsoft Client ID
   */
  clientId: string;
  /**
   * The Microsoft Client Secret
   */
  clientSecret: string;
  /**
   * The Microsoft tenant ID
   */
  tenant?: string;
}

/**
 * Interface representing the base Nylas connector creation request.
 */
interface BaseCreateConnectionRequest {
  /**
   * Custom name of the connector
   */
  name: string;
  /**
   * The provider type
   */
  provider: Provider;
}

/**
 * Interface representing the base Nylas connector creation request.
 */
export interface GoogleCreateConnectorRequest
  extends BaseCreateConnectionRequest {
  /**
   * The Google OAuth provider credentials and settings
   */
  settings: GoogleCreateConnectorSettings;
  /**
   * The Google OAuth scopes
   */
  scope?: string[];
}

export interface MicrosoftCreateConnectorRequest
  extends BaseCreateConnectionRequest {
  /**
   * The Microsoft OAuth provider credentials and settings
   */
  settings: MicrosoftCreateConnectorSettings;
  /**
   * The Microsoft OAuth scopes
   */
  scope?: string[];
}

/**
 * Interface representing the base Nylas connector creation request.
 */
export type ImapCreateConnectorRequest = BaseCreateConnectionRequest;

/**
 * Interface representing the base Nylas connector creation request.
 */
export type VirtualCalendarsCreateConnectorRequest = BaseCreateConnectionRequest;

/**
 * The type of the Nylas connector creation request.
 */
export type CreateConnectorRequest =
  | GoogleCreateConnectorRequest
  | MicrosoftCreateConnectorRequest
  | ImapCreateConnectorRequest
  | VirtualCalendarsCreateConnectorRequest;

/**
 * Interface representing the base Nylas connector creation request.
 */
export interface UpdateConnectorRequest {
  /**
   * Custom name of the connector
   */
  name?: string;
  /**
   * The OAuth provider credentials and settings
   */
  settings?: Record<string, unknown>;
  /**
   * The OAuth scopes
   */
  scope?: string[];
}

/**
 * Interface of the query parameters for listing connectors.
 */
export type ListConnectorsQueryParams = ListQueryParams;
