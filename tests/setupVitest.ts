// Setup for Vitest testing with Jest compatibility
import { vi } from 'vitest';

// Mock fetch for testing
global.fetch = vi.fn();

// Mock other globals as needed
global.Request = vi.fn();
global.Response = vi.fn();
global.Headers = vi.fn();

// Provide Jest compatibility
global.jest = vi;
global.jest.fn = vi.fn;
global.jest.spyOn = vi.spyOn;
global.jest.clearAllMocks = vi.clearAllMocks;
global.jest.resetAllMocks = vi.resetAllMocks;
global.jest.restoreAllMocks = vi.restoreAllMocks;
global.jest.mock = vi.mock;

// Set up test environment
vi.setConfig({
  testTimeout: 30000,
  hookTimeout: 30000,
});

// Vitest environment setup complete with Jest compatibility