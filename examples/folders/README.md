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
    includeHiddenFolders: true,  // Microsoft only - includes hidden folders
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
- Authentication issues occur 