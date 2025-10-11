# Nylas Node.js SDK Examples

This directory contains examples of how to use the Nylas Node.js SDK to interact with the Nylas API.

## Examples

### Node.js Examples

- [Grants](./grants/README.md) - Examples of how to fetch, list, sort, and filter grants (authenticated connections to email/calendar providers).
- [Notetakers](./notetakers/README.md) - Examples of how to use the Nylas Notetakers API to invite a Notetaker bot to meetings, get recordings and transcripts, and more.
- [Messages](./messages/README.md) - Examples of how to use the Nylas Messages API to list, find, send, update messages, and work with new features like tracking options and raw MIME data.
- [Folders](./folders/README.md) - Examples of how to use the Nylas Folders API, including the new `singleLevel` parameter for Microsoft accounts.
- [Calendars](./calendars/README.md) - Examples of how to use the Nylas Calendar API to create and manage calendar events with Notetaker integration.

### Cloudflare Workers Examples

- [Cloudflare Vite Calendars](./cloudflare-vite-calendars/README.md) - Modern Cloudflare Workers example using Vite for building a calendar event manager. Showcases listing and creating events with a beautiful web interface.
- [Edge Environment](./edge-environment/README.md) - Standard Cloudflare Workers example for sending email attachments. Demonstrates file upload handling and email sending on the edge.

### Module System Examples

- [ESM Only](./esm-only/) - Example of using the SDK with ES Modules
- [CJS Only](./cjs-only/) - Example of using the SDK with CommonJS

## Running the Examples

### Node.js Examples

To run the Node.js examples, you'll need to:

1. Install dependencies:
   ```bash
   cd examples
   npm install
   ```

2. Copy the `.env.example` file to `.env` and fill in your API key:
   ```bash
   cp .env.example .env
   # Edit .env with your editor and add your API key
   ```

3. Set up the required environment variables in the `.env` file:
   - `NYLAS_API_KEY` - Your Nylas API key
   - `NYLAS_API_URI` (optional) - The Nylas API server URI (defaults to "https://api.us.nylas.com")
   - Additional environment variables specific to each example

4. Run the example:
   ```bash
   # Using ts-node
   npx ts-node grants/grants.ts
   npx ts-node notetakers/notetaker.ts
   npx ts-node calendars/event_with_notetaker.ts
   npx ts-node messages/messages.ts
   
   # Or using npm scripts
   npm run grants
   npm run notetakers
   npm run calendars
   npm run messages
   
   # Or if you compiled the examples
   npm run build
   node dist/grants/grants.js
   node dist/notetakers/notetaker.js
   node dist/calendars/event_with_notetaker.js
   node dist/messages/messages.js
   ```

### Cloudflare Workers Examples

The Cloudflare Workers examples are self-contained and have their own setup:

1. Navigate to the example directory:
   ```bash
   cd examples/cloudflare-vite-calendars
   # or
   cd examples/edge-environment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see each example's README for details):
   ```bash
   cp .dev.vars.example .dev.vars
   # Edit .dev.vars with your Nylas credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Deploy to Cloudflare (optional):
   ```bash
   npm run deploy
   ```

Each Cloudflare example has its own comprehensive README with detailed instructions.

## Documentation

For more information, see the [Nylas API Documentation](https://developer.nylas.com/). 