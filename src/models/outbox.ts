import NylasConnection, { AuthMethod } from '../nylas-connection';
import Draft, { SendCallback } from './draft';
import OutboxJobStatus from './outbox-job-status';
import Model from './model';
import Attributes, { Attribute } from './attributes';

type SendParams = {
  sendAt: Date | number;
  retryLimitDatetime?: Date | number;
  tracking?: Record<string, any>;
  callback?: SendCallback;
};

type UpdateParams = {
  updatedMessage?: Draft;
  sendAt?: Date | number;
  retryLimitDatetime?: Date | number;
};

export class SendGridVerifiedStatus extends Model {
  domainVerified?: boolean;
  senderVerified?: boolean;
  static attributes: Record<string, Attribute> = {
    domainVerified: Attributes.Boolean({
      modelKey: 'domainVerified',
      jsonKey: 'domain_verified',
    }),
    senderVerified: Attributes.Boolean({
      modelKey: 'senderVerified',
      jsonKey: 'sender_verified',
    }),
  };
}

export default class Outbox {
  connection: NylasConnection;
  private path = '/v2/outbox';

  constructor(connection: NylasConnection) {
    this.connection = connection;
  }

  send(draft: Draft, options: SendParams): Promise<OutboxJobStatus> {
    const body = draft.saveRequestBody();
    if (options.tracking) {
      body['tracking'] = options.tracking;
    }

    const [sendAt, retryLimitDatetime] = Outbox.validateAndFormatDateTime(
      options.sendAt,
      options.retryLimitDatetime
    );
    body['send_at'] = sendAt;
    body['retry_limit_datetime'] = retryLimitDatetime;

    return this.request({
      method: 'POST',
      path: '',
      body: body,
    })
      .then(json => {
        const message = new OutboxJobStatus(this.connection).fromJSON(json);

        if (options.callback) {
          options.callback(null, message);
        }
        return Promise.resolve(message);
      })
      .catch(err => {
        if (options.callback) {
          options.callback(err);
        }
        return Promise.reject(err);
      });
  }

  update(jobStatusId: string, options: UpdateParams): Promise<OutboxJobStatus> {
    let body: Record<string, unknown> = {};
    if (options.updatedMessage) {
      body = options.updatedMessage.saveRequestBody();
    }

    const [sendAt, retryLimitDatetime] = Outbox.validateAndFormatDateTime(
      options.sendAt,
      options.retryLimitDatetime
    );
    body['send_at'] = sendAt;
    body['retry_limit_datetime'] = retryLimitDatetime;

    return this.request({
      method: 'PATCH',
      path: `/${jobStatusId}`,
      body: body,
    }).then(json => {
      const message = new OutboxJobStatus(this.connection).fromJSON(json);
      return Promise.resolve(message);
    });
  }

  delete(jobStatusId: string): Promise<void> {
    return this.request({
      method: 'DELETE',
      path: `/${jobStatusId}`,
    });
  }

  sendGridVerificationStatus(): Promise<SendGridVerifiedStatus> {
    return this.request({
      method: 'GET',
      path: `/onboard/verified_status`,
    }).then(json => {
      if (json.results) {
        json = json.results;
      }
      const verifiedStatus = new SendGridVerifiedStatus().fromJSON(json);
      return Promise.resolve(verifiedStatus);
    });
  }

  deleteSendGridSubUser(email: string): Promise<void> {
    return this.request({
      method: 'DELETE',
      path: `/onboard/subuser`,
      body: { email: email },
    });
  }

  private request(options: {
    method: string;
    path: string;
    body?: Record<string, unknown>;
  }): Promise<any> {
    return this.connection.request({
      method: options.method,
      path: `${this.path}${options.path}`,
      body: options.body,
      authMethod: AuthMethod.BEARER,
    });
  }

  private static validateAndFormatDateTime(
    sendAt?: Date | number,
    retryLimitDatetime?: Date | number
  ): [number | undefined, number | undefined] {
    const sendAtEpoch =
      sendAt instanceof Date ? Outbox.dateToEpoch(sendAt) : sendAt;
    const retryLimitDatetimeEpoch =
      retryLimitDatetime instanceof Date
        ? Outbox.dateToEpoch(retryLimitDatetime)
        : retryLimitDatetime;

    if (sendAtEpoch && sendAtEpoch !== 0) {
      if (sendAtEpoch < Outbox.dateToEpoch(new Date())) {
        throw new Error(
          'Cannot set message to be sent at a time before the current time.'
        );
      }
    }

    if (retryLimitDatetimeEpoch && retryLimitDatetimeEpoch !== 0) {
      let validSendAt = sendAtEpoch;
      if (!validSendAt || validSendAt === 0) {
        validSendAt = Outbox.dateToEpoch(new Date());
      }
      if (retryLimitDatetimeEpoch < validSendAt) {
        throw new Error(
          'Cannot set message to stop retrying before time to send at.'
        );
      }
    }

    return [sendAtEpoch, retryLimitDatetimeEpoch];
  }

  private static dateToEpoch(date: Date): number {
    return Math.floor(date.getTime() / 1000.0);
  }
}
