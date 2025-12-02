import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Nylas, { SendMessageRequest } from 'nylas';
import * as mimeTypes from 'mime-types';

// Environment variables interface
interface LambdaEnv {
  NYLAS_API_KEY: string;
  NYLAS_API_URI?: string;
  NYLAS_GRANT_ID: string;
}

// HTML interface for file upload with multiple file support
const HTML_INTERFACE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nylas Attachment Sender - AWS Lambda</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 700px;
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
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
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
        .file-list {
            margin-top: 10px;
            padding: 10px;
            background: #e9f7ef;
            border-radius: 4px;
            display: none;
        }
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #d4edda;
        }
        .file-item:last-child {
            border-bottom: none;
        }
        .file-name {
            font-weight: 600;
            color: #333;
        }
        .file-size {
            color: #666;
            font-size: 14px;
        }
        .total-size {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #c3e6cb;
            font-weight: 600;
            color: #155724;
        }
        .total-size.warning {
            color: #856404;
            background: #fff3cd;
            padding: 8px;
            border-radius: 4px;
        }
        .remove-file {
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 12px;
        }
        .remove-file:hover {
            background: #c82333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 Nylas Attachment Sender</h1>
        <p class="subtitle">
            Upload multiple files and send them as email attachments using the Nylas SDK in AWS Lambda<br>
            <small>Test the fix for: "Lambda freezes when sending emails with 2+ attachments over 3MB total"</small>
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
                       placeholder="Email with attachments from AWS Lambda">
            </div>
            
            <div class="form-group">
                <label for="message">Message:</label>
                <textarea id="message" name="message" rows="4" required 
                          placeholder="This email was sent from an AWS Lambda function using the Nylas SDK!"></textarea>
            </div>
            
            <div class="form-group">
                <label>Attachments (multiple files supported):</label>
                <div class="file-input" id="fileInput">
                    <input type="file" id="file" name="file" multiple style="display: none;">
                    <div id="filePrompt">
                        <strong>📎 Click to select files</strong><br>
                        <span style="color: #888;">or drag and drop here</span><br>
                        <small style="color: #999;">Select multiple files to test 2+ attachments over 3MB</small>
                    </div>
                </div>
                <div class="file-list" id="fileList"></div>
            </div>
            
            <button type="submit" id="submitBtn">Send Email with Attachments</button>
        </form>
        
        <div class="status" id="status"></div>
    </div>

    <script>
        const fileInput = document.getElementById('file');
        const fileInputArea = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        const filePrompt = document.getElementById('filePrompt');
        const form = document.getElementById('uploadForm');
        const submitBtn = document.getElementById('submitBtn');
        const status = document.getElementById('status');
        let selectedFiles = [];

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
            const files = Array.from(e.dataTransfer.files);
            addFiles(files);
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                addFiles(Array.from(e.target.files));
            }
        });

        function addFiles(files) {
            files.forEach(file => {
                if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
                    selectedFiles.push(file);
                }
            });
            updateFileList();
        }

        function removeFile(index) {
            selectedFiles.splice(index, 1);
            updateFileList();
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }

        function updateFileList() {
            if (selectedFiles.length === 0) {
                fileList.style.display = 'none';
                filePrompt.style.display = 'block';
                return;
            }

            filePrompt.style.display = 'none';
            fileList.style.display = 'block';
            
            const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
            const threeMB = 3 * 1024 * 1024;
            
            let html = '';
            selectedFiles.forEach((file, index) => {
                html += \`
                    <div class="file-item">
                        <div>
                            <div class="file-name">\${file.name}</div>
                            <div class="file-size">\${formatBytes(file.size)}</div>
                        </div>
                        <button type="button" class="remove-file" onclick="removeFile(\${index})">Remove</button>
                    </div>
                \`;
            });
            
            html += \`
                <div class="total-size \${totalSize >= threeMB ? 'warning' : ''}">
                    Total: \${formatBytes(totalSize)} \${totalSize >= threeMB ? '⚠️ (Will use multipart/form-data)' : ''}
                </div>
            \`;
            
            fileList.innerHTML = html;
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
            
            if (selectedFiles.length === 0) {
                showStatus('Please select at least one file to attach', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('recipientEmail', document.getElementById('recipientEmail').value);
            formData.append('subject', document.getElementById('subject').value);
            formData.append('message', document.getElementById('message').value);
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

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
                    selectedFiles = [];
                    updateFileList();
                } else {
                    showStatus(\`Error: \${result.error}\`, 'error');
                }
            } catch (error) {
                showStatus(\`Network error: \${error.message}\`, 'error');
            } finally {
                submitBtn.disabled = false;
            }
        });

        // Make removeFile available globally
        window.removeFile = removeFile;
    </script>
</body>
</html>
`;

// Helper function to get content type
function getContentType(filename: string): string {
  return mimeTypes.lookup(filename) || 'application/octet-stream';
}

// Helper function to parse multipart form data from API Gateway
// Note: For production use, consider using a library like 'lambda-multipart-parser'
// or 'busboy' for more robust multipart parsing
async function parseFormData(
  body: string,
  contentType: string
): Promise<{ [key: string]: any }> {
  // API Gateway HTTP API sends multipart data as a string (or base64 if isBase64Encoded is true)
  // We parse it manually here for simplicity
  // For production, use a library like 'lambda-multipart-parser'
  
  // Extract boundary from Content-Type header
  const boundaryMatch = contentType.match(/boundary=([^;]+)/);
  if (!boundaryMatch) {
    throw new Error(`Invalid multipart content type: ${contentType}`);
  }
  const boundary = boundaryMatch[1].trim();
  
  // Split by boundary (with -- prefix)
  const parts = body.split(`--${boundary}`);
  const result: { [key: string]: any } = { files: [] };

  for (const part of parts) {
    // Skip empty parts and closing boundary
    const trimmedPart = part.trim();
    if (!trimmedPart || trimmedPart === '--' || trimmedPart === '') continue;

    // Split headers and content (multipart uses \r\n\r\n as separator)
    const headerEndIndex = trimmedPart.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) {
      // Try \n\n as fallback
      const headerEndIndexAlt = trimmedPart.indexOf('\n\n');
      if (headerEndIndexAlt === -1) continue;
      const headers = trimmedPart.substring(0, headerEndIndexAlt);
      const content = trimmedPart.substring(headerEndIndexAlt + 2);
      processPart(headers, content, result);
    } else {
      const headers = trimmedPart.substring(0, headerEndIndex);
      const content = trimmedPart.substring(headerEndIndex + 4);
      processPart(headers, content, result);
    }
  }

  return result;
}

function processPart(
  headers: string,
  content: string,
  result: { [key: string]: any }
): void {
  // Extract field name
  const nameMatch = headers.match(/name="([^"]+)"/);
  if (!nameMatch) return;

  const name = nameMatch[1];
  
  // Check if it's a file (has filename attribute)
  const filenameMatch = headers.match(/filename="([^"]+)"/);
  const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);

  // Remove trailing \r\n from content
  const trimmedContent = content.replace(/\r\n$/, '').replace(/\n$/, '');

  if (filenameMatch) {
    // It's a file
    const filename = filenameMatch[1];
    const fileContentType = contentTypeMatch
      ? contentTypeMatch[1].trim()
      : getContentType(filename);
    
    // Convert content to buffer (handle both binary and base64 if needed)
    const buffer = Buffer.from(trimmedContent, 'binary');

    if (!result.files) {
      result.files = [];
    }
    result.files.push({
      filename,
      contentType: fileContentType,
      content: buffer,
      size: buffer.length,
    });
  } else {
    // It's a regular form field
    result[name] = trimmedContent;
  }
}

// Main Lambda handler
// Export as const so esbuild can properly convert to CommonJS exports.handler
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: '',
      };
    }

    // Validate environment variables
    const env: LambdaEnv = {
      NYLAS_API_KEY: process.env.NYLAS_API_KEY || '',
      NYLAS_API_URI: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
      NYLAS_GRANT_ID: process.env.NYLAS_GRANT_ID || '',
    };

    if (!env.NYLAS_API_KEY || !env.NYLAS_GRANT_ID) {
      console.error('Missing environment variables:', {
        hasApiKey: !!env.NYLAS_API_KEY,
        hasGrantId: !!env.NYLAS_GRANT_ID,
      });
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        body: JSON.stringify({
          error:
            'Missing required environment variables (NYLAS_API_KEY, NYLAS_GRANT_ID)',
        }),
      };
    }

    // Get the request path (API Gateway HTTP API uses rawPath, REST API uses path)
    const requestPath = (event as any).rawPath || event.path || '/';
    const httpMethod = event.httpMethod || (event as any).requestContext?.http?.method || 'GET';
    
    console.log('Request received:', { httpMethod, requestPath, hasBody: !!event.body });

    // Serve HTML interface on GET /
    if (httpMethod === 'GET' && requestPath === '/') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        ...corsHeaders,
      },
      body: HTML_INTERFACE,
    };
  }

    // Handle file upload and email sending on POST /send-attachment
    if (httpMethod === 'POST' && requestPath === '/send-attachment') {
      try {
      // Parse multipart form data
      const contentType =
        event.headers['Content-Type'] || event.headers['content-type'] || '';

      if (!contentType.includes('multipart/form-data')) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          body: JSON.stringify({
            error: 'Content-Type must be multipart/form-data',
          }),
        };
      }

      // API Gateway sends body as base64 if isBase64Encoded is true
      const body = event.isBase64Encoded
        ? Buffer.from(event.body || '', 'base64').toString('binary')
        : event.body || '';

      if (!body) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          body: JSON.stringify({ error: 'Request body is empty' }),
        };
      }

      let formData;
      try {
        formData = await parseFormData(body, contentType);
        console.log('Parsed form data keys:', Object.keys(formData));
        console.log('Files count:', formData.files?.length || 0);
        console.log('Recipient email:', formData.recipientEmail ? 'present' : 'missing');
        console.log('Subject:', formData.subject ? 'present' : 'missing');
        console.log('Message:', formData.message ? 'present' : 'missing');
      } catch (parseError) {
        console.error('Error parsing form data:', parseError);
        console.error('Content-Type:', contentType);
        console.error('Body length:', body.length);
        console.error('Body preview (first 500 chars):', body.substring(0, 500));
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          body: JSON.stringify({
            error: 'Failed to parse form data',
            details: parseError instanceof Error ? parseError.message : String(parseError),
          }),
        };
      }
      const recipientEmail = formData.recipientEmail as string;
      const subject = formData.subject as string;
      const message = formData.message as string;
      const files = formData.files as Array<{
        filename: string;
        contentType: string;
        content: Buffer;
        size: number;
      }>;

      // Validate required fields with detailed error
      const missingFields: string[] = [];
      if (!recipientEmail) missingFields.push('recipientEmail');
      if (!subject) missingFields.push('subject');
      if (!message) missingFields.push('message');
      if (!files || files.length === 0) missingFields.push('files');

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        console.error('Form data keys:', Object.keys(formData));
        console.error('Form data values:', {
          recipientEmail: formData.recipientEmail ? 'present' : 'missing',
          subject: formData.subject ? 'present' : 'missing',
          message: formData.message ? 'present' : 'missing',
          filesCount: formData.files?.length || 0,
        });
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          body: JSON.stringify({ 
            error: 'Missing required fields',
            missingFields: missingFields,
            receivedFields: Object.keys(formData),
          }),
        };
      }

      // Initialize Nylas client
      const nylas = new Nylas({
        apiKey: env.NYLAS_API_KEY,
        apiUri: env.NYLAS_API_URI,
      });

      // Prepare attachments
      // The SDK automatically uses multipart/form-data when total payload size >= 3MB
      // This fixes the bug where Lambda would freeze with 2+ attachments over 3MB total
      const attachments = files.map((file) => ({
        filename: file.filename,
        contentType: file.contentType,
        content: file.content,
        size: file.size,
      }));

      // Calculate total size for logging
      const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);
      const threeMB = 3 * 1024 * 1024;

      console.log(
        `Sending email with ${attachments.length} attachment(s), total size: ${totalSize} bytes (${totalSize >= threeMB ? '>= 3MB, will use multipart/form-data' : '< 3MB, will use JSON'})`
      );

      // Prepare the email request
      const sendRequest: SendMessageRequest = {
        to: [{ email: recipientEmail }],
        subject: subject,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email from AWS Lambda</h2>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">
              This email was sent from an AWS Lambda function using the Nylas SDK.<br>
              Attachments: <strong>${attachments.length}</strong> file(s) (${(totalSize / 1024 / 1024).toFixed(2)} MB total)
            </p>
          </div>
        `,
        attachments,
      };

      // Send the email using the Nylas SDK
      // The SDK automatically handles the 3MB threshold:
      // - If total payload < 3MB: uses JSON encoding
      // - If total payload >= 3MB: uses multipart/form-data encoding
      // This prevents Lambda from freezing with large attachments
      const response = await nylas.messages.send({
        identifier: env.NYLAS_GRANT_ID,
        requestBody: sendRequest,
      });

      console.log('Nylas API response received:', {
        hasResponse: !!response,
        hasData: !!response?.data,
        responseKeys: response ? Object.keys(response) : [],
        dataKeys: response?.data ? Object.keys(response.data) : [],
        messageId: response?.data?.id,
      });

      // Extract message ID safely (response.data is the Message object)
      const messageId = response?.data?.id || 'unknown';

      // Return success response
      const successResponse = {
        success: true,
        messageId: messageId,
        message: 'Email sent successfully',
        attachmentsCount: attachments.length,
        totalSize: totalSize,
      };

      console.log('Returning success response:', successResponse);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        body: JSON.stringify(successResponse),
      };
      } catch (error) {
        console.error('Error sending email:', error);

        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
          body: JSON.stringify({
            error:
              error instanceof Error ? error.message : 'Unknown error occurred',
          }),
        };
      }
    }

    // 404 for other routes
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not Found' }),
    };
  } catch (error) {
    console.error('Unhandled error in handler:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : String(error),
      }),
    };
  }
};

// With --format=cjs, esbuild will convert "export const handler" to "exports.handler = handler"
// This is the correct format for Lambda handlers
// No need for additional exports - esbuild handles the CommonJS conversion
