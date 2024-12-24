import { FormData, File } from 'formdata-node';
import APIClient, { RequestOptionsParams } from '../apiClient.js';
import { Overrides } from '../config.js';
import {
  CreateDraftRequest,
  SendMessageRequest,
  UpdateDraftRequest,
} from '../models/drafts.js';
import {
  CleanMessagesRequest,
  CleanMessagesResponse,
  FindMessageQueryParams,
  ListMessagesQueryParams,
  Message,
  ScheduledMessage,
  ScheduledMessagesList,
  StopScheduledMessageResponse,
  UpdateMessageRequest,
} from '../models/messages.js';
import {
  NylasBaseResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { encodeAttachmentStreams, objKeysToSnakeCase } from '../utils.js';
import { AsyncListResponse, Resource } from './resource.js';
import { SmartCompose } from './smartCompose.js';

/**
 * The parameters for the {@link Messages.list} method
 * @property identifier The identifier of the grant to act upon
 * @property queryParams The query parameters to include in the request
 */
export interface ListMessagesParams {
  identifier: string;
  queryParams?: ListMessagesQueryParams;
}

/**
 * The parameters for the {@link Messages.find} method
 * @property identifier The identifier of the grant to act upon
 * @property messageId The id of the message to retrieve.
 * @property queryParams The query parameters to include in the request
 */
export interface FindMessageParams {
  identifier: string;
  messageId: string;
  queryParams?: FindMessageQueryParams;
}

/**
 * The parameters for the {@link Messages.update} method
 * @property identifier The identifier of the grant to act upon
 * @property messageId The id of the message to update
 * @property requestBody The values to update the message with
 */
export interface UpdateMessageParams {
  identifier: string;
  messageId: string;
  requestBody: UpdateMessageRequest;
}

/**
 * The parameters for the {@link Messages.destroy} method
 * @property identifier The identifier of the grant to act upon
 * @property messageId The id of the message to delete
 */
export interface DestroyMessageParams {
  identifier: string;
  messageId: string;
}

/**
 * The parameters for the {@link Messages.send} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The message to send
 */
export interface SendMessageParams {
  identifier: string;
  requestBody: SendMessageRequest;
}

/**
 * The parameters for the {@link Messages.listScheduledMessages} method
 * @property identifier The identifier of the grant to act upon
 */
export interface ListScheduledMessagesParams {
  identifier: string;
}

/**
 * The parameters for the {@link Messages.findScheduledMessage} method
 * @property identifier The identifier of the grant to act upon
 * @property scheduleId The id of the scheduled message to retrieve.
 */
export interface FindScheduledMessageParams {
  identifier: string;
  scheduleId: string;
}

/**
 * The parameters for the {@link Messages.stopScheduledMessage} method
 * @property identifier The identifier of the grant to act upon
 * @property scheduleId The id of the scheduled message to destroy.
 */
export type StopScheduledMessageParams = FindScheduledMessageParams;

/**
 * The parameters for the {@link Messages.cleanMessages} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The values to clean the message with
 */
export interface CleanMessagesParams {
  identifier: string;
  requestBody: CleanMessagesRequest;
}

/**
 * Nylas Messages API
 *
 * The Nylas Messages API allows you to list, find, update, delete, schedule, and send messages on user accounts.
 */
export class Messages extends Resource {
  public smartCompose: SmartCompose;
  // The maximum size of an attachment that can be sent using json
  static MAXIMUM_JSON_ATTACHMENT_SIZE = 3 * 1024 * 1024;

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
    queryParams,
  }: FindMessageParams & Overrides): Promise<NylasResponse<Message>> {
    return super._find({
      path: `/v3/grants/${identifier}/messages/${messageId}`,
      overrides,
      queryParams,
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
  }: DestroyMessageParams & Overrides): Promise<NylasBaseResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/messages/${messageId}`,
      overrides,
    });
  }

  /**
   * Send an email
   * @return The sent message
   */
  public async send({
    identifier,
    requestBody,
    overrides,
  }: SendMessageParams & Overrides): Promise<NylasResponse<Message>> {
    const path = `/v3/grants/${identifier}/messages/send`;
    const requestOptions: RequestOptionsParams = {
      method: 'POST',
      path,
      overrides,
    };

    // Use form data only if the attachment size is greater than 3mb
    const attachmentSize =
      requestBody.attachments?.reduce((total, attachment) => {
        return total + (attachment.size || 0);
      }, 0) || 0;

    if (attachmentSize >= Messages.MAXIMUM_JSON_ATTACHMENT_SIZE) {
      requestOptions.form = await Messages._buildFormRequest(requestBody);
    } else {
      if (requestBody.attachments) {
        const processedAttachments = await encodeAttachmentStreams(
          requestBody.attachments
        );

        requestOptions.body = {
          ...requestBody,
          attachments: processedAttachments,
        };
      } else {
        requestOptions.body = requestBody;
      }
    }

    return this.apiClient.request(requestOptions);
  }

  /**
   * Retrieve your scheduled messages
   * @return A list of scheduled messages
   */
  public listScheduledMessages({
    identifier,
    overrides,
  }: ListScheduledMessagesParams & Overrides): Promise<
    NylasResponse<ScheduledMessagesList>
  > {
    return super._find({
      path: `/v3/grants/${identifier}/messages/schedules`,
      overrides,
    });
  }

  /**
   * Retrieve a scheduled message
   * @return The scheduled message
   */
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

  /**
   * Stop a scheduled message
   * @return The confirmation of the stopped scheduled message
   */
  public stopScheduledMessage({
    identifier,
    scheduleId,
    overrides,
  }: StopScheduledMessageParams & Overrides): Promise<
    NylasResponse<StopScheduledMessageResponse>
  > {
    return super._destroy({
      path: `/v3/grants/${identifier}/messages/schedules/${scheduleId}`,
      overrides,
    });
  }

  /**
   * Remove extra information from a list of messages
   * @return The list of cleaned messages
   */
  public cleanMessages({
    identifier,
    requestBody,
    overrides,
  }: CleanMessagesParams & Overrides): Promise<
    NylasListResponse<CleanMessagesResponse>
  > {
    return this.apiClient.request<NylasListResponse<CleanMessagesResponse>>({
      method: 'PUT',
      path: `/v3/grants/${identifier}/messages/clean`,
      body: requestBody,
      overrides,
    });
  }

  static async _buildFormRequest(
    requestBody: CreateDraftRequest | UpdateDraftRequest | SendMessageRequest
  ): Promise<FormData> {
    const form = new FormData();

    // Split out the message payload from the attachments
    const messagePayload = {
      ...requestBody,
      attachments: undefined,
    };
    form.append('message', JSON.stringify(objKeysToSnakeCase(messagePayload)));

    // Add a separate form field for each attachment
    if (requestBody.attachments) {
      for (const [index, attachment] of requestBody.attachments.entries()) {
        const contentId = attachment.contentId || `file${index}`;
        // Handle different types of content (Buffer, ReadableStream, string)
        let file;
        if (attachment.content instanceof Buffer || typeof attachment.content === 'string') {
          file = new File([attachment.content], attachment.filename, { type: attachment.contentType });
        } else if (attachment.content instanceof ReadableStream) {
          // For ReadableStream, we need to read it into a buffer first
          const chunks: Buffer[] = [];
          const reader = attachment.content.getReader();
          let result = await reader.read();
          while (!result.done) {
            chunks.push(Buffer.from(result.value));
            result = await reader.read();
          }
          const buffer = Buffer.concat(chunks);
          file = new File([buffer], attachment.filename, { type: attachment.contentType });
        } else {
          throw new Error('Unsupported attachment content type');
        }
        form.append(contentId, file);
      }
    }

    return form;
  }
}
