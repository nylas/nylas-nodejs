# Nylas Calendar Manager - Cloudflare Workers + Vite Example

This example demonstrates how to use the Nylas SDK with Cloudflare Workers and Vite to manage calendar events. It showcases a modern development workflow using the `@cloudflare/vite-plugin` for building and deploying Cloudflare Workers.

## 🚀 Features

- **List Calendar Events**: View all upcoming events from your connected calendar
- **Create Events**: Add new events with title, description, time, and location
- **Beautiful UI**: Modern, responsive web interface with real-time feedback
- **Vite Integration**: Fast development with Hot Module Replacement (HMR)
- **Edge Computing**: Runs on Cloudflare's global edge network
- **Node.js Compatibility**: Uses `nodejs_compat` flag for seamless Nylas SDK integration

## 📋 Prerequisites

Before getting started, you'll need:

1. **Nylas Account**: [Sign up for free](https://dashboard.nylas.com/register)
2. **Cloudflare Account**: [Sign up for free](https://dash.cloudflare.com/sign-up)
3. **Node.js**: Version 18 or higher
4. **Nylas Application**: Created in your Nylas Dashboard with at least one connected calendar
5. **Calendar Access**: At least one email account connected with calendar permissions

## 🛠️ Setup

### 1. Install Dependencies

```bash
# Navigate to the cloudflare-vite-calendars directory
cd examples/cloudflare-vite-calendars

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.dev.vars` file from the example template:

```bash
cp .dev.vars.example .dev.vars
```

Update `.dev.vars` with your Nylas credentials:

```bash
NYLAS_API_KEY=your_nylas_api_key_here
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_GRANT_ID=your_grant_id_here
NYLAS_CALENDAR_ID=your_calendar_id_here
```

**How to get these values:**

- **NYLAS_API_KEY**: Found in your [Nylas Dashboard](https://dashboard.nylas.com/applications) under your application settings
- **NYLAS_GRANT_ID**: The ID of a connected email account (Dashboard > Grants)
- **NYLAS_CALENDAR_ID**: The ID of a calendar from the connected account. You can get this by:
  - Using the [Nylas API](https://developer.nylas.com/docs/api/v3/calendars/#get-/v3/grants/-grant_id-/calendars) to list calendars
  - Or run: `curl -X GET "https://api.us.nylas.com/v3/grants/{GRANT_ID}/calendars" -H "Authorization: Bearer {API_KEY}"`
- **NYLAS_API_URI**: Use `https://api.us.nylas.com` for US region, or your specific region's API URL

### 3. Update Wrangler Configuration (Optional)

Edit `wrangler.toml` to customize your worker name:

```toml
name = "your-worker-name"  # Choose a unique name for your worker
```

## 🏗️ Development

### Start Local Development Server

```bash
npm run dev
```

This will:
- Start the Vite development server with Cloudflare Workers support
- Make your worker available at `http://localhost:5173` (or another port if 5173 is in use)
- Enable Hot Module Replacement for instant updates
- Load environment variables from `.dev.vars`

### Test the Application

1. Open `http://localhost:5173` in your browser
2. **Load Events**: Click "Load Events" to see your existing calendar events
3. **Create Event**: Fill in the form to create a new event:
   - **Event Title**: Required (e.g., "Team Standup")
   - **Description**: Optional details about the event
   - **Start Date/Time**: When the event starts
   - **End Date/Time**: When the event ends
   - **Location**: Optional location information
4. Click "Create Event" to add it to your calendar
5. The events list will automatically refresh to show your new event

### Development Tips

- **Hot Reload**: Code changes automatically reload the worker
- **Error Handling**: Check the browser console and terminal for debugging
- **API Limits**: Be mindful of Nylas API rate limits during development
- **Time Zones**: Dates are handled in the local browser timezone

## 🚀 Deployment

### Option 1: Deploy to Cloudflare Workers (Recommended)

#### 1. Set Production Secrets

For security, use Wrangler secrets instead of environment variables in production:

```bash
# Set your API key as a secret
wrangler secret put NYLAS_API_KEY
# Enter your API key when prompted

# Set your Grant ID as a secret
wrangler secret put NYLAS_GRANT_ID
# Enter your Grant ID when prompted

# Set your Calendar ID as a secret
wrangler secret put NYLAS_CALENDAR_ID
# Enter your Calendar ID when prompted
```

#### 2. Deploy to Production

```bash
npm run deploy
```

This will:
- Build your worker using Vite
- Upload it to Cloudflare
- Make it available at `https://your-worker-name.your-subdomain.workers.dev`

#### 3. Test Production Deployment

Visit your worker's URL and test the calendar functionality.

### Option 2: Deploy with Custom Domain

If you have a custom domain managed by Cloudflare:

1. **Add a route in `wrangler.toml`:**
```toml
[[routes]]
pattern = "calendar.yourdomain.com/*"
zone_name = "yourdomain.com"
```

2. **Deploy with the route:**
```bash
npm run deploy
```

## 📚 How It Works

### Architecture

```
User Browser → Cloudflare Worker (Vite) → Nylas API → Calendar Provider
```

1. **Web Interface**: User interacts with the modern HTML/CSS/JS interface
2. **API Endpoints**: Worker provides REST endpoints for calendar operations
3. **Nylas SDK**: Handles authentication and communication with Nylas API
4. **Calendar Sync**: Nylas syncs with your calendar provider (Google, Microsoft, etc.)

### Key Files

- **`src/worker.ts`**: Main worker logic with request handling and Nylas SDK integration
- **`vite.config.ts`**: Vite configuration with Cloudflare plugin
- **`wrangler.toml`**: Cloudflare Worker configuration with Node.js compatibility
- **`package.json`**: Dependencies and scripts
- **`.dev.vars`**: Development environment variables

### API Endpoints

- **`GET /`**: Serves the HTML interface
- **`GET /api/events`**: Lists calendar events
- **`POST /api/events`**: Creates a new calendar event
- **`OPTIONS /*`**: Handles CORS preflight requests

### Technical Implementation

This worker uses:

- **Vite**: Modern build tool with fast HMR and optimized builds
- **@cloudflare/vite-plugin**: Official Cloudflare plugin for Vite
- **Nylas SDK**: Official Node.js SDK for Nylas API
- **Node.js Compatibility**: Uses `compatibility_date = "2024-09-23"` and `nodejs_compat` flag

The Cloudflare Workers runtime provides Node.js built-in modules like `crypto`, `buffer`, and `stream` that are required by the Nylas SDK.

### Event Data Format

Events are stored with Unix timestamps:

```typescript
{
  title: "Team Meeting",
  description: "Discuss Q1 goals",
  when: {
    startTime: 1704110400,  // Unix timestamp
    endTime: 1704114000
  },
  location: "Conference Room A"
}
```

## 🔧 Customization

### Modify Event Limits

Update the event limit in `src/worker.ts`:

```typescript
const events = await nylas.events.list({
  identifier: env.NYLAS_GRANT_ID,
  queryParams: {
    calendarId: env.NYLAS_CALENDAR_ID,
    limit: 100,  // Change this value
  },
});
```

### Add Event Filtering

Add date range filtering:

```typescript
const events = await nylas.events.list({
  identifier: env.NYLAS_GRANT_ID,
  queryParams: {
    calendarId: env.NYLAS_CALENDAR_ID,
    startsAfter: Math.floor(Date.now() / 1000),  // Only future events
    endsBefore: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),  // Next 30 days
  },
});
```

### Customize the UI

Modify the `HTML_INTERFACE` constant in `src/worker.ts` to change the appearance:

```typescript
const HTML_INTERFACE = `
  <!DOCTYPE html>
  <html>
    <!-- Your custom HTML here -->
  </html>
`;
```

### Add More Event Fields

Extend the event creation to include additional fields like participants, reminders, or conferencing:

```typescript
const requestBody: CreateEventRequest = {
  title: eventData.title,
  description: eventData.description,
  when: { startTime, endTime },
  location: eventData.location,
  participants: [
    { email: 'team@example.com', name: 'Team' }
  ],
  conferencing: {
    provider: 'Google Meet',
    autocreate: {}
  },
  reminders: {
    useDefault: false,
    overrides: [
      { reminderMinutes: 15, reminderMethod: 'email' }
    ]
  }
};
```

## 🐛 Troubleshooting

### Common Issues

**Error: "Missing required environment variables"**
- Ensure all environment variables are set in `.dev.vars` (development) or as secrets (production)
- Verify variable names match exactly as shown in `.dev.vars.example`
- For production, use `wrangler secret put` commands

**Error: "Could not resolve [module]"**
- Ensure `compatibility_date = "2024-09-23"` or later is set in `wrangler.toml`
- Ensure `compatibility_flags = ["nodejs_compat"]` is set
- These settings enable Node.js built-in modules required by the Nylas SDK

**Error: "Failed to list events"**
- Verify your `NYLAS_GRANT_ID` has access to the calendar
- Check that `NYLAS_CALENDAR_ID` is correct and accessible
- Ensure your Nylas grant has calendar read permissions

**Error: "Failed to create event"**
- Verify start time is before end time
- Check that your Nylas grant has calendar write permissions
- Ensure the calendar exists and is writable

**Events not showing up**
- Wait a few seconds for calendar sync
- Check Nylas Dashboard for any API errors
- Verify the calendar provider's status

**Port already in use**
- Vite will automatically try the next available port
- You can specify a port: `vite dev --port 3000`

### Debug Mode

Add logging to the worker for debugging:

```typescript
console.log('Event data:', eventData);
console.log('Nylas response:', response);
```

View logs with:
```bash
wrangler tail
```

Or in development, check your browser console and terminal output.

## 🎯 What's Different from Regular Wrangler?

This example uses **Vite** with the Cloudflare plugin, which provides several advantages:

1. **Faster Development**: Hot Module Replacement (HMR) for instant updates
2. **Modern Tooling**: Leverage Vite's ecosystem and plugins
3. **Better DX**: Improved error messages and debugging
4. **Code Splitting**: Automatic optimization for production builds
5. **TypeScript**: First-class TypeScript support out of the box

Traditional Wrangler workflow:
```bash
wrangler dev  # Start development
wrangler deploy  # Deploy
```

With Vite:
```bash
npm run dev  # Vite dev server with Workers support
npm run deploy  # Vite build + Wrangler deploy
```

## 📖 Related Resources

- **Nylas Calendar API Documentation**: [https://developer.nylas.com/docs/api/v3/calendars/](https://developer.nylas.com/docs/api/v3/calendars/)
- **Nylas Events API**: [https://developer.nylas.com/docs/api/v3/events/](https://developer.nylas.com/docs/api/v3/events/)
- **Cloudflare Vite Plugin**: [https://developers.cloudflare.com/workers/vite-plugin/](https://developers.cloudflare.com/workers/vite-plugin/)
- **Cloudflare Workers Docs**: [https://developers.cloudflare.com/workers/](https://developers.cloudflare.com/workers/)
- **Vite Documentation**: [https://vitejs.dev/](https://vitejs.dev/)

## 📚 Related Examples

- **Edge Environment Example**: See `../edge-environment/` for a standard Wrangler example with email attachments
- **Calendar Examples**: See `../calendars/` for Node.js calendar examples
- **Nylas SDK Examples**: Browse other examples in the `examples/` directory

## 🤝 Contributing

Found an issue or want to improve this example? Please:

1. Check existing issues in the [Nylas Node.js SDK repository](https://github.com/nylas/nylas-nodejs)
2. Create a new issue or pull request
3. Follow the contributing guidelines in the repository

## 📄 License

This example is part of the Nylas Node.js SDK and is licensed under the MIT License.

