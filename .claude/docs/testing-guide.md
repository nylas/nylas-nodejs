# Testing Guide

## Setup
Tests use Jest with `jest-fetch-mock`. Mock setup in `tests/setupTests.ts`.

## Mocking APIClient
```typescript
import APIClient from '../../src/apiClient';
jest.mock('../../src/apiClient');
```

## Test Structure
```typescript
describe('ResourceName', () => {
  let apiClient: jest.Mocked<APIClient>;
  let resource: Resources;

  beforeEach(() => {
    apiClient = new APIClient({ apiKey: 'test' }) as jest.Mocked<APIClient>;
    resource = new Resources(apiClient);
  });

  describe('list', () => {
    it('calls API with correct parameters', async () => {
      apiClient.request.mockResolvedValue({ data: [] });
      await resource.list({ identifier: 'grant-id' });
      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant-id/resources',
        overrides: {}
      });
    });
  });
});
```

## Coverage
Threshold: 80% functions, lines, statements. Run `make test` for coverage report.

## Commands
- `make test` - All tests with coverage
- `make test-resource NAME=calendars` - Single resource
- `make test-watch` - Watch mode
- `make test-verbose` - Verbose output
