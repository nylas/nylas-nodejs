import APIClient from './apiClient';
import { REGION_CONFIG, DEFAULT_REGION, NylasConfig } from './config';
import { Calendars } from './resources/calendars';

export class Nylas {
  serverUrl = REGION_CONFIG[DEFAULT_REGION].nylasAPIUrl;
  apiClient: APIClient;

  // TODO: remove from config?
  clientId?: string;
  clientSecret?: string;

  public calendars: Calendars;

  constructor(config: NylasConfig) {
    if (config.serverUrl) {
      this.serverUrl = config.serverUrl;
    }

    this.apiClient = new APIClient({
      apiKey: config.apiKey,
      serverUrl: this.serverUrl,
    });

    this.calendars = new Calendars(this.apiClient);

    return this;
  }
}
