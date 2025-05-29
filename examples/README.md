# Nylas Node.js SDK Examples

This directory contains examples of how to use the Nylas Node.js SDK to interact with the Nylas API.

## Examples

- [Notetakers](./notetakers/README.md) - Examples of how to use the Nylas Notetakers API to invite a Notetaker bot to meetings, get recordings and transcripts, and more.
- [Messages](./messages/README.md) - Examples of how to use the Nylas Messages API to list, find, send, update messages, and work with new features like tracking options and raw MIME data.

## Running the Examples

To run these examples, you'll need to:

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
   npx ts-node notetakers/notetaker.ts
   npx ts-node calendars/event_with_notetaker.ts
   npx ts-node messages/messages.ts
   
   # Or using npm scripts
   npm run notetakers
   npm run calendars
   npm run messages
   
   # Or if you compiled the examples
   npm run build
   node dist/notetakers/notetaker.js
   node dist/calendars/event_with_notetaker.js
   node dist/messages/messages.js
   ```

## Documentation

For more information, see the [Nylas API Documentation](https://developer.nylas.com/). 