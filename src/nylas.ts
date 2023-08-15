import APIClient from './apiClient';
import { NylasConfig, DEFAULT_SERVER_URL } from './config';
import { Calendars } from './resources/calendars';
import { Events } from './resources/events';
import { Auth } from './resources/auth';
import { Webhooks } from './resources/webhooks';
import { Applications } from './resources/applications';

/**
 * The entry point to the Node SDK
 *
 * A Nylas instance holds a configured http client pointing to a base URL and is intended to be reused and shared
 * across threads and time.
 */
class Nylas {
  /**
   * Access the Applications API
   */
  public applications: Applications;
  /**
   * Access the Auth API
   */
  public auth: Auth;
  /**
   * Access the Calendars API
   */
  public calendars: Calendars;
  /**
   * Access the Events API
   */
  public events: Events;
  /**
   * Access the Webhooks API
   */
  public webhooks: Webhooks;

  /**
   * The configured API client
   * @ignore Not for public use
   */
  apiClient: APIClient;

  /**
   * @param config Configuration options for the Nylas SDK
   */
  constructor(config: NylasConfig) {
    this.apiClient = new APIClient({
      apiKey: config.apiKey,
      serverUrl: config.serverUrl || DEFAULT_SERVER_URL,
      timeout: config.timeout || 30,
    });

    this.applications = new Applications(this.apiClient);
    this.auth = new Auth(this.apiClient);
    this.calendars = new Calendars(this.apiClient);
    this.events = new Events(this.apiClient);
    this.webhooks = new Webhooks(this.apiClient);

    return this;
  }
}

export = Nylas;
