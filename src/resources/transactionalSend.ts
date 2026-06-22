import { RequestOptionsParams } from '../apiClient.js';
import { Overrides } from '../config.js';
import { SendMessageRequest } from '../models/drafts.js';
import { SendMessageQueryParams } from '../models/messages.js';
import { NylasResponse } from '../models/response.js';
import { TransactionalSendResult } from '../models/transactionalSend.js';
import {
  calculateTotalPayloadSize,
  encodeAttachmentContent,
  makePathParams,
} from '../utils.js';
import { Messages } from './messages.js';
import { Resource } from './resource.js';

/**
 * @property domainName The verified domain name to send the message from.
 * @property requestBody The message to send.
 * @property queryParams The query parameters to include in the request.
 */
export interface SendTransactionalEmailParams {
  domainName: string;
  requestBody: SendMessageRequest;
  queryParams?: SendMessageQueryParams;
}

/**
 * Nylas Transactional Send API
 *
 * Send messages directly from a verified domain without grant-based authentication.
 */
export class TransactionalSend extends Resource {
  /**
   * Send a transactional email from a verified domain.
   * @return The sent message identifier.
   */
  public async send({
    domainName,
    requestBody,
    queryParams,
    overrides,
  }: SendTransactionalEmailParams & Overrides): Promise<
    NylasResponse<TransactionalSendResult>
  > {
    const path = makePathParams('/v3/domains/{domainName}/messages/send', {
      domainName,
    });
    const requestOptions: RequestOptionsParams = {
      method: 'POST',
      path,
      queryParams,
      overrides,
    };

    const totalPayloadSize = calculateTotalPayloadSize(requestBody);

    if (totalPayloadSize >= Messages.MAXIMUM_JSON_ATTACHMENT_SIZE) {
      requestOptions.form = Messages._buildFormRequest(requestBody);
    } else if (requestBody.attachments) {
      const processedAttachments = await encodeAttachmentContent(
        requestBody.attachments
      );

      requestOptions.body = {
        ...requestBody,
        attachments: processedAttachments,
      };
    } else {
      requestOptions.body = requestBody;
    }

    return this.apiClient.request(requestOptions);
  }
}
