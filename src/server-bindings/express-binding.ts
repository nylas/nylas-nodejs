import Nylas from '../nylas';
import express, { RequestHandler, Response, Router } from 'express';
import { ServerBindingOptions, ServerBinding } from './server-binding';
import bodyParser from 'body-parser';
import { DefaultRoutes } from '../services/routes';

export default class ExpressBinding extends ServerBinding {
  constructor(nylasClient: Nylas, options: ServerBindingOptions) {
    super(nylasClient, options);
  }

  /**
   * Middleware for the webhook endpoint so we can verify that Nylas is sending the events
   */
  webhookVerificationMiddleware(): RequestHandler {
    return (req, res, next): void | Response => {
      const isVerified = this.verifyWebhookSignature(
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

  /**
   * Build middleware for an Express app with routes for:
   * 1. '/webhook': Receiving webhook events, verifying its authenticity, and emitting webhook objects
   * 2. '/generate-auth-url': Building the URL for authenticating users to your application via Hosted Authentication
   * 3. Exchange an authorization code for an access token
   * @return The routes packaged as Express middleware
   */
  buildMiddleware(): Router {
    const router = express.Router();

    // For the Nylas webhook endpoint, we should get the raw body to use for verification
    router.use(
      DefaultRoutes.webhooks,
      bodyParser.raw({ inflate: true, type: 'application/json' })
    );

    router.use(
      express.json(),
      bodyParser.urlencoded({ limit: '5mb', extended: true }) // support encoded bodies
    );

    router.post<unknown, unknown, Record<string, unknown>>(
      DefaultRoutes.webhooks,
      this.webhookVerificationMiddleware() as any,
      (req, res) => {
        const deltas = (req.body.deltas as Record<string, unknown>[]) || [];
        this.emitDeltaEvents(deltas);
        res.status(200).send('ok');
      }
    );

    router.post(DefaultRoutes.buildAuthUrl, async (req, res) => {
      let state = '';
      if (this.csrfTokenExchangeOpts) {
        state = await this.csrfTokenExchangeOpts.generateCsrfToken(req);
      }
      const authUrl = await this.buildAuthUrl({
        scopes: this.defaultScopes,
        clientUri: this.clientUri,
        emailAddress: req.body.email_address,
        successUrl: req.body.success_url,
        state,
      });
      res.status(200).send(authUrl);
    });

    router.post(DefaultRoutes.exchangeCodeForToken, async (req, res) => {
      try {
        if (this.csrfTokenExchangeOpts) {
          const csrfToken = req.body.csrfToken;
          const isValidToken = await this.csrfTokenExchangeOpts.validateCsrfToken(
            csrfToken,
            req
          );
          if (!isValidToken) {
            return res.status(401).send('Invalid CSRF State Token');
          }
        }
        const accessTokenObj = await this.exchangeCodeForToken(req.body.token);

        await this.exchangeMailboxTokenCallback(accessTokenObj, res);

        // If the callback event already sent a response then we don't need to do anything
        if (!res.writableEnded) {
          res.status(200).send('success');
        }
      } catch (e) {
        res.status(500).send((e as any).message);
      }
    });

    return router;
  }
}
