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

      expect(nylas.applications.constructor.name).toBe('Applications');
      expect(nylas.auth.constructor.name).toBe('Auth');
      expect(nylas.calendars.constructor.name).toBe('Calendars');
      expect(nylas.events.constructor.name).toBe('Events');
      expect(nylas.webhooks.constructor.name).toBe('Webhooks');
      expect(nylas.folders.constructor.name).toBe('Folders');
      expect(nylas.attachments.constructor.name).toBe('Attachments');
    });

    it('should configure the apiClient', () => {
      const nylas = new Nylas({
        apiKey: 'test',
        apiUri: 'https://test.nylas.com',
        timeout: 60,
      });

      expect(nylas.apiClient.apiKey).toBe('test');
      expect(nylas.apiClient.serverUrl).toBe('https://test.nylas.com');
      expect(nylas.apiClient.timeout).toBe(60000);
    });

    it('should use correct defaults', () => {
      const nylas = new Nylas({
        apiKey: 'test',
      });

      expect(nylas.apiClient.serverUrl).toBe('https://api.us.nylas.com');
      expect(nylas.apiClient.timeout).toBe(30000);
    });
  });
});
