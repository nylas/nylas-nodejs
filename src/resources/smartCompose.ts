import { Resource } from './resource.js';
import {
  ComposeMessageRequest,
  ComposeMessageResponse,
} from '../models/smartCompose.js';
import { Overrides } from '../config.js';
import { NylasResponse } from '../models/response.js';
import { makePathParams } from '../utils.js';
/**
 * The parameters for the {@link SmartCompose.composeMessage} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The prompt that smart compose will use to generate a message suggestion
 */
export interface ComposeMessageParams {
  identifier: string;
  requestBody: ComposeMessageRequest;
}

/**
 * The parameters for the {@link SmartCompose.composeMessageReply} method
 * @property identifier The identifier of the grant to act upon
 * @property messageId The id of the message to reply to
 * @property requestBody The prompt that smart compose will use to generate a reply suggestion
 */
export interface ComposeMessageReplyParams {
  identifier: string;
  messageId: string;
  requestBody: ComposeMessageRequest;
}

/**
 * A collection of Smart Compose related API endpoints.
 *
 * These endpoints allow for the generation of message suggestions.
 */
export class SmartCompose extends Resource {
  /**
   * Compose a message
   * @return The generated message
   */
  public composeMessage({
    identifier,
    requestBody,
    overrides,
  }: ComposeMessageParams & Overrides): Promise<
    NylasResponse<ComposeMessageResponse>
  > {
    return super._create({
      path: makePathParams('/v3/grants/{identifier}/messages/smart-compose', {
        identifier,
      }),
      requestBody,
      overrides,
    });
  }

  /**
   * Compose a message reply
   * @return The generated message reply
   */
  public composeMessageReply({
    identifier,
    messageId,
    requestBody,
    overrides,
  }: ComposeMessageReplyParams & Overrides): Promise<
    NylasResponse<ComposeMessageResponse>
  > {
    return super._create({
      path: makePathParams(
        '/v3/grants/{identifier}/messages/{messageId}/smart-compose',
        { identifier, messageId }
      ),
      requestBody,
      overrides,
    });
  }
}
