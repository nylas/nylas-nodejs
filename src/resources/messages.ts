import { AsyncListResponse, Resource } from './resource.js';
import {
  FindMessageQueryParams,
  ListMessagesQueryParams,
  Message,
  UpdateMessageRequest,
} from '../models/messages.js';
import { Overrides } from '../config.js';
import {
  NylasDeleteResponse,
  NylasListResponse,
  NylasResponse,
} from '../models/response.js';
import { CreateDraftRequest } from '../models/drafts.js';
import { CreateFileRequest } from '../models/files.js';
import * as fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import mime from 'mime-types';
import { objKeysToSnakeCase } from '../utils.js';

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

export class Messages extends Resource {
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
  }: FindMessageParams & Overrides): Promise<NylasResponse<FindMessageParams>> {
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
    const sendPath = `/v3/grants/${identifier}/messages/send`;

    if (this._useMultipart(requestBody.attachments)) {
      const form = new FormData();

      // Split out the message payload from the attachments
      const messagePayload = {
        ...requestBody,
        attachments: undefined,
      };
      form.append(
        'message',
        JSON.stringify(objKeysToSnakeCase(messagePayload))
      );

      // Add a separate form field for each attachment
      requestBody.attachments?.forEach((attachment, index) => {
        form.append(`file${index}`, attachment.content, {
          filename: attachment.filename,
          contentType: attachment.contentType,
        });
      });

      return this.apiClient.request({
        method: 'POST',
        path: sendPath,
        form,
        overrides,
      });
    } else {
      return super._create({
        path: sendPath,
        requestBody,
        overrides,
      });
    }
  }

  public createFileRequestBuilder(filePath: string): CreateFileRequest {
    const stats = fs.statSync(filePath);
    const filename = path.basename(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    const content = fs.readFileSync(filePath).toString('base64');

    return {
      filename,
      contentType,
      content,
      size: stats.size,
    };
  }

  private _useMultipart(attachments?: CreateFileRequest[]): boolean {
    if (!attachments || attachments.length == 0) {
      return false;
    }

    const totalSize = attachments.reduce((acc, attachment) => {
      const stats = attachment.size || 0;
      return acc + stats;
    }, 0);

    return totalSize > 3 * 1024 * 1024; // 3MB in bytes
  }
}
