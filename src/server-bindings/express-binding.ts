import Nylas from '../nylas';
import cors from 'cors';
import express, { Express, RequestHandler, Response } from 'express';
import {
  ServerBindingOptions,
  ServerBinding,
  ServerEvents,
} from './server-binding';
import bodyParser from 'body-parser';
import { WebhookDelta } from '../models/webhook-notification';

export default class ExpressBinding extends ServerBinding {
  constructor(nylasClient: Nylas, app: Express, options: ServerBindingOptions) {
    super(nylasClient, app, options);
  }

  webhookVerificationMiddleware(): RequestHandler {
    return (req, res, next): void | Response => {
      const isVerified = this.verifyWebhookSignature(
        this.nylasClient.clientSecret,
        req.header(ServerBinding.NYLAS_SIGNATURE_HEADER) as string,
        req.body
      );

      if (!isVerified) {
        return res
          .status(401)
          .send('X-Nylas-Signature failed verification 🚷 ');
      }

      next();
    };
  }

  mount(): void {
    const webhookRoute = this.buildRoute('/webhook');

    // Start the webhook dev server if config was set
    this.startDevelopmentWebsocket();

    this.app.use(
      this.buildRoute(''),
      cors(
        this.clientUri
          ? {
              optionsSuccessStatus: 200,
              origin: this.clientUri,
            }
          : undefined
      ) as any
    );

    // For the Nylas webhook endpoint, we should get the raw body to use for verification
    this.app.use(
      webhookRoute,
      bodyParser.raw({ inflate: true, type: 'application/json' })
    );

    this.app.use(
      this.buildRoute(''),
      express.json(),
      bodyParser.urlencoded({ limit: '5mb', extended: true }) // support encoded bodies
    );

    this.app.post<unknown, unknown, Record<string, unknown>>(
      webhookRoute,
      this.webhookVerificationMiddleware() as any,
      (req, res) => {
        const deltas = (req.body.deltas as Record<string, unknown>[]) || [];
        deltas.forEach(d =>
          this.handleDeltaEvent(new WebhookDelta().fromJSON(d))
        );
        res.status(200).send('ok');
      }
    );

    this.app.post(this.buildRoute('/generate-auth-url'), (req, res) => {
      const authUrl = this.nylasClient.urlForAuthentication({
        loginHint: req.body.email_address,
        redirectURI: (this.clientUri || '') + req.body.success_url,
        scopes: this.defaultScopes,
      });
      res.status(200).send(authUrl);
    });

    this.app.post(
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