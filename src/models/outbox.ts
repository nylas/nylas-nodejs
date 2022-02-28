import NylasConnection, { AuthMethod } from '../nylas-connection';
import Draft, { SendCallback } from './draft';
import OutboxJobStatus from './outbox-job-status';
import Model from './model';
import Attributes, { Attribute } from './attributes';

type SendParams = {
  sendAt: Date;
  retryLimitDatetime?: Date;
  tracking?: Record<string, any>;
  callback?: SendCallback;
};

type UpdateParams = {
  updatedMessage?: Draft;
  sendAt?: Date;
  retryLimitDatetime?: Date;
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
    body['send_at'] = Math.floor(options.sendAt.getTime() / 1000.0);
    if (options.retryLimitDatetime) {
      body['retry_limit_datetime'] = Math.floor(
        options.retryLimitDatetime.getTime() / 1000.0
      );
    }
    if (options.tracking) {
      body['tracking'] = options.tracking;
    }

    return this.request({
      method: 'POST',
      path: '',
      body: body,
    })
      .then(json => {
        const message = new OutboxJobStatus().fromJSON(json, this.connection);

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
    if (options.sendAt) {
      body['send_at'] = Math.floor(options.sendAt.getTime() / 1000.0);
    }
    if (options.retryLimitDatetime) {
      body['retry_limit_datetime'] = Math.floor(
        options.retryLimitDatetime.getTime() / 1000.0
      );
    }

    return this.request({
      method: 'PATCH',
      path: `/${jobStatusId}`,
      body: body,
    }).then(json => {
      const message = new OutboxJobStatus().fromJSON(json, this.connection);
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
    let header;
    if (options.body) {
      header = {
        'Content-Type': 'application/json',
      };
    }
    return this.connection.request({
      method: options.method,
      path: `${this.path}${options.path}`,
      body: options.body,
      headers: header,
      authMethod: AuthMethod.BEARER,
    });
  }
}
