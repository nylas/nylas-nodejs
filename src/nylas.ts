import APIClient from './apiClient.js';
import { NylasConfig, DEFAULT_SERVER_URL } from './config.js';
import { Calendars } from './resources/calendars.js';
import { Events } from './resources/events.js';
import { Auth } from './resources/auth.js';
import { Webhooks } from './resources/webhooks.js';
import { Applications } from './resources/applications.js';
import { Messages } from './resources/messages.js';
import { Drafts } from './resources/drafts.js';

/**
 * The entry point to the Node SDK
 *
 * A Nylas instance holds a configured http client pointing to a base URL and is intended to be reused and shared
 * across threads and time.
 */
export default class Nylas {
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
   * Access the Drafts API
   */
  public drafts: Drafts;
  /**
   * Access the Events API
   */
  public events: Events;
  /**
   * Access the Messages API
   */
  public messages: Messages;
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
      apiUri: config.apiUri || DEFAULT_SERVER_URL,
      timeout: config.timeout || 30,
    });

    this.applications = new Applications(this.apiClient);
    this.auth = new Auth(this.apiClient);
    this.calendars = new Calendars(this.apiClient);
    this.drafts = new Drafts(this.apiClient);
    this.events = new Events(this.apiClient);
    this.messages = new Messages(this.apiClient);
    this.webhooks = new Webhooks(this.apiClient);

    return this;
  }
}
