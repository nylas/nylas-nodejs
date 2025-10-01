import Nylas, { SendMessageRequest } from 'nylas';
import * as mimeTypes from 'mime-types';

// Define the environment interface for TypeScript
interface Env {
  NYLAS_API_KEY: string;
  NYLAS_API_URI: string;
  NYLAS_GRANT_ID: string;
  TEST_EMAIL: string;
}

// Simple HTML interface for file upload
const HTML_INTERFACE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nylas Attachment Sender</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
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
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }
        input:focus, textarea:focus {
            outline: none;
            border-color: #0066cc;
        }
        .file-input {
            border: 2px dashed #ddd;
            padding: 20px;
            text-align: center;
            background: #fafafa;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .file-input:hover {
            border-color: #0066cc;
            background: #f0f8ff;
        }
        .file-input.dragover {
            border-color: #0066cc;
            background: #e6f3ff;
        }
        button {
            background: #0066cc;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            transition: background 0.3s ease;
        }
        button:hover:not(:disabled) {
            background: #0052a3;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
            text-align: center;
            display: none;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status.loading {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .file-info {
            margin-top: 10px;
            padding: 10px;
            background: #e9f7ef;
            border-radius: 4px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Nylas Attachment Sender</h1>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
            Upload a file and send it as an email attachment using the Nylas SDK in a Cloudflare Worker
        </p>
        
        <form id="uploadForm">
            <div class="form-group">
                <label for="recipientEmail">Recipient Email:</label>
                <input type="email" id="recipientEmail" name="recipientEmail" required 
                       placeholder="recipient@example.com">
            </div>
            
            <div class="form-group">
                <label for="subject">Subject:</label>
                <input type="text" id="subject" name="subject" required 
                       placeholder="Email with attachment from Cloudflare Worker">
            </div>
            
            <div class="form-group">
                <label for="message">Message:</label>
                <textarea id="message" name="message" rows="4" required 
                          placeholder="This email was sent from a Cloudflare Worker using the Nylas SDK!"></textarea>
            </div>
            
            <div class="form-group">
                <label>Attachment:</label>
                <div class="file-input" id="fileInput">
                    <input type="file" id="file" name="file" required style="display: none;">
                    <div id="filePrompt">
                        <strong>📎 Click to select a file</strong><br>
                        <span style="color: #888;">or drag and drop here</span><br>
                        <small style="color: #999;">Max size: 10MB</small>
                    </div>
                </div>
                <div class="file-info" id="fileInfo"></div>
            </div>
            
            <button type="submit" id="submitBtn">Send Email with Attachment</button>
        </form>
        
        <div class="status" id="status"></div>
    </div>

    <script>
        const fileInput = document.getElementById('file');
        const fileInputArea = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        const filePrompt = document.getElementById('filePrompt');
        const form = document.getElementById('uploadForm');
        const submitBtn = document.getElementById('submitBtn');
        const status = document.getElementById('status');

        // File input handlers
        fileInputArea.addEventListener('click', () => fileInput.click());
        fileInputArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileInputArea.classList.add('dragover');
        });
        fileInputArea.addEventListener('dragleave', () => {
            fileInputArea.classList.remove('dragover');
        });
        fileInputArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileInputArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileInfo(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                updateFileInfo(e.target.files[0]);
            }
        });

        function updateFileInfo(file) {
            const size = (file.size / 1024 / 1024).toFixed(2);
            fileInfo.innerHTML = \`
                <strong>\${file.name}</strong><br>
                <span style="color: #666;">Size: \${size} MB | Type: \${file.type || 'Unknown'}</span>
            \`;
            fileInfo.style.display = 'block';
            filePrompt.style.display = 'none';
        }

        function showStatus(message, type) {
            status.textContent = message;
            status.className = \`status \${type}\`;
            status.style.display = 'block';
        }

        function hideStatus() {
            status.style.display = 'none';
        }

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!fileInput.files[0]) {
                showStatus('Please select a file to attach', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('recipientEmail', document.getElementById('recipientEmail').value);
            formData.append('subject', document.getElementById('subject').value);
            formData.append('message', document.getElementById('message').value);
            formData.append('file', fileInput.files[0]);

            submitBtn.disabled = true;
            showStatus('Sending email...', 'loading');

            try {
                const response = await fetch('/send-attachment', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    showStatus(\`Email sent successfully! Message ID: \${result.messageId}\`, 'success');
                    form.reset();
                    fileInfo.style.display = 'none';
                    filePrompt.style.display = 'block';
                } else {
                    showStatus(\`Error: \${result.error}\`, 'error');
                }
            } catch (error) {
                showStatus(\`Network error: \${error.message}\`, 'error');
            } finally {
                submitBtn.disabled = false;
            }
        });
    </script>
</body>
</html>
`;

// Helper function to parse multipart form data
async function parseFormData(
  request: Request
): Promise<{ [key: string]: any }> {
  const formData = await request.formData();
  const result: { [key: string]: any } = {};

  for (const [key, value] of formData.entries()) {
    result[key] = value;
  }

  return result;
}

// Helper function to get file content type
function getContentType(filename: string): string {
  return mimeTypes.lookup(filename) || 'application/octet-stream';
}

// Main request handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for the response
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: 'cloudflare-worker',
          sdk: 'nylas-nodejs',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    // Serve the HTML interface on GET requests
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(HTML_INTERFACE, {
        headers: {
          'Content-Type': 'text/html',
          ...corsHeaders,
        },
      });
    }

    // Handle file upload and email sending on POST requests
    if (request.method === 'POST' && url.pathname === '/send-attachment') {
      try {
        // Validate environment variables
        if (!env.NYLAS_API_KEY || !env.NYLAS_GRANT_ID) {
          return new Response(
            JSON.stringify({
              error:
                'Missing required environment variables (NYLAS_API_KEY, NYLAS_GRANT_ID)',
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }

        // Parse form data
        const formData = await parseFormData(request);
        const recipientEmail = formData.recipientEmail as string;
        const subject = formData.subject as string;
        const message = formData.message as string;
        const file = formData.file;

        // Validate that file is actually a File object
        if (typeof file === 'string' || !file) {
          return new Response(
            JSON.stringify({ error: 'Invalid file upload' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }

        // Validate required fields
        if (!recipientEmail || !subject || !message || !file) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          return new Response(
            JSON.stringify({ error: 'File size exceeds 10MB limit' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }

        // Initialize Nylas client
        const nylas = new Nylas({
          apiKey: env.NYLAS_API_KEY,
          apiUri: env.NYLAS_API_URI || 'https://api.us.nylas.com',
        });

        // Convert file to Buffer for SDK
        const fileBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(fileBuffer);

        // Prepare the email request using the SDK
        const sendRequest: SendMessageRequest = {
          to: [{ email: recipientEmail }],
          subject: subject,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Email from Cloudflare Worker</h2>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 14px;">
                This email was sent from a Cloudflare Worker using the Nylas SDK.<br>
                Attachment: <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          `,
          attachments: [
            {
              filename: file.name,
              contentType: getContentType(file.name),
              content: buffer,
              size: file.size,
            },
          ],
        };

        // Send the email using the Nylas SDK
        const response = await nylas.messages.send({
          identifier: env.NYLAS_GRANT_ID,
          requestBody: sendRequest,
        });

        // Return success response
        return new Response(
          JSON.stringify({
            success: true,
            messageId: response.data.id,
            message: 'Email sent successfully',
          }),
          {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      } catch (error) {
        console.error('Error sending email:', error);

        return new Response(
          JSON.stringify({
            error:
              error instanceof Error ? error.message : 'Unknown error occurred',
          }),
          {
            status: 500,
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
