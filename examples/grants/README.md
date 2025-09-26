# Nylas Grants Examples

This directory contains examples demonstrating how to work with grants using the Nylas Node.js SDK. Grants represent authenticated connections between your application and email/calendar providers like Gmail, Outlook, Yahoo, and others.

## What are Grants?

In the Nylas API, a **Grant** represents an authenticated connection to a user's email or calendar account. Each grant contains:

- **Authentication details** - OAuth tokens and provider information
- **Scope permissions** - What data your app can access (email, calendar, contacts, etc.)
- **Account metadata** - Email address, provider type, creation/update timestamps
- **Status information** - Whether the grant is valid or needs re-authentication

## Examples Overview

The `grants.ts` file demonstrates comprehensive grant management including:

### 📋 **Basic Operations**
- **List all grants** - Retrieve all authenticated accounts
- **Fetch specific grant** - Get detailed information about a single grant
- **Pagination** - Handle large numbers of grants efficiently

### 🔄 **Sorting & Filtering**
- **Sort by creation date** - See newest or oldest grants first
- **Sort by update date** - Find recently modified grants
- **Filter by provider** - Show only Gmail, Outlook, etc.
- **Filter by status** - Find valid, invalid, or expired grants
- **Filter by date range** - Grants created in specific time periods

### 🎯 **Advanced Features**
- **Multiple filters** - Combine provider, status, and date filters
- **Client-side grouping** - Organize grants by provider or other criteria
- **Scope analysis** - Find grants with specific permissions
- **Rate limit monitoring** - Track API usage limits

## Quick Start

### 1. Set up environment
Create a `.env` file in the `examples` directory:
```bash
NYLAS_API_KEY=your_api_key_here
NYLAS_API_URI=https://api.us.nylas.com  # Optional: defaults to US API
```

### 2. Install dependencies
```bash
cd examples
npm install
```

### 3. Run the example
```bash
# Using ts-node (recommended for development)
npx ts-node grants/grants.ts

# Or compile and run
npm run build
node dist/grants/grants.js
```

## Example Functions

### Basic Listing
```typescript
// List all grants
const grants = await nylas.grants.list();

// List with pagination
const grants = await nylas.grants.list({
  queryParams: {
    limit: 10,
    offset: 0,
  },
});
```

### Sorting
```typescript
// Sort by creation date (newest first)
const grants = await nylas.grants.list({
  queryParams: {
    sortBy: 'created_at',
    orderBy: 'desc',
  },
});

// Sort by update date (most recently updated first)
const grants = await nylas.grants.list({
  queryParams: {
    sortBy: 'updated_at',
    orderBy: 'desc',
  },
});
```

### Filtering
```typescript
// Filter by provider
const gmailGrants = await nylas.grants.list({
  queryParams: {
    provider: 'google',
  },
});

// Filter by status
const validGrants = await nylas.grants.list({
  queryParams: {
    grantStatus: 'valid',
  },
});

// Filter by date range (last 30 days)
const thirtyDaysAgo = Math.floor((Date.now() - (30 * 24 * 60 * 60 * 1000)) / 1000);
const recentGrants = await nylas.grants.list({
  queryParams: {
    since: thirtyDaysAgo,
  },
});
```

### Fetching Individual Grants
```typescript
// Fetch a specific grant by ID
const grant = await nylas.grants.find({
  grantId: 'grant-id-here',
});

console.log(`Grant for ${grant.data.email} (${grant.data.provider})`);
console.log(`Scopes: ${grant.data.scope.join(', ')}`);
console.log(`Status: ${grant.data.grantStatus}`);
```

## Grant Object Properties

Each grant object contains the following key properties:

```typescript
interface Grant {
  id: string;                    // Unique grant identifier
  provider: string;              // 'google', 'microsoft', 'yahoo', etc.
  email?: string;                // Associated email address
  name?: string;                 // User's display name
  grantStatus?: string;          // 'valid', 'invalid', 'expired'
  scope: string[];               // Permissions: ['email', 'calendar', 'contacts']
  createdAt: number;             // Unix timestamp
  updatedAt?: number;            // Unix timestamp of last update
  providerUserId?: string;       // Provider's internal user ID
  ip?: string;                   // IP address during authentication
  userAgent?: string;            // Browser/client used for auth
  settings?: Record<string, unknown>; // Provider-specific settings
}
```

## Available Query Parameters

When listing grants, you can use these parameters:

- **`limit`** (number) - Maximum results to return (default: 10, max: 200)
- **`offset`** (number) - Skip this many results for pagination
- **`sortBy`** - Sort field: `'created_at'` or `'updated_at'`
- **`orderBy`** - Sort direction: `'asc'` or `'desc'`
- **`since`** (number) - Unix timestamp to filter grants created after
- **`before`** (number) - Unix timestamp to filter grants created before
- **`email`** (string) - Filter by email address
- **`grantStatus`** (string) - Filter by status: `'valid'`, `'invalid'`, etc.
- **`ip`** (string) - Filter by IP address
- **`provider`** (string) - Filter by provider: `'google'`, `'microsoft'`, etc.

## Common Use Cases

### 1. **Health Check Dashboard**
```typescript
// Get overview of all grants and their status
const allGrants = await nylas.grants.list();
const grantsByStatus = allGrants.data.reduce((acc, grant) => {
  const status = grant.grantStatus || 'valid';
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {});
console.log('Grant Status Overview:', grantsByStatus);
```

### 2. **Find Grants Needing Re-authentication**
```typescript
// Find invalid or expired grants
const invalidGrants = await nylas.grants.list({
  queryParams: {
    grantStatus: 'invalid',
  },
});
console.log(`${invalidGrants.data.length} grants need re-authentication`);
```

### 3. **Provider Distribution Analysis**
```typescript
// See which providers your users prefer
const grants = await nylas.grants.list();
const providerCounts = grants.data.reduce((acc, grant) => {
  acc[grant.provider] = (acc[grant.provider] || 0) + 1;
  return acc;
}, {});
console.log('Provider Distribution:', providerCounts);
```

### 4. **Recent Activity Monitoring**
```typescript
// Find grants created or updated in the last week
const weekAgo = Math.floor((Date.now() - (7 * 24 * 60 * 60 * 1000)) / 1000);
const recentActivity = await nylas.grants.list({
  queryParams: {
    since: weekAgo,
    sortBy: 'created_at',
    orderBy: 'desc',
  },
});
```

## Rate Limiting

The Nylas API includes rate limiting. You can monitor your usage:

```typescript
const response = await nylas.grants.list();
if (response.rawHeaders) {
  const limit = response.rawHeaders['x-rate-limit-limit'];
  const remaining = response.rawHeaders['x-rate-limit-remaining'];
  console.log(`Rate Limit: ${remaining}/${limit} requests remaining`);
}
```

## Error Handling

Always wrap grant operations in try-catch blocks:

```typescript
try {
  const grants = await nylas.grants.list();
  // Process grants...
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid API key');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Error listing grants:', error);
  }
}
```

## Next Steps

After exploring grants, you might want to:

1. **Use grants to access data** - Use grant IDs to list messages, events, or contacts
2. **Monitor grant health** - Set up automated checks for invalid grants
3. **Implement re-authentication** - Handle expired grants gracefully
4. **Build user dashboards** - Show users their connected accounts

## Related Documentation

- [Nylas Authentication Guide](https://developer.nylas.com/docs/the-basics/authentication/)
- [Grant Management API](https://developer.nylas.com/docs/api/v3/admin/#tag--Grants)
- [OAuth Scopes Reference](https://developer.nylas.com/docs/the-basics/authentication/oauth-scopes/)
