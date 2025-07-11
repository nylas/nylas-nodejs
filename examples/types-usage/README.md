# Types Usage Examples

This directory contains examples demonstrating how to use the Nylas SDK types for building third-party extensions and integrations.

## Overview

The Nylas SDK now provides a dedicated types export that allows third-party developers to import only the types they need, without importing the entire SDK. This is particularly useful for:

- Building extensions that need type safety
- Creating custom middleware or wrappers
- Developing integrations with strict bundle size requirements
- Building developer tools that work with Nylas SDK types

## Usage

### Basic Type Imports

```typescript
import type { NylasConfig, ListMessagesParams, NylasResponse } from 'nylas/types';
```

### Extended Type Imports

```typescript
import type { 
  NylasConfig, 
  OverridableNylasConfig,
  ListMessagesParams, 
  SendMessageParams,
  NylasResponse, 
  NylasListResponse,
  Message,
  Contact,
  Event 
} from 'nylas/types';
```

### Configuration Types

```typescript
import type { NylasConfig, Region } from 'nylas/types';
import { DEFAULT_SERVER_URL, REGION_CONFIG } from 'nylas/types';

// Use types for configuration
const config: NylasConfig = {
  apiKey: 'your-api-key',
  apiUri: DEFAULT_SERVER_URL,
  timeout: 30
};
```

### Resource Parameter Types

```typescript
import type { 
  ListMessagesParams, 
  FindEventParams, 
  CreateContactParams 
} from 'nylas/types';

// Use types for method parameters
const messageParams: ListMessagesParams = {
  identifier: 'grant-id',
  queryParams: { limit: 10 }
};
```

### Response Types

```typescript
import type { NylasResponse, NylasListResponse, Message } from 'nylas/types';

// Use types for handling responses
function handleMessageResponse(response: NylasResponse<Message>) {
  const message = response.data;
  console.log(`Message: ${message.subject}`);
}
```

### Base Classes for Extension

```typescript
import type { Resource, APIClient } from 'nylas/types';

// Extend base classes for custom resources
class CustomResource extends Resource {
  constructor(apiClient: APIClient) {
    super(apiClient);
  }
  
  // Add custom methods
}
```

## Benefits

1. **Type Safety**: Full TypeScript support for your extensions
2. **Tree Shaking**: Import only what you need for better bundle optimization
3. **Extensibility**: Easy to build on top of the SDK with proper types
4. **Developer Experience**: Better IDE support and auto-completion
5. **Future-Proof**: Types are maintained alongside the SDK

## Examples

- `simple-example.ts` - Shows basic usage of SDK types for type safety
- `extension-example.ts` - Shows how to build a custom extension using SDK types (advanced)

## Running the Examples

1. Install dependencies:
   ```bash
   cd examples
   npm install
   ```

2. Run the examples:
   ```bash
   npx ts-node types-usage/simple-example.ts
   npx ts-node types-usage/extension-example.ts
   ```

## Notes

- All imports from `nylas/types` are type-only and don't include runtime code
- The types are generated automatically from the SDK source code
- Breaking changes to types will follow semantic versioning
- For runtime functionality, you still need to import from `nylas` 