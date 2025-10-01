// Setup for Vitest testing
import { vi } from 'vitest';

// Mock fetch for testing
global.fetch = vi.fn();

// Mock other globals as needed
global.Request = vi.fn();
global.Response = vi.fn();
global.Headers = vi.fn();

// Set up test environment
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
});

// Vitest environment setup complete
