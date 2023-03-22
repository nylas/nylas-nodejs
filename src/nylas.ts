import APIClient from './apiClient';
import { NylasConfig, DEFAULT_SERVER_URL } from './config';
import { Calendars } from './resources/calendars';

class Nylas {
  apiClient: APIClient;

  // TODO: remove from config?
  clientId?: string;
  clientSecret?: string;

  public calendars: Calendars;

  constructor(config: NylasConfig) {
    this.apiClient = new APIClient({
      apiKey: config.apiKey,
      serverUrl: config.serverUrl || DEFAULT_SERVER_URL,
    });

    this.calendars = new Calendars(this.apiClient);
    // this.events = new Events(this.apiClient);
    // etc.

    return this;
  }
}

export = Nylas;
