import Nylas from '../nylas';
import cors from 'cors';
import express, { Express } from 'express';
import {
  ServerBindingOptions,
  ServerBinding,
  ServerEvents,
} from './server-bindings';
import bodyParser from 'body-parser';
import { WebhookDelta } from '../models/webhook-notification';
import { WebhookTriggers } from '../models/webhook';

export default class ExpressBinding extends ServerBinding {
  expressApp: Express;

  constructor(
    nylasClient: Nylas,
    expressApp: Express,
    options: ServerBindingOptions
  ) {
    super(nylasClient, options);
    this.expressApp = expressApp;
  }

  mount(): void {
    const webhookRoute = this.buildRoute('/webhook');
    this.expressApp.use(
      this.buildRoute(''),
      cors(
        this.clientUri
          ? {
              optionsSuccessStatus: 200,
              origin: this.clientUri,
            }
          : undefined
      ) as any,
      express.json(),
      bodyParser.urlencoded({ limit: '5mb', extended: true }) // support encoded bodies
    );

    this.expressApp.post<unknown, unknown, Record<string, unknown>>(
      webhookRoute,
      (req, res) => {
        const deltas = (req.body.deltas as Record<string, unknown>[]) || [];
        deltas.forEach(d => {
          d.type &&
            this.emit(
              d.type as WebhookTriggers,
              new WebhookDelta().fromJSON(d)
            );
        });
        res.status(200).send('ok');
      }
    );

    this.expressApp.post(this.buildRoute('/generate-auth-url'), (req, res) => {
      const authUrl = this.nylasClient.urlForAuthentication({
        loginHint: req.body.email_address,
        redirectURI: (this.clientUri || '') + req.body.success_url,
        scopes: this.defaultScopes,
      });
      res.status(200).send(authUrl);
    });

    this.expressApp.post(
      this.buildRoute('/exchange-mailbox-token'),
      async (req, res) => {
        try {
          const accessTokenObj = await this.nylasClient.exchangeCodeForToken(
            req.body.token
          );
          this.emit(ServerEvents.TokenExchange, {
            accessTokenObj,
            res,
          });

          // If the callback event already sent a response then we don't need to do anything
          if (!res.writableEnded) {
            res.status(200).send('success');
          }
        } catch (e) {
          res.status(500).send((e as any).message);
        }
      }
    );
  }
}
