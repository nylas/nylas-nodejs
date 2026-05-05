import { ListQueryParams } from './listQueryParams.js';

/**
 * Interface representing operational limits for Nylas Agent Accounts.
 */
export interface PolicyLimits {
  /**
   * Maximum size, in bytes, for a single attachment.
   */
  limitAttachmentSizeLimit?: number;
  /**
   * Maximum number of attachments allowed on a single message.
   */
  limitAttachmentCountLimit?: number;
  /**
   * Allowed attachment MIME types.
   */
  limitAttachmentAllowedTypes?: string[];
  /**
   * Maximum total MIME size, in bytes, for a single message.
   */
  limitSizeTotalMime?: number;
  /**
   * Maximum total storage, in bytes, for each inbox using this policy.
   */
  limitStorageTotal?: number;
  /**
   * Maximum number of messages each grant can send per day.
   */
  limitCountDailyMessagePerGrant?: number;
  /**
   * How long, in days, to retain messages in the inbox.
   */
  limitInboxRetentionPeriod?: number;
  /**
   * How long, in days, to retain messages in the spam folder.
   */
  limitSpamRetentionPeriod?: number;
}

/**
 * Interface representing spam detection settings for Nylas Agent Accounts.
 */
export interface PolicySpamDetection {
  /**
   * Whether to enable DNS-based block list checking on inbound messages.
   */
  useListDnsbl?: boolean;
  /**
   * Whether to enable header anomaly detection on inbound messages.
   */
  useHeaderAnomalyDetection?: boolean;
  /**
   * Spam detection sensitivity. Higher values mark more messages as spam.
   */
  spamSensitivity?: number;
}

/**
 * Interface representing miscellaneous policy options.
 */
export interface PolicyOptions {
  /**
   * Extra folders to create for inboxes that use this policy.
   */
  additionalFolders?: string[];
  /**
   * Whether to enable CIDR-based email aliasing for inboxes that use this policy.
   */
  useCidrAliasing?: boolean;
}

/**
 * Interface representing a Nylas Agent Account policy.
 */
export interface Policy {
  /**
   * Globally unique identifier for the policy.
   */
  id: string;
  /**
   * Human-readable name for the policy.
   */
  name: string;
  /**
   * The ID of the application that owns the policy.
   */
  applicationId?: string;
  /**
   * The ID of the Nylas organization that owns the policy.
   */
  organizationId?: string;
  /**
   * Miscellaneous options for inboxes that use this policy.
   */
  options?: PolicyOptions;
  /**
   * Operational limits enforced for inboxes that use this policy.
   */
  limits?: PolicyLimits;
  /**
   * Rule IDs linked to this policy for inbound processing.
   */
  rules?: string[];
  /**
   * Spam detection configuration for inboxes that use this policy.
   */
  spamDetection?: PolicySpamDetection;
  /**
   * Unix timestamp when the policy was created.
   */
  createdAt?: number;
  /**
   * Unix timestamp when the policy was last updated.
   */
  updatedAt?: number;
}

/**
 * Interface representing a request to create a Nylas Agent Account policy.
 */
export interface CreatePolicyRequest {
  /**
   * Human-readable name for the policy.
   */
  name: string;
  /**
   * Miscellaneous options for inboxes that use this policy.
   */
  options?: PolicyOptions;
  /**
   * Operational limits enforced for inboxes that use this policy.
   */
  limits?: PolicyLimits;
  /**
   * Rule IDs to link to this policy for inbound processing.
   */
  rules?: string[];
  /**
   * Spam detection configuration for inboxes that use this policy.
   */
  spamDetection?: PolicySpamDetection;
}

/**
 * Interface representing a request to update a Nylas Agent Account policy.
 */
export interface UpdatePolicyRequest {
  /**
   * Human-readable name for the policy.
   */
  name?: string;
  /**
   * Miscellaneous options for inboxes that use this policy.
   */
  options?: PolicyOptions;
  /**
   * Operational limits enforced for inboxes that use this policy.
   */
  limits?: PolicyLimits;
  /**
   * Rule IDs to link to this policy for inbound processing.
   */
  rules?: string[];
  /**
   * Spam detection configuration for inboxes that use this policy.
   */
  spamDetection?: PolicySpamDetection;
}

/**
 * Interface representing query parameters for listing policies.
 */
export type ListPoliciesQueryParams = ListQueryParams;
