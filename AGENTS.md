# Nylas Node.js SDK - Agent Instructions

## Repository Overview

This is the official Nylas Node.js SDK for the Nylas API v3. It provides TypeScript/JavaScript bindings for email, calendar, and contacts APIs.

## Tech Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 18+
- **Build**: Dual ESM/CJS output
- **Testing**: Jest with jest-fetch-mock
- **Linting**: ESLint + Prettier

## Project Structure

```
src/
├── nylas.ts           # Main entry point, Nylas class
├── apiClient.ts       # HTTP client, auth, error handling
├── resources/         # API resource classes
│   ├── resource.ts    # Base class with _list, _find, _create, _update, _destroy
│   ├── calendars.ts   # Calendar operations
│   ├── events.ts      # Event operations
│   ├── messages.ts    # Email operations
│   └── ...
├── models/            # TypeScript interfaces
│   ├── calendars.ts   # Calendar types
│   ├── events.ts      # Event types
│   └── ...
tests/
├── resources/         # Resource tests (mirror src/resources/)
└── *.spec.ts          # Other tests
lib/                   # Build output (generated)
├── esm/               # ES modules
├── cjs/               # CommonJS
└── types/             # TypeScript declarations
```

## Code Patterns

### Resource Class Pattern

All resources extend the base `Resource` class:

```typescript
import { Resource } from './resource.js';
import { Overrides } from '../config.js';
import { MyResource, CreateMyResourceRequest } from '../models/myResource.js';

export class MyResources extends Resource {
  public async list(params: { identifier: string }, overrides?: Overrides) {
    return this._list<MyResource>({
      path: `/v3/grants/${params.identifier}/myresources`,
      overrides,
    });
  }

  public async find(params: { identifier: string; id: string }, overrides?: Overrides) {
    return this._find<MyResource>({
      path: `/v3/grants/${params.identifier}/myresources/${params.id}`,
      overrides,
    });
  }

  public async create(params: { identifier: string; requestBody: CreateMyResourceRequest }, overrides?: Overrides) {
    return this._create<MyResource>({
      path: `/v3/grants/${params.identifier}/myresources`,
      requestBody: params.requestBody,
      overrides,
    });
  }
}
```

### Model Interface Pattern

```typescript
export interface MyResource {
  id: string;
  grantId: string;
  name: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateMyResourceRequest {
  name: string;
}

export interface ListMyResourceQueryParams {
  limit?: number;
  pageToken?: string;
}
```

### Test Pattern

```typescript
import APIClient from '../../src/apiClient';
import { MyResources } from '../../src/resources/myResources';

jest.mock('../../src/apiClient');

describe('MyResources', () => {
  let apiClient: jest.Mocked<APIClient>;
  let myResources: MyResources;

  beforeEach(() => {
    apiClient = new APIClient({ apiKey: 'test-key' }) as jest.Mocked<APIClient>;
    myResources = new MyResources(apiClient);
  });

  describe('list', () => {
    it('should call API with correct parameters', async () => {
      apiClient.request.mockResolvedValue({ data: [] });
      await myResources.list({ identifier: 'grant-123' });
      expect(apiClient.request).toHaveBeenCalledWith({
        method: 'GET',
        path: '/v3/grants/grant-123/myresources',
        overrides: undefined,
      });
    });
  });
});
```

## Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test
npm test -- tests/resources/calendars.spec.ts  # Single file

# Lint
npm run lint
npm run lint:fix

# Format
npm run lint:prettier
npm run lint:prettier:check
```

## API Path Conventions

- **Grant-scoped**: `/v3/grants/{grantId}/{resource}`
- **Application-scoped**: `/v3/{resource}`

## Naming Conventions

- **Classes**: PascalCase (`Calendars`, `Events`)
- **Interfaces**: PascalCase (`Calendar`, `CreateEventRequest`)
- **Functions/methods**: camelCase (`findById`, `listAll`)
- **Files**: camelCase (`calendars.ts`, `apiClient.ts`)
- **Protected methods**: underscore prefix (`_list`, `_find`)

## Response Types

- Single item: `NylasResponse<T>`
- List with pagination: `NylasListResponse<T>`
- Delete response: `NylasBaseResponse`

## Do Not Edit

- `src/version.ts` - Auto-generated
- `src/models/index.ts` - Auto-generated
- `lib/` - Build output
