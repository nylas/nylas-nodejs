import APIClient from './apiClient';
import { NylasConfig, DEFAULT_SERVER_URL } from './config';
import { Calendars } from './resources/calendars';
import { Events } from './resources/events';
import { Auth } from './resources/auth';
import { Webhooks } from './resources/webhooks';

class Nylas {
  // TODO: remove from config?
  clientId?: string;
  clientSecret?: string;

  public calendars: Calendars;
  public events: Events;
  public auth: Auth;
  public webhooks: Webhooks;

  constructor(config: NylasConfig) {
    const apiClient = new APIClient({
      apiKey: config.apiKey,
      serverUrl: config.serverUrl || DEFAULT_SERVER_URL,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });

    this.calendars = new Calendars(apiClient);
    this.events = new Events(apiClient);
    this.auth = new Auth(apiClient);
    this.webhooks = new Webhooks(apiClient);
    // etc.

    return this;
  }
}

export = Nylas;
