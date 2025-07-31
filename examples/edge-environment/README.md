# Nylas Cloudflare Worker - Email Attachments Example

This example demonstrates how to use the Nylas SDK in a Cloudflare Worker to send email attachments. It provides a simple web interface for uploading files and sending them as email attachments.

## 🚀 Features

- **Simple Web UI**: Drag & drop or click to upload files
- **File Validation**: Automatic file size and type validation (10MB max)
- **Real-time Feedback**: Loading states and success/error messages
- **Email Sending**: Uses the Nylas SDK to send emails with attachments
- **Edge Computing**: Runs on Cloudflare's global edge network
- **Node.js Compatibility**: Uses `nodejs_compat` flag for seamless Node.js module support

## 📋 Prerequisites

Before getting started, you'll need:

1. **Nylas Account**: [Sign up for free](https://dashboard.nylas.com/register)
2. **Cloudflare Account**: [Sign up for free](https://dash.cloudflare.com/sign-up)
3. **Node.js**: Version 16 or higher
4. **Nylas Application**: Created in your Nylas Dashboard
5. **Connected Email Account**: At least one email account connected to your Nylas application

## 🛠️ Setup

### 1. Install Dependencies

```bash
# Navigate to the edge-environment directory
cd examples/edge-environment

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Copy the `.dev.vars` file and update it with your Nylas credentials:

```bash
# Update .dev.vars with your actual values
NYLAS_API_KEY=your_nylas_api_key_here
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_GRANT_ID=your_grant_id_here
TEST_EMAIL=test@example.com
```

**How to get these values:**

- **NYLAS_API_KEY**: Found in your [Nylas Dashboard](https://dashboard.nylas.com/applications) under your application settings
- **NYLAS_GRANT_ID**: The ID of a connected email account (found in Dashboard > Grants)
- **NYLAS_API_URI**: Use `https://api.us.nylas.com` for US region, or your specific region's API URL

### 3. Update Wrangler Configuration

Edit `wrangler.toml` and update the name and environment variables as needed:

```toml
name = "your-worker-name"  # Choose a unique name for your worker

[env.development.vars]
NYLAS_API_KEY = "your_api_key"
NYLAS_GRANT_ID = "your_grant_id"
# ... other variables
```

## 🏗️ Development

### Start Local Development Server

```bash
npm run dev
```

This will:
- Start the Wrangler development server
- Make your worker available at `http://localhost:8787`
- Enable hot-reloading for code changes
- Load environment variables from `.dev.vars`

### Test the Application

1. Open `http://localhost:8787` in your browser
2. Fill in the email form:
   - **Recipient Email**: Enter a valid email address
   - **Subject**: Enter an email subject
   - **Message**: Enter your message content
   - **Attachment**: Upload a file (max 10MB)
3. Click "Send Email with Attachment"
4. Check the recipient's inbox for the email

### Development Tips

- **File Size Limit**: The worker is configured with a 10MB file size limit
- **Supported Files**: All file types are supported (PDFs, images, documents, etc.)
- **Error Handling**: Check the browser console and worker logs for debugging
- **Hot Reloading**: Code changes will automatically reload the worker

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

# Set default recipient email (optional)
wrangler secret put TEST_EMAIL
# Enter default email when prompted
```

#### 2. Deploy to Production

```bash
npm run deploy
```

This will:
- Build and upload your worker to Cloudflare
- Make it available at `https://your-worker-name.your-subdomain.workers.dev`
- Use the production environment configuration

#### 3. Test Production Deployment

Visit your worker's URL and test the file upload functionality.

### Option 2: Deploy with Custom Domain

If you have a custom domain managed by Cloudflare:

1. **Add a route in `wrangler.toml`:**
```toml
[[routes]]
pattern = "attachments.yourdomain.com/*"
zone_name = "yourdomain.com"
```

2. **Deploy with the route:**
```bash
wrangler deploy
```

## 📚 How It Works

### Architecture

```
User Browser → Cloudflare Worker → Nylas API → Email Provider
```

1. **File Upload**: User uploads a file through the web interface
2. **Form Processing**: Worker receives multipart form data
3. **File Processing**: File is converted to Buffer for efficient binary transfer
4. **Email Sending**: Nylas SDK processes and sends the email with attachment
5. **Response**: User receives confirmation or error message

### Key Files

- **`src/worker.ts`**: Main worker logic and request handling
- **`wrangler.toml`**: Cloudflare Worker configuration with Node.js compatibility
- **`package.json`**: Dependencies and scripts
- **`.dev.vars`**: Development environment variables

### Technical Implementation

This worker uses the **Nylas SDK** with optimizations for Cloudflare Workers:

- **SDK Integration**: Uses the official Nylas Node.js SDK
- **Buffer Attachments**: Uses native Buffer objects for efficient binary data handling
- **Direct Binary Transfer**: No base64 encoding overhead (33% smaller than base64)
- **Edge Optimized**: Designed specifically for Cloudflare Workers runtime

### Node.js Compatibility

This worker uses:
- **`compatibility_date = "2024-09-23"`**: Enables automatic Node.js built-in module support  
- **`nodejs_compat` compatibility flag**: Additional Node.js compatibility features

These settings enable Node.js built-in modules like `crypto`, `path`, `fs`, and `stream` that are required by the Nylas SDK. The Buffer attachment approach ensures optimal performance and compatibility with the Cloudflare Workers edge environment.

### API Endpoints

- **`GET /`**: Serves the HTML upload interface
- **`POST /send-attachment`**: Handles file upload and email sending
- **`OPTIONS /*`**: Handles CORS preflight requests

## 🔧 Customization

### Modify File Size Limits

Update the file size limit in `src/worker.ts`:

```typescript
// Check file size (10MB limit)
const maxSize = 10 * 1024 * 1024; // Change this value
```

### Use ReadableStream for Very Large Files

For extremely large files (>25MB), you can use ReadableStream instead of Buffer:

```typescript
// Alternative: Use ReadableStream for very large files
const stream = file.stream();
const sendRequest: SendMessageRequest = {
  // ... other fields
  attachments: [{
    filename: file.name,
    contentType: getContentType(file.name),
    content: stream,  // Use stream instead of buffer
    size: file.size,
  }],
};
```

### Customize Email Template

Modify the email HTML template in `src/worker.ts`:

```typescript
body: `
  <div style="font-family: Arial, sans-serif;">
    <h2>Your Custom Email Template</h2>
    <p>${message}</p>
    <!-- Add your custom styling and content -->
  </div>
`,
```

### Add File Type Restrictions

Add file type validation in the worker:

```typescript
// Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!allowedTypes.includes(getContentType(file.name))) {
  return new Response(
    JSON.stringify({ error: 'File type not allowed' }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}
```

## 🐛 Troubleshooting

### Common Issues

**Error: "Missing required environment variables"**
- Ensure all environment variables are set in `.dev.vars` (development) or as secrets (production)
- Check variable names match exactly

**Error: "Could not resolve [module]" (crypto, path, fs, stream)**
- Ensure `compatibility_date = "2024-09-23"` or later is set in `wrangler.toml`
- Ensure `compatibility_flags = ["nodejs_compat"]` is also set
- These settings enable Node.js built-in modules required by the Nylas SDK
- The worker uses Buffer objects for efficient binary attachment handling

**Error: "File size exceeds 10MB limit"**
- Reduce file size or increase the limit in the worker code
- Note: Cloudflare Workers have memory and CPU time limits

**Error: "Invalid file upload"**
- Ensure you're uploading a valid file
- Check that the form is submitting properly

**Error: "optionParams.form.getHeaders is not a function"**
- This was an old SDK compatibility issue, now resolved
- The worker uses Buffer attachments instead of problematic form-data
- This error should not occur with the current implementation

**Email not received**
- Verify the recipient email address
- Check spam/junk folders
- Verify your Nylas grant has send permissions
- Check Nylas Dashboard for any API errors

### Debug Mode

Add logging to the worker for debugging:

```typescript
console.log('File details:', {
  name: file.name,
  size: file.size,
  type: file.type
});
```

View logs with:
```bash
wrangler tail
```

## 📖 Related Examples

- **Local Attachment Examples**: See `../messages/examples/` for Node.js examples
- **Nylas SDK Documentation**: [https://developer.nylas.com](https://developer.nylas.com)
- **Cloudflare Workers Docs**: [https://developers.cloudflare.com/workers/](https://developers.cloudflare.com/workers/)

## 🤝 Contributing

Found an issue or want to improve this example? Please:

1. Check existing issues in the [Nylas Node.js SDK repository](https://github.com/nylas/nylas-nodejs)
2. Create a new issue or pull request
3. Follow the contributing guidelines

## 📄 License

This example is part of the Nylas Node.js SDK and is licensed under the MIT License. 