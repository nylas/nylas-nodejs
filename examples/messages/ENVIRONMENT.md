# Environment Setup for Messages Example

## Required Environment Variables

Create a `.env` file in the `examples` directory with the following variables:

```bash
# Required
NYLAS_API_KEY=your_api_key_here
NYLAS_GRANT_ID=your_grant_id_here

# Optional
NYLAS_API_URI=https://api.us.nylas.com

# For testing message sending (optional)
TEST_EMAIL=your-test-email@example.com
```

## Getting Your API Key and Grant ID

1. **API Key**: Get your API key from the [Nylas Dashboard](https://dashboard.nylas.com)
2. **Grant ID**: After connecting an email account, you'll get a grant ID that represents that connection

## Testing Message Sending

If you want to test the message sending functionality, set the `TEST_EMAIL` environment variable to an email address you control. The example will skip message sending if this variable is not set.

## Running the Example

Once your environment variables are set:

```bash
cd examples
npm install
npm run messages
```

## What the Example Demonstrates

- **Message Fields**: Different ways to query messages with various field options
- **Tracking Options**: How tracking data appears in message responses
- **Raw MIME**: Getting raw MIME data for messages
- **Message Operations**: Listing, finding, updating, and sending messages
- **Scheduled Messages**: Working with scheduled message functionality
- **Message Cleaning**: Using the clean messages API
