# Nylas Calendar API Examples

This directory contains examples of how to use the Nylas Calendar API with the Nylas Node.js SDK.

## Examples

- [event_with_notetaker.ts](./event_with_notetaker.ts) - A complete example showing how to create calendar events with Notetaker integration, retrieve events with their associated Notetakers, and update both events and Notetakers.

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
   - `NYLAS_GRANT_ID` - The Grant ID to use for calendar operations
   - `NYLAS_CALENDAR_ID` - The Calendar ID to use for creating and updating events

4. Run the example:
   ```bash
   # From the examples directory
   npm run calendars
   
   # Or directly with ts-node
   npx ts-node calendars/event_with_notetaker.ts
   ```

## Understanding the Example

This example demonstrates:

1. **Creating an Event with a Notetaker**: Creating a calendar event with an integrated Notetaker bot.
2. **Retrieving Event Notetaker**: Finding the Notetaker associated with a specific event.
3. **Updating Event and Notetaker**: Modifying both an event's details and its associated Notetaker settings.

## Documentation

For more information, see the [Nylas API Documentation](https://developer.nylas.com/). 