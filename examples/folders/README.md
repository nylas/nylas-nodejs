# Folders Example

This example demonstrates how to use the Nylas Node.js SDK to work with folders.

## Features Demonstrated

- List all folders for a grant
- Use the `includeHiddenFolders` parameter (Microsoft only) to include hidden folders in the response
- Filter folders by parent/child relationship
- Display folder attributes and metadata

## Setup

1. Copy `.env.example` to `.env` in the examples directory
2. Add your Nylas API credentials and grant ID:
   ```
   NYLAS_API_KEY=your_api_key_here
   NYLAS_GRANT_ID=your_grant_id_here
   NYLAS_API_URI=https://api.us.nylas.com  # or your specific Nylas region
   ```

## Running the Example

```bash
npm install
npm run folders
```

Or run directly with ts-node:

```bash
npx ts-node folders.ts
```

## Microsoft-Specific Features

The `includeHiddenFolders` parameter is specific to Microsoft accounts:

```typescript
const foldersWithHidden = await nylas.folders.list({
  identifier: GRANT_ID,
  queryParams: {
    includeHiddenFolders: true, // Microsoft only - includes hidden folders
  },
});
```

This parameter defaults to `false` and when set to `true`, includes folders that are typically hidden from the user interface, such as system folders used by Microsoft Exchange for internal operations.

## Expected Output

The example will output:

1. A list of all visible folders
2. A list of all folders including hidden ones (if using a Microsoft account)
3. A filtered list showing only parent folders with their metadata

## Error Handling

The example includes proper error handling and will display helpful error messages if:

- Environment variables are not set
- API requests fail
- # Authentication issues occur

# Nylas Folders API Examples

This directory contains examples of how to use the Nylas Folders API with the Nylas Node.js SDK, including the new `singleLevel` query parameter.

## What is the singleLevel Parameter?

The `singleLevel` parameter is a new query parameter for the "list all folders" endpoint that controls folder hierarchy traversal:

- **`singleLevel: true`** - Retrieves folders from a single-level hierarchy only (direct children)
- **`singleLevel: false`** - Retrieves folders across a multi-level hierarchy (all descendants, default behavior)
- **Microsoft accounts only** - This parameter is ignored for other providers

## Examples

- [folders.ts](./folders.ts) - A comprehensive example showing how to use the `singleLevel` parameter in various scenarios

## Running the Examples

To run these examples, you'll need to:

1. Install dependencies from the examples directory:

   ```bash
   cd examples
   npm install
   ```

2. Copy the `.env.example` file to `.env` if you haven't already and add your credentials:

   ```bash
   cp .env.example .env
   # Edit .env with your editor
   ```

3. Edit the `.env` file to include:

   - `NYLAS_API_KEY` - Your Nylas API key
   - `NYLAS_API_URI` (optional) - The Nylas API server URI (defaults to "https://api.us.nylas.com")
   - `NYLAS_GRANT_ID` - The Grant ID for a Microsoft account to see the `singleLevel` parameter in action

4. Run the example:

   ```bash
   # From the examples directory
   npx ts-node folders/folders.ts

   # Or if you add it to package.json scripts
   npm run folders
   ```

## Understanding the Example

This example demonstrates:

1. **Default Behavior**: Listing all folders with multi-level hierarchy (default)
2. **Single-Level Listing**: Using `singleLevel: true` to get only direct children
3. **Combined Parameters**: Using `singleLevel` with `parentId` to control the starting point
4. **Comparison**: Side-by-side comparison of single-level vs multi-level results
5. **Parameter Variations**: All possible combinations of the `singleLevel` parameter

## Use Cases

The `singleLevel` parameter is particularly useful when:

- **Building UI Navigation**: You want to show only immediate child folders in a tree view
- **Performance Optimization**: Reducing the amount of data returned when you only need direct children
- **Hierarchical Processing**: Processing folder structures level by level rather than all at once
- **Microsoft-Specific Features**: Taking advantage of Microsoft's folder hierarchy capabilities

## API Reference

### ListFolderQueryParams Interface

```typescript
interface ListFolderQueryParams extends ListQueryParams {
  /**
   * (Microsoft and EWS only.) Use the ID of a folder to find all child folders it contains.
   */
  parentId?: string;

  /**
   * (Microsoft only) If true, retrieves folders from a single-level hierarchy only.
   * If false, retrieves folders across a multi-level hierarchy.
   * @default false
   */
  singleLevel?: boolean;
}
```

### Example Usage

```typescript
import Nylas from 'nylas';

const nylas = new Nylas({ apiKey: 'your-api-key' });

// Get only direct children of a specific folder
const singleLevelFolders = await nylas.folders.list({
  identifier: 'grant-id',
  queryParams: {
    parentId: 'parent-folder-id',
    singleLevel: true,
  },
});

// Get all descendants (default behavior)
const allFolders = await nylas.folders.list({
  identifier: 'grant-id',
  queryParams: {
    parentId: 'parent-folder-id',
    singleLevel: false, // or omit this parameter
  },
});
```

## Documentation

For more information, see the [Nylas API Documentation](https://developer.nylas.com/).
