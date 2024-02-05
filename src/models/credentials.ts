/**
 * Interface representing a Nylas Credential object.
 */
export interface Credential {
  /**
   * Globally unique object identifier
   */
  id: string;
  /**
   * Name of the credential
   */
  name: string;
  /**
   * The type of credential
   */
  credentialType?: CredentialType;
  /**
   * Hashed value of the credential that you created
   */
  hashedData?: string;
  /**
   * Timestamp of when the credential was created
   */
  createdAt?: number;
  /**
   * Timestamp of when the credential was updated
   */
  updatedAt?: number;
}

/**
 * Interface representing additional data needed to create a credential for Microsoft Admin Consent
 */
export interface MicrosoftAdminConsentSettings {
  clientId: string;
  clientSecret: string;
  [key: string]: string;
}

/**
 * Interface representing additional data needed to create a credential for Google Service Account
 */
export interface GoogleServiceAccountCredential {
  privateKeyId: string;
  privateKey: string;
  clientEmail: string;
  [key: string]: string;
}

/**
 * Interface representing additional data needed to create a credential for a Connector Override
 */
export type ConnectorOverrideCredential = Record<string, unknown>;

/**
 * Type representing the data needed to create a credential
 */
export type CredentialData =
  | MicrosoftAdminConsentSettings
  | GoogleServiceAccountCredential
  | ConnectorOverrideCredential;

/**
 * Interface representing a request to create a Microsoft Admin Consent credential
 */
export interface CreateMicrosoftCredentialRequest {
  /**
   * Unique name of this credential
   */
  name: string;
  /**
   * Type of credential for the admin consent flow
   */
  credentialType: CredentialType.ADMINCONSENT;
  /**
   * Data that specifies some special data required for this credential
   */
  credentialData: MicrosoftAdminConsentSettings;
}

/**
 * Interface representing a request to create a Google Service Account credential
 */
export interface CreateGoogleCredentialRequest {
  /**
   * Unique name of this credential
   */
  name: string;
  /**
   * Type of credential for the app permission flow
   */
  credentialType: CredentialType.SERVICEACCOUNT;
  /**
   * Data that specifies some special data required for this credential
   */
  credentialData: GoogleServiceAccountCredential;
}

/**
 * Interface representing a request to create a Connector Override credential
 */
export interface CreateOverrideCredentialRequest {
  /**
   * Unique name of this credential
   */
  name: string;
  /**
   * Type of credential to force the override of a connector's client values
   */
  credentialType: CredentialType.CONNECTOR;
  /**
   * Data that specifies some special data required for this credential
   */
  credentialData: ConnectorOverrideCredential;
}

/**
 * Interface representing a request to create a credential
 */
export type CreateCredentialRequest =
  | CreateMicrosoftCredentialRequest
  | CreateGoogleCredentialRequest
  | CreateOverrideCredentialRequest;

/**
 * Interface representing a request to update a credential
 */
export interface UpdateCredentialRequest {
  /**
   * Unique name of this credential
   */
  name?: string;
  /**
   * Data that specifies some special data required for this credential
   */
  credentialData?: CredentialData;
}

/**
 * Enum representing the type of credential
 */
export enum CredentialType {
  ADMINCONSENT = 'adminconsent',
  SERVICEACCOUNT = 'serviceaccount',
  CONNECTOR = 'connector',
}

/**
 * Interface representing the query parameters for listing credentials.
 */
export interface ListCredentialsQueryParams {
  /**
   * Limit the number of results
   */
  limit?: number;
  /**
   * Offset the results by this number
   */
  offset?: number;
  /**
   * Sort the results by field name
   */
  sortBy?: 'createdAt' | 'updatedAt';
  /**
   * Order the results by ascending or descending
   */
  orderBy?: 'desc' | 'asc';
}
