import Nylas, { CreateEventRequest, Event, NylasApiError } from 'nylas';

// Define the environment interface for TypeScript
interface Env {
  NYLAS_API_KEY: string;
  NYLAS_API_URI: string;
  NYLAS_GRANT_ID: string;
  NYLAS_CALENDAR_ID: string;
}

// HTML interface for calendar management
const HTML_INTERFACE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nylas Calendar Events Manager</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .section-title {
            font-size: 1.5em;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
        }
        input, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s ease;
        }
        input:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 30px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .status {
            margin-top: 15px;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            display: none;
            animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 2px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 2px solid #f5c6cb;
        }
        .status.loading {
            background: #d1ecf1;
            color: #0c5460;
            border: 2px solid #bee5eb;
        }
        .events-list {
            max-height: 500px;
            overflow-y: auto;
        }
        .event-item {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .event-item:hover {
            transform: translateX(5px);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }
        .event-title {
            font-size: 1.2em;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }
        .event-detail {
            color: #666;
            margin: 5px 0;
            font-size: 0.95em;
        }
        .event-detail strong {
            color: #444;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        .empty-state svg {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
            opacity: 0.5;
        }
        .refresh-btn {
            background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
            margin-top: 15px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 10px;
            vertical-align: middle;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Nylas Calendar Manager</h1>
            <p>Manage your calendar events using Nylas SDK on Cloudflare Workers with Vite</p>
        </div>

        <!-- List Events Section -->
        <div class="card">
            <h2 class="section-title">📋 Your Calendar Events</h2>
            <button onclick="loadEvents()" class="refresh-btn" id="loadEventsBtn">
                🔄 Load Events
            </button>
            <div id="eventsStatus" class="status"></div>
            <div id="eventsList" class="events-list"></div>
        </div>

        <!-- Create Event Section -->
        <div class="card">
            <h2 class="section-title">✨ Create New Event</h2>
            <form id="createEventForm">
                <div class="form-group">
                    <label for="title">Event Title:</label>
                    <input type="text" id="title" name="title" required 
                           placeholder="Team Meeting">
                </div>
                
                <div class="form-group">
                    <label for="description">Description:</label>
                    <textarea id="description" name="description" rows="3" 
                              placeholder="Discuss Q1 goals and roadmap"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="startDate">Start Date:</label>
                        <input type="datetime-local" id="startDate" name="startDate" required>
                    </div>
                    <div class="form-group">
                        <label for="endDate">End Date:</label>
                        <input type="datetime-local" id="endDate" name="endDate" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="location">Location:</label>
                    <input type="text" id="location" name="location" 
                           placeholder="Conference Room A">
                </div>
                
                <button type="submit" id="createEventBtn">Create Event</button>
            </form>
            <div id="createStatus" class="status"></div>
        </div>
    </div>

    <script>
        // Set default dates to tomorrow at 10 AM and 11 AM
        function setDefaultDates() {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0);
            
            const endTime = new Date(tomorrow);
            endTime.setHours(11, 0, 0, 0);
            
            document.getElementById('startDate').value = formatDateTimeLocal(tomorrow);
            document.getElementById('endDate').value = formatDateTimeLocal(endTime);
        }

        function formatDateTimeLocal(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return \`\${year}-\${month}-\${day}T\${hours}:\${minutes}\`;
        }

        function showStatus(elementId, message, type) {
            const status = document.getElementById(elementId);
            status.innerHTML = message;
            status.className = \`status \${type}\`;
            status.style.display = 'block';
        }

        function hideStatus(elementId) {
            document.getElementById(elementId).style.display = 'none';
        }

        async function loadEvents() {
            const btn = document.getElementById('loadEventsBtn');
            const eventsList = document.getElementById('eventsList');
            
            btn.disabled = true;
            showStatus('eventsStatus', '<div class="spinner"></div>Loading events...', 'loading');
            eventsList.innerHTML = '';

            try {
                const response = await fetch('/api/events');
                const result = await response.json();

                if (response.ok && result.success) {
                    hideStatus('eventsStatus');
                    
                    if (result.events.length === 0) {
                        eventsList.innerHTML = \`
                            <div class="empty-state">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <p>No events found. Create your first event!</p>
                            </div>
                        \`;
                    } else {
                        eventsList.innerHTML = result.events.map(event => \`
                            <div class="event-item">
                                <div class="event-title">\${event.title || 'Untitled Event'}</div>
                                \${event.description ? \`<div class="event-detail">\${event.description}</div>\` : ''}
                                <div class="event-detail"><strong>📅 Start:</strong> \${new Date(event.when.startTime * 1000).toLocaleString()}</div>
                                <div class="event-detail"><strong>⏰ End:</strong> \${new Date(event.when.endTime * 1000).toLocaleString()}</div>
                                \${event.location ? \`<div class="event-detail"><strong>📍 Location:</strong> \${event.location}</div>\` : ''}
                                <div class="event-detail"><strong>🆔 ID:</strong> <code>\${event.id}</code></div>
                            </div>
                        \`).join('');
                        
                        showStatus('eventsStatus', \`✅ Loaded \${result.events.length} event(s)\`, 'success');
                    }
                } else {
                    showStatus('eventsStatus', \`❌ Error: \${result.error}\`, 'error');
                }
            } catch (error) {
                showStatus('eventsStatus', \`❌ Network error: \${error.message}\`, 'error');
            } finally {
                btn.disabled = false;
            }
        }

        document.getElementById('createEventForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('createEventBtn');
            const form = e.target;
            
            const eventData = {
                title: form.title.value,
                description: form.description.value,
                startDate: new Date(form.startDate.value).toISOString(),
                endDate: new Date(form.endDate.value).toISOString(),
                location: form.location.value,
            };

            btn.disabled = true;
            showStatus('createStatus', '<div class="spinner"></div>Creating event...', 'loading');

            try {
                const response = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showStatus('createStatus', 
                        \`✅ Event created successfully! ID: \${result.event.id}\`, 
                        'success'
                    );
                    form.reset();
                    setDefaultDates();
                    
                    // Auto-refresh events list after a short delay
                    setTimeout(() => loadEvents(), 1000);
                } else {
                    showStatus('createStatus', \`❌ Error: \${result.error}\`, 'error');
                }
            } catch (error) {
                showStatus('createStatus', \`❌ Network error: \${error.message}\`, 'error');
            } finally {
                btn.disabled = false;
            }
        });

        // Initialize
        setDefaultDates();
    </script>
</body>
</html>
`;

/**
 * List calendar events
 */
async function listEvents(nylas: Nylas, env: Env): Promise<Response> {
  try {
    const events = await nylas.events.list({
      identifier: env.NYLAS_GRANT_ID,
      queryParams: {
        calendarId: env.NYLAS_CALENDAR_ID,
        limit: 50,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        events: events.data,
        count: events.data.length,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error listing events:', error);

    const errorMessage =
      error instanceof NylasApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Create a new calendar event
 */
async function createEvent(
  nylas: Nylas,
  env: Env,
  eventData: any
): Promise<Response> {
  try {
    // Convert ISO dates to Unix timestamps
    const startTime = Math.floor(new Date(eventData.startDate).getTime() / 1000);
    const endTime = Math.floor(new Date(eventData.endDate).getTime() / 1000);

    // Prepare the event request
    const requestBody: CreateEventRequest = {
      title: eventData.title,
      description: eventData.description || '',
      when: {
        startTime,
        endTime,
      },
      location: eventData.location || '',
      busy: true,
    };

    // Create the event
    const response = await nylas.events.create({
      identifier: env.NYLAS_GRANT_ID,
      requestBody,
      queryParams: {
        calendarId: env.NYLAS_CALENDAR_ID,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        event: response.data,
        message: 'Event created successfully',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating event:', error);

    const errorMessage =
      error instanceof NylasApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Main request handler
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Validate environment variables
    if (
      !env.NYLAS_API_KEY ||
      !env.NYLAS_GRANT_ID ||
      !env.NYLAS_CALENDAR_ID
    ) {
      return new Response(
        JSON.stringify({
          error:
            'Missing required environment variables (NYLAS_API_KEY, NYLAS_GRANT_ID, NYLAS_CALENDAR_ID)',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Nylas client
    const nylas = new Nylas({
      apiKey: env.NYLAS_API_KEY,
      apiUri: env.NYLAS_API_URI || 'https://api.us.nylas.com',
    });

    // Serve HTML interface
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(HTML_INTERFACE, {
        headers: {
          'Content-Type': 'text/html',
          ...corsHeaders,
        },
      });
    }

    // List events endpoint
    if (request.method === 'GET' && url.pathname === '/api/events') {
      return listEvents(nylas, env);
    }

    // Create event endpoint
    if (request.method === 'POST' && url.pathname === '/api/events') {
      try {
        const eventData = await request.json();
        return createEvent(nylas, env, eventData);
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid request body',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    }

    // 404 for other routes
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders,
    });
  },
};

