import { Overrides } from '../config.js';
import {
  CreateRuleRequest,
  ListRuleEvaluationsQueryParams,
  ListRulesQueryParams,
  Rule,
  RuleEvaluation,
  UpdateRuleRequest,
} from '../models/rules.js';
import {
  NylasBaseResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { makePathParams } from '../utils.js';
import { AsyncListResponse, Resource } from './resource.js';

/**
 * @property queryParams The query parameters to include in the request.
 */
interface ListRulesParams {
  queryParams?: ListRulesQueryParams;
}

/**
 * @property ruleId The ID of the rule to retrieve.
 */
interface FindRuleParams {
  ruleId: string;
}

/**
 * @property requestBody The values to create the rule with.
 */
interface CreateRuleParams {
  requestBody: CreateRuleRequest;
}

/**
 * @property ruleId The ID of the rule to update.
 * @property requestBody The values to update the rule with.
 */
interface UpdateRuleParams {
  ruleId: string;
  requestBody: UpdateRuleRequest;
}

/**
 * @property ruleId The ID of the rule to delete.
 */
interface DestroyRuleParams {
  ruleId: string;
}

/**
 * @property identifier The identifier of the grant to list rule evaluations for.
 * @property queryParams The query parameters to include in the request.
 */
interface ListRuleEvaluationsParams {
  identifier: string;
  queryParams?: ListRuleEvaluationsQueryParams;
}

/**
 * Nylas Agent Account Rules API
 *
 * Rules define inbound and outbound filtering logic for Agent Accounts.
 */
export class Rules extends Resource {
  /**
   * Return all rules.
   * @return The list of rules.
   */
  public list({
    queryParams,
    overrides,
  }: ListRulesParams & Overrides = {}): AsyncListResponse<
    NylasListResponse<Rule>
  > {
    return super._list({
      queryParams,
      path: makePathParams('/v3/rules', {}),
      overrides,
    });
  }

  /**
   * Return a rule.
   * @return The rule.
   */
  public find({
    ruleId,
    overrides,
  }: FindRuleParams & Overrides): Promise<NylasResponse<Rule>> {
    return super._find({
      path: makePathParams('/v3/rules/{ruleId}', { ruleId }),
      overrides,
    });
  }

  /**
   * Create a rule.
   * @return The created rule.
   */
  public create({
    requestBody,
    overrides,
  }: CreateRuleParams & Overrides): Promise<NylasResponse<Rule>> {
    return super._create({
      path: makePathParams('/v3/rules', {}),
      requestBody,
      overrides,
    });
  }

  /**
   * Update a rule.
   * @return The updated rule.
   */
  public update({
    ruleId,
    requestBody,
    overrides,
  }: UpdateRuleParams & Overrides): Promise<NylasResponse<Rule>> {
    return super._update({
      path: makePathParams('/v3/rules/{ruleId}', { ruleId }),
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a rule.
   * @return The deletion response.
   */
  public destroy({
    ruleId,
    overrides,
  }: DestroyRuleParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: makePathParams('/v3/rules/{ruleId}', { ruleId }),
      overrides,
    });
  }

  /**
   * Return rule evaluation records for a grant.
   * @return The list of rule evaluation records.
   */
  public listEvaluations({
    identifier,
    queryParams,
    overrides,
  }: ListRuleEvaluationsParams & Overrides): AsyncListResponse<
    NylasListResponse<RuleEvaluation>
  > {
    return super._list({
      queryParams,
      path: makePathParams('/v3/grants/{identifier}/rule-evaluations', {
        identifier,
      }),
      overrides,
    });
  }
}
