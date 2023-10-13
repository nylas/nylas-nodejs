import { AsyncListResponse, Resource } from './resource.js';
import {
  BaseCreateMessage,
  DeleteMessageResponse,
  FindMessageQueryParams,
  ListMessagesQueryParams,
  Message,
  ScheduledMessage,
  ScheduledMessagesList,
  UpdateMessageRequest,
} from '../models/messages.js';
import { Overrides } from '../config.js';
import {
  NylasDeleteResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { CreateDraftRequest } from '../models/drafts.js';
import FormData from 'form-data';
import { objKeysToSnakeCase } from '../utils.js';
import { SmartCompose } from './smartCompose.js';
import APIClient from '../apiClient.js';

interface ListMessagesParams {
  identifier: string;
  queryParams?: ListMessagesQueryParams;
}

interface FindMessageParams {
  identifier: string;
  messageId: string;
  queryParams?: FindMessageQueryParams;
}

interface UpdateMessageParams {
  identifier: string;
  messageId: string;
  requestBody: UpdateMessageRequest;
}

interface DestroyMessageParams {
  identifier: string;
  messageId: string;
}

interface SendMessageParams {
  identifier: string;
  requestBody: CreateDraftRequest;
}

interface ListScheduledMessageParams {
  identifier: string;
}

interface FindScheduledMessageParams {
  identifier: string;
  scheduleId: string;
}

export class Messages extends Resource {
  public smartCompose: SmartCompose;

  constructor(apiClient: APIClient) {
    super(apiClient);
    this.smartCompose = new SmartCompose(apiClient);
  }

  /**
   * Return all Messages
   * @return A list of messages
   */
  public list({
    identifier,
    queryParams,
    overrides,
  }: ListMessagesParams & Overrides): AsyncListResponse<
    NylasListResponse<Message>
  > {
    return super._list<NylasListResponse<Message>>({
      queryParams,
      overrides,
      path: `/v3/grants/${identifier}/messages`,
    });
  }

  /**
   * Return a Message
   * @return The message
   */
  public find({
    identifier,
    messageId,
    overrides,
  }: FindMessageParams & Overrides): Promise<NylasResponse<Message>> {
    return super._find({
      path: `/v3/grants/${identifier}/messages/${messageId}`,
      overrides,
    });
  }

  /**
   * Update a Message
   * @return The updated message
   */
  public update({
    identifier,
    messageId,
    requestBody,
    overrides,
  }: UpdateMessageParams & Overrides): Promise<NylasResponse<Message>> {
    return super._update({
      path: `/v3/grants/${identifier}/messages/${messageId}`,
      requestBody,
      overrides,
    });
  }

  /**
   * Delete a Message
   * @return The deleted message
   */
  public destroy({
    identifier,
    messageId,
    overrides,
  }: DestroyMessageParams & Overrides): Promise<NylasDeleteResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/messages/${messageId}`,
      overrides,
    });
  }

  public send({
    identifier,
    requestBody,
    overrides,
  }: SendMessageParams & Overrides): Promise<NylasResponse<Message>> {
    const form = Messages._buildFormRequest(requestBody);

    return this.apiClient.request({
      method: 'POST',
      path: `/v3/grants/${identifier}/messages/send`,
      form,
      overrides,
    });
  }

  public listScheduledMessages({
    identifier,
    overrides,
  }: ListScheduledMessageParams & Overrides): Promise<
    NylasResponse<ScheduledMessagesList>
  > {
    return super._find({
      path: `/v3/grants/${identifier}/messages/schedules`,
      overrides,
    });
  }

  public findScheduledMessage({
    identifier,
    scheduleId,
    overrides,
  }: FindScheduledMessageParams & Overrides): Promise<
    NylasResponse<ScheduledMessage>
  > {
    return super._find({
      path: `/v3/grants/${identifier}/messages/schedules/${scheduleId}`,
      overrides,
    });
  }

  public destroyScheduledMessage({
    identifier,
    scheduleId,
    overrides,
  }: FindScheduledMessageParams & Overrides): Promise<
    NylasResponse<DeleteMessageResponse>
  > {
    return super._destroy({
      path: `/v3/grants/${identifier}/messages/schedules/${scheduleId}`,
      overrides,
    });
  }

  static _buildFormRequest(requestBody: BaseCreateMessage): FormData {
    const form = new FormData();

    // Split out the message payload from the attachments
    const messagePayload = {
      ...requestBody,
      attachments: undefined,
    };
    form.append('message', JSON.stringify(objKeysToSnakeCase(messagePayload)));

    // Add a separate form field for each attachment
    requestBody.attachments?.forEach((attachment, index) => {
      form.append(`file${index}`, attachment.content, {
        filename: attachment.filename,
        contentType: attachment.contentType,
      });
    });

    return form;
  }
}
