# Architecture

## Entry Point
`src/nylas.ts:15` - Nylas class constructor instantiates all resources with configured APIClient.

## API Client
`src/apiClient.ts` handles:
- HTTP requests with fetch
- Bearer token authentication
- Error response handling (NylasApiError)
- JSON serialization/deserialization
- Request/response logging

## Resource Pattern
All resources extend `src/resources/resource.ts`:

| Method | HTTP | Returns |
|--------|------|---------|
| `_list()` | GET | Async iterator with pagination |
| `_find()` | GET | Single resource |
| `_create()` | POST | Created resource |
| `_update()` | PUT | Updated resource |
| `_updatePatch()` | PATCH | Patched resource |
| `_destroy()` | DELETE | Deletion response |
| `_getRaw()` | GET | Binary data |
| `_getStream()` | GET | ReadableStream |

## Models Structure
`src/models/` contains TypeScript interfaces:
- Resource objects: `Calendar`, `Event`, `Message`, etc.
- Request types: `Create{Resource}Request`
- Query params: `List{Resource}QueryParams`, `Find{Resource}QueryParams`
- Responses: `NylasResponse<T>`, `NylasListResponse<T>`

## API Paths
- Grant-scoped: `/v3/grants/{grantId}/{resource}`
- App-scoped: `/v3/{resource}`

## Build Output
- `lib/esm/` - ES modules (import/export)
- `lib/cjs/` - CommonJS (require)
- `lib/types/` - TypeScript declarations
