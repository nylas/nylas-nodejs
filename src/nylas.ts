import APIClient from './apiClient';
import { NylasConfig, DEFAULT_SERVER_URL } from './config';
import { Calendars } from './resources/calendars';
import { Events } from './resources/events';

class Nylas {
  // TODO: remove from config?
  clientId?: string;
  clientSecret?: string;

  public calendars: Calendars;
  public events: Events;

  constructor(config: NylasConfig) {
    const apiClient = new APIClient({
      apiKey: config.apiKey,
      serverUrl: config.serverUrl || DEFAULT_SERVER_URL,
    });

    this.calendars = new Calendars(apiClient);
    this.events = new Events(apiClient);
    // etc.

    return this;
  }
}

export = Nylas;
