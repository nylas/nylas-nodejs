import FormData from 'form-data';
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
  SendMimeMessageRequest,
  SendMimeMessageQueryParams,
  StopScheduledMessageResponse,
  UpdateMessageRequest,
} from '../models/messages.js';
import {
  NylasBaseResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import {
  encodeAttachmentStreams,
  objKeysToSnakeCase,
  makePathParams,
  calculateTotalPayloadSize,
} from '../utils.js';
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
 * The parameters for the {@link Messages.sendMime} method
 * @property identifier The identifier of the grant to act upon
 * @property requestBody The MIME message to send
 * @property queryParams The query parameters for the MIME send request
 */
export interface SendMimeMessageParams {
  identifier: string;
  requestBody: SendMimeMessageRequest;
  queryParams: SendMimeMessageQueryParams;
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
    const modifiedQueryParams: Record<string, unknown> | undefined = queryParams
      ? { ...queryParams }
      : undefined;

    // Transform some query params that are arrays into comma-delimited strings
    if (modifiedQueryParams && queryParams) {
      if (Array.isArray(queryParams?.anyEmail)) {
        delete modifiedQueryParams.anyEmail;
        modifiedQueryParams['any_email'] = queryParams.anyEmail.join(',');
      }
    }

    return super._list<NylasListResponse<Message>>({
      queryParams: modifiedQueryParams,
      overrides,
      path: makePathParams('/v3/grants/{identifier}/messages', { identifier }),
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
      path: makePathParams('/v3/grants/{identifier}/messages/{messageId}', {
        identifier,
        messageId,
      }),
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
      path: makePathParams('/v3/grants/{identifier}/messages/{messageId}', {
        identifier,
        messageId,
      }),
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
      path: makePathParams('/v3/grants/{identifier}/messages/{messageId}', {
        identifier,
        messageId,
      }),
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
    const path = makePathParams('/v3/grants/{identifier}/messages/send', {
      identifier,
    });
    const requestOptions: RequestOptionsParams = {
      method: 'POST',
      path,
      overrides,
    };

    // Use form data if the total payload size (body + attachments) is greater than 3mb
    const totalPayloadSize = calculateTotalPayloadSize(requestBody);

    if (totalPayloadSize >= Messages.MAXIMUM_JSON_ATTACHMENT_SIZE) {
      requestOptions.form = Messages._buildFormRequest(requestBody);
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
   * Send an email using raw MIME format
   * @return The sent message
   */
  public async sendMime({
    identifier,
    requestBody,
    queryParams,
    overrides,
  }: SendMimeMessageParams & Overrides): Promise<NylasResponse<Message>> {
    const path = makePathParams('/v3/grants/{identifier}/messages/send', {
      identifier,
    });
    
    // Create FormData for MIME message
    const FD = require('form-data');
    const FormDataConstructor = FD.default || FD;
    const form: FormData = new FormDataConstructor();
    
    // Add MIME content
    form.append('mime', requestBody.mime);
    
    // Add metadata (defaults to empty string if not provided)
    if (requestBody.metadata) {
      form.append('metadata', requestBody.metadata);
    }

    const requestOptions: RequestOptionsParams = {
      method: 'POST',
      path,
      form,
      queryParams,
      overrides,
    };

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
      path: makePathParams('/v3/grants/{identifier}/messages/schedules', {
        identifier,
      }),
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
      path: makePathParams(
        '/v3/grants/{identifier}/messages/schedules/{scheduleId}',
        { identifier, scheduleId }
      ),
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
      path: makePathParams(
        '/v3/grants/{identifier}/messages/schedules/{scheduleId}',
        { identifier, scheduleId }
      ),
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
      path: makePathParams('/v3/grants/{identifier}/messages/clean', {
        identifier,
      }),
      body: requestBody,
      overrides,
    });
  }

  static _buildFormRequest(
    requestBody: CreateDraftRequest | UpdateDraftRequest | SendMessageRequest
  ): FormData {
    // FormData imports are funky, cjs needs to use .default, es6 doesn't
    const FD = require('form-data');
    const FormDataConstructor = FD.default || FD;
    const form: FormData = new FormDataConstructor();

    // Split out the message payload from the attachments
    const messagePayload = {
      ...requestBody,
      attachments: undefined,
    };
    form.append('message', JSON.stringify(objKeysToSnakeCase(messagePayload)));

    // Add a separate form field for each attachment
    requestBody.attachments?.forEach((attachment, index) => {
      const contentId = attachment.contentId || `file${index}`;
      form.append(contentId, attachment.content, {
        filename: attachment.filename,
        contentType: attachment.contentType,
      });
    });

    return form;
  }
}
