# Quick Start Guide

Get up and running with the Nylas Calendar Manager on Cloudflare Workers + Vite in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Nylas account with API key
- A connected calendar (Google, Microsoft, etc.)

## Setup Steps

### 1. Navigate to the example directory

```bash
cd examples/cloudflare-vite-calendars
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
# Copy the example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your credentials
# You'll need:
# - NYLAS_API_KEY: From Nylas Dashboard > Applications
# - NYLAS_GRANT_ID: From Nylas Dashboard > Grants
# - NYLAS_CALENDAR_ID: Get by calling GET /v3/grants/{grantId}/calendars
```

**Getting your Calendar ID:**

```bash
# Replace with your actual values
curl -X GET "https://api.us.nylas.com/v3/grants/YOUR_GRANT_ID/calendars" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 4. Start the development server

```bash
npm run dev
```

The server will start on `http://localhost:5173` (or another port if 5173 is in use).

### 5. Use the app

1. Open `http://localhost:5173` in your browser
2. Click "Load Events" to see your calendar events
3. Fill out the form to create a new event
4. Watch as the calendar updates in real-time!

## What You Can Do

- ✅ **List Events**: View all your calendar events with details
- ✅ **Create Events**: Add new events with title, description, time, and location
- ✅ **Real-time Updates**: See changes immediately after creating events
- ✅ **Beautiful UI**: Modern, responsive interface

## Next Steps

### Deploy to Production

```bash
# Set production secrets
wrangler secret put NYLAS_API_KEY
wrangler secret put NYLAS_GRANT_ID
wrangler secret put NYLAS_CALENDAR_ID

# Deploy
npm run deploy
```

### Customize the Example

Check out the [full README](./README.md) for:
- Customizing the UI
- Adding more event fields (participants, conferencing, reminders)
- Filtering events by date range
- Implementing event updates and deletion

## Troubleshooting

**Port already in use?**
- Vite will automatically try the next available port

**Can't see events?**
- Verify your `NYLAS_CALENDAR_ID` is correct
- Check that your grant has calendar permissions

**Can't create events?**
- Ensure start time is before end time
- Verify your grant has write permissions

## Learn More

- [Full README](./README.md) - Complete documentation
- [Nylas Calendar API](https://developer.nylas.com/docs/api/v3/calendars/) - API reference
- [Cloudflare Vite Plugin](https://developers.cloudflare.com/workers/vite-plugin/) - Vite integration docs

---

**Need help?** Check the [Nylas Developer Forum](https://forums.nylas.com/) or open an issue on [GitHub](https://github.com/nylas/nylas-nodejs).

