import { Resource } from './resource.js';
import {
  ComposeMessageRequest,
  ComposeMessageResponse,
} from '../models/smartCompose.js';
import { Overrides } from '../config.js';
import { NylasResponse } from '../models/response.js';

interface ComposeMessageParams {
  identifier: string;
  requestBody: ComposeMessageRequest;
}

interface ComposeMessageReplyParams {
  identifier: string;
  messageId: string;
  requestBody: ComposeMessageReplyParams;
}

export class SmartCompose extends Resource {
  public composeMessage({
    identifier,
    requestBody,
    overrides,
  }: ComposeMessageParams & Overrides): Promise<
    NylasResponse<ComposeMessageResponse>
  > {
    return super._create({
      path: `/v3/grants/${identifier}/messages/smart-compose`,
      requestBody,
      overrides,
    });
  }

  public composeMessageReply({
    identifier,
    messageId,
    requestBody,
    overrides,
  }: ComposeMessageReplyParams & Overrides): Promise<
    NylasResponse<ComposeMessageResponse>
  > {
    return super._create({
      path: `/v3/grants/${identifier}/messages/${messageId}/smart-compose`,
      requestBody,
      overrides,
    });
  }
}
