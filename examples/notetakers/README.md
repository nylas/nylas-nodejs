# Nylas Notetakers API Examples

This directory contains examples of how to use the Nylas Notetakers API with the Nylas Node.js SDK.

## What is Notetakers?

The Nylas Notetakers API allows you to invite a Notetaker bot to your meetings. The bot can record audio, video, and generate transcripts of your meetings.

## Examples

- [notetaker.ts](./notetaker.ts) - A complete example showing how to invite a Notetaker to a meeting, list all Notetakers, get media from a Notetaker, and leave a meeting.

## Running the Examples

To run these examples, you'll need to:

1. Install dependencies from the examples directory:

   ```bash
   cd examples
   npm install
   ```

2. Copy the `.env.example` file to `.env` and fill in your API key:

   ```bash
   cp .env.example .env
   # Edit .env with your editor
   ```

3. Edit the `.env` file to include:

   - `NYLAS_API_KEY` - Your Nylas API key
   - `NYLAS_API_URI` (optional) - The Nylas API server URI (defaults to "https://api.us.nylas.com")
   - `MEETING_LINK` - The URL of the meeting to join (e.g., a Zoom, Google Meet, or Microsoft Teams meeting link)

4. Run the example:

   ```bash
   # From the examples directory
   npm run notetakers

   # Or directly with ts-node
   npx ts-node notetakers/notetaker.ts
   ```

## Understanding the Example

This example demonstrates:

1. **Inviting a Notetaker**: Adding a Notetaker bot to a meeting by providing a meeting link and settings.
2. **Listing Notetakers**: Getting a list of all Notetakers in your account.
3. **Retrieving Media**: Accessing recordings and transcripts after the meeting (if the state is `media_available`).
4. **Leaving a Meeting**: Having the Notetaker bot leave the meeting.

## Documentation

For more information, see the [Nylas API Documentation](https://developer.nylas.com/).
