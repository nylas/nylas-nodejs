import { REGION_CONFIG, DEFAULT_REGION, NylasConfig } from './config';

class Nylas {
  serverUrl = REGION_CONFIG[DEFAULT_REGION].nylasAPIUrl;

  // TODO: remove from config?
  clientId?: string;
  clientSecret?: string;

  constructor(config: NylasConfig) {
    if (config.serverUrl) {
      this.serverUrl = config.serverUrl;
    }

    // TODO: instantiate resources

    return this;
  }
}

export = Nylas;
