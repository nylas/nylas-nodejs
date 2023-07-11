import Nylas from '../src/nylas';

describe('Nylas', () => {
  describe('constructor', () => {
    it('should initialize the Nylas object', () => {
      const nylas = new Nylas({
        apiKey: 'test',
      });

      expect(nylas.constructor.name).toBe('Nylas');
    });

    it('should initialize all the resources', () => {
      const nylas = new Nylas({
        apiKey: 'test',
      });

      expect(nylas.calendars.constructor.name).toBe('Calendars');
      expect(nylas.events.constructor.name).toBe('Events');
      expect(nylas.webhooks.constructor.name).toBe('Webhooks');
    });

    it('should configure the apiClient', () => {
      const nylas = new Nylas({
        apiKey: 'test',
        serverUrl: 'https://test.nylas.com',
        timeout: 30,
      });

      expect(nylas.apiClient.apiKey).toBe('test');
      expect(nylas.apiClient.serverUrl).toBe('https://test.nylas.com');
      expect(nylas.apiClient.timeout).toBe(30000);
    });

    it('should default to the production server', () => {
      const nylas = new Nylas({
        apiKey: 'test',
      });

      expect(nylas.apiClient.serverUrl).toBe('https://api.us.nylas.com');
    });
  });
});
