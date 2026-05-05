import { ListQueryParams } from './listQueryParams.js';

/**
 * Type for when a Nylas Agent Account rule is evaluated.
 */
export type RuleTrigger = 'inbound' | 'outbound';

/**
 * Type for how rule conditions are combined.
 */
export type RuleMatchOperator = 'all' | 'any';

/**
 * Type for fields a rule condition can match.
 */
export type RuleConditionField =
  | 'from.address'
  | 'from.domain'
  | 'from.tld'
  | 'recipient.address'
  | 'recipient.domain'
  | 'recipient.tld'
  | 'outbound.type';

/**
 * Type for how a condition compares its field value.
 */
export type RuleConditionOperator = 'is' | 'is_not' | 'contains' | 'in_list';

/**
 * Type for the outbound send classification used in rule evaluation.
 */
export type RuleOutboundType = 'compose' | 'reply';

/**
 * Type for actions a rule can apply when matched.
 */
export type RuleActionType =
  | 'block'
  | 'mark_as_spam'
  | 'assign_to_folder'
  | 'mark_as_read'
  | 'mark_as_starred'
  | 'archive'
  | 'trash';

/**
 * Type for where in the processing pipeline a rule evaluation happened.
 */
export type RuleEvaluationStage =
  | 'smtp_rcpt'
  | 'inbox_processing'
  | 'outbound_send';

/**
 * Interface representing a Nylas Agent Account rule condition.
 */
export interface RuleCondition {
  /**
   * The field to match against.
   */
  field: RuleConditionField;
  /**
   * How to compare the field value.
   */
  operator: RuleConditionOperator;
  /**
   * The value to compare against. For in_list, pass one or more List IDs.
   */
  value: string | string[];
}

/**
 * Interface representing the match clause for a rule.
 */
export interface RuleMatch {
  /**
   * How conditions are combined. Defaults to all when omitted.
   */
  operator?: RuleMatchOperator;
  /**
   * The list of conditions to evaluate.
   */
  conditions: RuleCondition[];
}

/**
 * Interface representing a Nylas Agent Account rule action.
 */
export interface RuleAction {
  /**
   * The action to take when the rule matches.
   */
  type: RuleActionType;
  /**
   * Required when type is assign_to_folder.
   */
  value?: string;
}

/**
 * Interface representing a Nylas Agent Account rule.
 */
export interface Rule {
  /**
   * Globally unique identifier for the rule.
   */
  id: string;
  /**
   * Human-readable name for the rule.
   */
  name: string;
  /**
   * Optional description of what the rule does.
   */
  description?: string;
  /**
   * Execution order for the rule. Lower numbers run first.
   */
  priority?: number;
  /**
   * Whether the rule is active.
   */
  enabled?: boolean;
  /**
   * When the rule is evaluated.
   */
  trigger?: RuleTrigger;
  /**
   * Conditions that must be met for the rule to apply.
   */
  match: RuleMatch;
  /**
   * Actions to perform when the rule matches.
   */
  actions: RuleAction[];
  /**
   * The ID of the application that owns the rule.
   */
  applicationId?: string;
  /**
   * The ID of the Nylas organization that owns the rule.
   */
  organizationId?: string;
  /**
   * Unix timestamp when the rule was created.
   */
  createdAt?: number;
  /**
   * Unix timestamp when the rule was last updated.
   */
  updatedAt?: number;
}

/**
 * Interface representing a request to create a Nylas Agent Account rule.
 */
export interface CreateRuleRequest {
  /**
   * Human-readable name for the rule.
   */
  name: string;
  /**
   * Optional description of what the rule does.
   */
  description?: string;
  /**
   * Execution order for the rule. Lower numbers run first.
   */
  priority?: number;
  /**
   * Whether the rule is active.
   */
  enabled?: boolean;
  /**
   * When the rule is evaluated.
   */
  trigger?: RuleTrigger;
  /**
   * Conditions that must be met for the rule to apply.
   */
  match: RuleMatch;
  /**
   * Actions to perform when the rule matches.
   */
  actions: RuleAction[];
}

/**
 * Interface representing a request to update a Nylas Agent Account rule.
 */
export interface UpdateRuleRequest {
  /**
   * Human-readable name for the rule.
   */
  name?: string;
  /**
   * Optional description of what the rule does.
   */
  description?: string;
  /**
   * Execution order for the rule. Lower numbers run first.
   */
  priority?: number;
  /**
   * Whether the rule is active.
   */
  enabled?: boolean;
  /**
   * When the rule is evaluated.
   */
  trigger?: RuleTrigger;
  /**
   * Conditions that must be met for the rule to apply.
   */
  match?: RuleMatch;
  /**
   * Actions to perform when the rule matches.
   */
  actions?: RuleAction[];
}

/**
 * Interface representing the normalized data evaluated by the Rules engine.
 */
export interface RuleEvaluationInput {
  /**
   * The normalized sender email address.
   */
  fromAddress?: string;
  /**
   * The normalized sender domain.
   */
  fromDomain?: string;
  /**
   * The normalized sender top-level domain.
   */
  fromTld?: string;
  /**
   * Outbound recipient email addresses considered during rule evaluation.
   */
  recipientAddresses?: string[];
  /**
   * Outbound recipient domains considered during rule evaluation.
   */
  recipientDomains?: string[];
  /**
   * Outbound recipient top-level domains considered during rule evaluation.
   */
  recipientTlds?: string[];
  /**
   * Outbound send classification used during rule evaluation.
   */
  outboundType?: RuleOutboundType;
}

/**
 * Interface representing actions applied during a rule evaluation.
 */
export interface RuleEvaluationAppliedActions {
  /**
   * Whether the inbound message or outbound send was blocked.
   */
  blocked?: boolean;
  /**
   * Whether the message or stored sent copy was moved to spam.
   */
  markedAsSpam?: boolean;
  /**
   * Whether the message or stored sent copy was marked as read.
   */
  markedAsRead?: boolean;
  /**
   * Whether the message or stored sent copy was starred.
   */
  markedStarred?: boolean;
  /**
   * Whether the message or stored sent copy was archived.
   */
  archived?: boolean;
  /**
   * Whether the message or stored sent copy was moved to trash.
   */
  trashed?: boolean;
  /**
   * IDs of folders assigned by matching rules.
   */
  folderIds?: string[];
}

/**
 * Interface representing a Nylas Agent Account rule evaluation record.
 */
export interface RuleEvaluation {
  /**
   * Globally unique identifier for this evaluation record.
   */
  id: string;
  /**
   * The grant this evaluation belongs to.
   */
  grantId: string;
  /**
   * The inbound message or stored sent copy associated with this evaluation.
   */
  messageId?: string | null;
  /**
   * Unix timestamp when the evaluation occurred.
   */
  evaluatedAt?: number;
  /**
   * Where in the processing pipeline the evaluation happened.
   */
  evaluationStage?: RuleEvaluationStage;
  /**
   * The normalized data that rules were matched against.
   */
  evaluationInput?: RuleEvaluationInput;
  /**
   * The actions that were applied as a result of matching rules.
   */
  appliedActions?: RuleEvaluationAppliedActions;
  /**
   * IDs of the rules that matched during this evaluation.
   */
  matchedRuleIds?: string[];
  /**
   * The ID of the application this evaluation belongs to.
   */
  applicationId?: string;
  /**
   * The ID of the Nylas organization this evaluation belongs to.
   */
  organizationId?: string;
  /**
   * Unix timestamp when the evaluation record was created.
   */
  createdAt?: number;
  /**
   * Unix timestamp when the evaluation record was last updated.
   */
  updatedAt?: number;
}

/**
 * Interface representing query parameters for listing rules.
 */
export type ListRulesQueryParams = ListQueryParams;

/**
 * Interface representing query parameters for listing rule evaluations.
 */
export type ListRuleEvaluationsQueryParams = ListQueryParams;
