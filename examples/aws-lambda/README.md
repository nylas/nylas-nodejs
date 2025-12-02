# Nylas AWS Lambda - Email Attachments Example

This example demonstrates how to use the Nylas SDK in an AWS Lambda function to send email attachments. It provides a simple web interface for uploading multiple files and sending them as email attachments.

## 🎯 Purpose

This example serves two main purposes:

1. **Demonstrate Nylas SDK usage in AWS Lambda** - Shows how to integrate the Nylas SDK in a serverless AWS Lambda environment
2. **Prove bug fix** - Demonstrates that the previously reported bug ("Node.js SDK v7.9.0-7.13.3: Lambda freezes when sending emails with 2+ attachments over 3MB total") has been fixed

## 🚀 Features

- **Simple Web UI**: Drag & drop or click to upload multiple files
- **Multiple File Support**: Test sending 2+ attachments simultaneously
- **Size Tracking**: Visual indicator when total attachment size exceeds 3MB
- **Automatic Encoding**: SDK automatically switches between JSON and multipart/form-data based on payload size
- **Real-time Feedback**: Loading states and success/error messages
- **Serverless**: Runs on AWS Lambda with API Gateway

## 📋 Prerequisites

Before getting started, you'll need:

1. **Nylas Account**: [Sign up for free](https://dashboard.nylas.com/register)
2. **AWS Account**: [Sign up for free](https://aws.amazon.com/free/)
3. **Node.js**: Version 16 or higher
4. **Nylas Application**: Created in your Nylas Dashboard
5. **Connected Email Account**: At least one email account connected to your Nylas application
6. **AWS CLI**: [Install AWS CLI](https://aws.amazon.com/cli/) (optional, but recommended)
7. **Serverless Framework**: Will be installed via npm

## 🛠️ Quick Start

### Option 1: Interactive Setup (Recommended)

The easiest way to get started is using the interactive setup CLI:

```bash
# Navigate to the aws-lambda directory
cd examples/aws-lambda

# Run the interactive setup
npm run setup
```

This will:
- Check prerequisites (Node.js, npm, AWS CLI, Serverless Framework)
- Guide you through Nylas credentials setup
- Help configure AWS credentials
- Create `.env` file with your configuration
- Optionally deploy to AWS Lambda immediately

### Option 2: Manual Setup

#### 1. Install Dependencies

```bash
cd examples/aws-lambda
npm install
```

#### 2. Configure Environment Variables

Create a `.env` file in the `aws-lambda` directory:

```bash
NYLAS_API_KEY=your_nylas_api_key_here
NYLAS_API_URI=https://api.us.nylas.com
NYLAS_GRANT_ID=your_grant_id_here
```

**How to get these values:**

- **NYLAS_API_KEY**: Found in your [Nylas Dashboard](https://dashboard.nylas.com/applications) under your application settings
- **NYLAS_GRANT_ID**: The ID of a connected email account (found in Dashboard > Grants)
- **NYLAS_API_URI**: Use `https://api.us.nylas.com` for US region, or your specific region's API URL

#### 3. Configure AWS Credentials

Set up AWS credentials using one of these methods:

**Option A: AWS CLI (Recommended)**
```bash
aws configure
```

**Option B: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

**Option C: AWS Credentials File**
Create `~/.aws/credentials`:
```ini
[default]
aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key
```

#### 4. Deploy to AWS Lambda

```bash
npm run deploy
```

This will:
- Build your Lambda function using esbuild
- Upload it to AWS Lambda
- Create an API Gateway endpoint
- Display your function URL

#### 5. Test the Application

1. Visit the API Gateway URL displayed after deployment
2. Fill in the email form:
   - **Recipient Email**: Enter a valid email address
   - **Subject**: Enter an email subject
   - **Message**: Enter your message content
   - **Attachments**: Upload multiple files (try files totaling over 3MB to test the bug fix)
3. Click "Send Email with Attachments"
4. Check the recipient's inbox for the email

## 📚 How It Works

### Architecture

```
User Browser → API Gateway → AWS Lambda → Nylas API → Email Provider
```

1. **File Upload**: User uploads files through the web interface
2. **API Gateway**: Receives HTTP request and forwards to Lambda
3. **Lambda Handler**: Processes multipart form data and prepares attachments
4. **Nylas SDK**: Automatically handles encoding based on payload size
5. **Email Sending**: Nylas SDK sends email with attachments
6. **Response**: User receives confirmation or error message

### Bug Fix Demonstration

The SDK automatically handles large attachments by switching encoding methods:

- **< 3MB total**: Uses JSON encoding (faster, simpler)
- **≥ 3MB total**: Uses multipart/form-data encoding (handles large files)

This prevents Lambda from freezing when sending multiple attachments over 3MB total. The web interface shows a warning indicator when the total size exceeds 3MB.

### Key Implementation Details

**Lambda Handler** (`src/handler.ts`):
- Handles API Gateway events
- Parses multipart form data from API Gateway (basic implementation)
- Uses Buffer attachments (optimal for Lambda)
- Automatically leverages SDK's 3MB threshold handling

**Note on Multipart Parsing**: The example includes a basic multipart parser for simplicity. For production use with large files or complex requirements, consider using a library like `lambda-multipart-parser` or `busboy` for more robust parsing.

**SDK Integration**:
```typescript
// The SDK automatically chooses encoding based on total payload size
const response = await nylas.messages.send({
  identifier: env.NYLAS_GRANT_ID,
  requestBody: sendRequest,
});
```

The SDK checks `calculateTotalPayloadSize()` internally and switches to multipart/form-data when needed (see `src/resources/messages.ts` in the SDK).

## 🔧 Configuration

### Serverless Framework (`serverless.yml`)

Key configuration options:

- **Memory**: 512MB (adjustable for larger files)
- **Timeout**: 30 seconds (increase for very large attachments)
- **Runtime**: Node.js 20.x
- **Region**: us-east-1 (changeable)

To modify these settings, edit `serverless.yml`:

```yaml
provider:
  memorySize: 1024  # Increase for larger files
  timeout: 60       # Increase timeout
  region: eu-west-1  # Change region
```

### Environment Variables

You can also set environment variables in `serverless.yml`:

```yaml
provider:
  environment:
    NYLAS_API_KEY: ${env:NYLAS_API_KEY}
    NYLAS_API_URI: ${env:NYLAS_API_URI}
    NYLAS_GRANT_ID: ${env:NYLAS_GRANT_ID}
```

Or use AWS Systems Manager Parameter Store:

```yaml
provider:
  environment:
    NYLAS_API_KEY: ${ssm:/nylas/api-key}
    NYLAS_GRANT_ID: ${ssm:/nylas/grant-id}
```

## 🐛 Troubleshooting

### Common Issues

**Error: "Missing required environment variables"**
- Ensure `.env` file exists with all required variables
- Check that variables are set correctly (no extra spaces)
- For production, ensure environment variables are set in AWS Lambda console

**Error: "AWS credentials not configured"**
- Run `aws configure` to set up credentials
- Or set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables
- Or create `~/.aws/credentials` file manually

**Error: "Serverless Framework not found"**
- Run `npm install` to install dependencies
- Use `npx serverless` instead of `serverless` if not installed globally

**Error: "Lambda timeout"**
- Increase timeout in `serverless.yml` (default: 30 seconds)
- For very large files, consider increasing memory as well

**Error: "File upload fails"**
- Check API Gateway payload size limits (10MB default)
- Ensure multipart/form-data is being sent correctly
- Check Lambda logs: `npm run logs`

**Email not received**
- Verify the recipient email address
- Check spam/junk folders
- Verify your Nylas grant has send permissions
- Check Nylas Dashboard for any API errors

**Lambda freezes with large attachments**
- This bug was fixed in SDK v7.13.4+
- Ensure you're using the latest SDK version
- The SDK automatically uses multipart/form-data for payloads ≥ 3MB

**Error: "Cannot find module 'index'"**
- This usually means the handler setting is incorrect
- Verify the handler is set to exactly: `handler.handler` (not `index.handler` or `handler`)
- The handler format is: `filename.functionName`
- For this example: file is `handler.js`, function is `handler`, so handler = `handler.handler`
- Check Lambda Configuration → Runtime settings → Handler
- Rebuild and re-upload the zip file if you changed the handler code

### Debug Mode

View Lambda logs in real-time:

```bash
npm run logs
```

Or check logs in AWS Console:
1. Go to AWS Lambda Console
2. Select your function
3. Click "Monitor" tab
4. View CloudWatch Logs

Add logging to the handler for debugging:

```typescript
console.log('File details:', {
  count: files.length,
  totalSize: totalSize,
  files: files.map(f => ({ name: f.filename, size: f.size }))
});
```

## 📖 Related Examples

- **Cloudflare Workers**: See `../edge-environment/` for a Cloudflare Workers example
- **Local Attachment Examples**: See `../messages/examples/` for Node.js examples
- **Nylas SDK Documentation**: [https://developer.nylas.com](https://developer.nylas.com)
- **AWS Lambda Docs**: [https://docs.aws.amazon.com/lambda/](https://docs.aws.amazon.com/lambda/)
- **Serverless Framework Docs**: [https://www.serverless.com/framework/docs](https://www.serverless.com/framework/docs)

## 📦 Manual Upload via AWS Console

If you prefer to upload the Lambda function manually through the AWS Console instead of using Serverless Framework:

### 1. Build the Deployment Package

```bash
npm run build:manual
```

This will:
- Install production dependencies
- Bundle your code with esbuild
- Create a `lambda-package.zip` file ready for upload

### 2. Upload to AWS Lambda Console

1. **Go to AWS Lambda Console**
   - Navigate to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
   - Select your region (e.g., us-west-1)

2. **Create or Select a Function**
   - Click "Create function" or select an existing function
   - Choose "Author from scratch"
   - Function name: `nylas-attachment-sender` (or your preferred name)
   - Runtime: **Node.js 20.x**
   - Architecture: x86_64

3. **Upload the Package**
   - In the function's "Code" tab, click "Upload from" → ".zip file"
   - Select the `lambda-package.zip` file created in step 1
   - Click "Save"

4. **Configure the Handler**
   - In the "Runtime settings" section, click "Edit"
   - Set Handler to: `handler.handler`
   - Click "Save"

5. **Set Environment Variables**
   - Go to the "Configuration" tab → "Environment variables"
   - Click "Edit" → "Add environment variable"
   - Add the following:
     - `NYLAS_API_KEY`: Your Nylas API key
     - `NYLAS_GRANT_ID`: Your Nylas Grant ID
     - `NYLAS_API_URI`: `https://api.us.nylas.com` (or your region's API URI)
   - Click "Save"

6. **Configure Function Settings**
   - Go to "Configuration" → "General configuration" → "Edit"
   - Memory: 512 MB (or higher for larger files)
   - Timeout: 30 seconds (or higher for larger files)
   - Click "Save"

7. **Create API Gateway HTTP API**
   - Go to [API Gateway Console](https://console.aws.amazon.com/apigateway/)
   - Click "Create API" → "HTTP API" → "Build"
   - Click "Add integration"
   - Integration type: Lambda
   - Lambda function: Select your function name
   - API name: `nylas-attachment-api` (or your preferred name)
   - Click "Next" → "Create"

8. **Configure Routes**
   - In your API, go to "Routes"
   - Create the following routes (all pointing to your Lambda function):
     - **GET /** → Lambda function (serves the HTML interface)
     - **POST /send-attachment** → Lambda function (handles file uploads)
     - **OPTIONS /{proxy+}** → Lambda function (for CORS preflight requests)
     - **ANY /{proxy+}** → Lambda function (catch-all for other routes, returns 404)
   - For each route:
     - Click "Create" → Enter the path and method
     - Select your Lambda function as the integration target
     - Click "Create"

9. **Enable CORS (if not already configured)**
   - The Lambda function returns CORS headers, but you may want to configure CORS in API Gateway as well
   - Go to "CORS" in your API settings
   - Or ensure your Lambda function returns the appropriate CORS headers (already implemented)

9. **Test Your Function**
   - Copy the API Gateway endpoint URL
   - Visit it in your browser to see the upload interface
   - Test uploading files and sending emails

### Notes for Manual Upload

- The zip file includes all production dependencies bundled
- Handler must be set to `handler.handler` (file: `handler.js`, function: `handler`)
- Ensure environment variables are set correctly
- API Gateway timeout should be at least 30 seconds for large attachments
- Consider increasing Lambda memory (1024 MB) for very large files (>10MB)

## 🧹 Cleanup

To remove the deployed Lambda function and API Gateway:

**If using Serverless Framework:**
```bash
npm run remove
```

This will delete:
- Lambda function
- API Gateway
- IAM roles and policies
- CloudWatch log groups

**If uploaded manually:**
- Delete the Lambda function from the Lambda Console
- Delete the API Gateway from the API Gateway Console
- Delete any associated IAM roles and CloudWatch log groups

## 📄 License

This example is part of the Nylas Node.js SDK and is licensed under the MIT License.

