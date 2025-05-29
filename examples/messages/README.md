# Messages Examples

This directory contains examples of how to use the Nylas Messages API to list, find, send, and work with messages.

## Features Demonstrated

This example demonstrates:

- **Message Operations**: List, find, send, update, and delete messages
- **Message Fields**: Using different `fields` query parameters to get different data:
  - `standard` - Standard message payload
  - `include_headers` - Message with custom headers
  - `include_tracking_options` - Message with tracking settings
  - `raw_mime` - Raw MIME data (Base64url-encoded)
- **Message Tracking**: Working with tracking options for opens, thread replies, and link clicks
- **Scheduled Messages**: Creating, listing, and managing scheduled messages
- **Message Cleaning**: Using the clean messages API to process message content
- **Error Handling**: Proper error handling with NylasApiError

## Prerequisites

Before running this example, make sure you have:

1. A Nylas application with an API key
2. A connected email account (grant)
3. The required environment variables set up

## Environment Variables

Create a `.env` file in the parent `examples` directory with:

```bash
# Required
NYLAS_API_KEY=your_api_key_here
NYLAS_GRANT_ID=your_grant_id_here

# Optional
NYLAS_API_URI=https://api.us.nylas.com
```

## Running the Example

```bash
cd examples
npm install
npx ts-node messages/messages.ts
```

## Example Output

The example will demonstrate:
1. Listing messages with different field options
2. Finding specific messages with tracking data
3. Sending messages with tracking enabled
4. Working with raw MIME data
5. Managing scheduled messages
6. Cleaning message content

Each operation includes detailed console output showing the API responses and data structures. 