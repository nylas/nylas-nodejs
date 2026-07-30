# Nylas Messages Examples

This directory contains examples demonstrating how to work with messages using the Nylas Node.js SDK.

## Examples

### Send Attachments (`send-attachments-cli.ts`) 
**🎯 Core attachment examples with optional CLI interface**

This file demonstrates the four main ways to send attachments with the Nylas SDK:

1. **File Path Attachments** - Most common and efficient approach
2. **Stream Attachments** - For more control over streams  
3. **Buffer Attachments** - When you need to process content in memory
4. **String Content Attachments** - For dynamically generated text content

The file is structured with:
- **Core examples at the top** - Focus on Nylas SDK integration
- **CLI interface at the bottom** - Optional interactive/batch modes

### Basic Messages (`messages.ts`)
Shows basic message operations including reading, sending, and drafting messages.

### Custom tracking hostnames

Set `trackingOptions.domainName` to an active custom hostname owned by your
organization. At least one of `links` or `opens` must be enabled. Omit
`domainName` to keep using the default Nylas tracking hostname.

#### Regular Send

```ts
await nylas.messages.send({
  identifier: grantId,
  requestBody: {
    to: [{ email: 'recipient@example.com' }],
    subject: 'Your update',
    body: '<a href="https://example.com">View update</a>',
    trackingOptions: {
      links: true,
      opens: true,
      domainName: 'links.example.com',
    },
  },
});
```

#### Transactional Send

The top-level `domainName` is the verified sender domain used by the route. The
nested `trackingOptions.domainName` is the tracking hostname used in recipient-
visible links and open pixels.

```ts
await nylas.transactionalSend.send({
  domainName: 'sender.example.com',
  requestBody: {
    from: [{ email: 'billing@sender.example.com' }],
    to: [{ email: 'recipient@example.com' }],
    subject: 'Your receipt',
    body: '<a href="https://example.com/receipt">View receipt</a>',
    trackingOptions: {
      links: true,
      opens: true,
      domainName: 'links.example.com',
    },
  },
});
```

#### Drafts

```ts
const draft = await nylas.drafts.create({
  identifier: grantId,
  requestBody: {
    to: [{ email: 'recipient@example.com' }],
    subject: 'Draft update',
    body: '<a href="https://example.com">View update</a>',
    trackingOptions: {
      links: true,
      opens: true,
      domainName: 'links.example.com',
    },
  },
});

await nylas.drafts.update({
  identifier: grantId,
  draftId: draft.data.id,
  requestBody: {
    subject: 'Updated draft subject',
    // Omit trackingOptions to preserve the draft's existing tracking settings.
  },
});
```

#### Scheduled Send

```ts
await nylas.messages.send({
  identifier: grantId,
  requestBody: {
    to: [{ email: 'recipient@example.com' }],
    subject: 'Scheduled update',
    body: '<a href="https://example.com">View update</a>',
    sendAt: Math.floor(Date.now() / 1000) + 3600,
    trackingOptions: {
      links: true,
      opens: true,
      domainName: 'links.example.com',
    },
  },
});
```

### Accessing Rate Limit Headers
All SDK responses now expose a non-enumerable `rawHeaders` with dashed lowercase keys so you can read rate limit information:

```ts
const res = await nylas.messages.list({ identifier: process.env.NYLAS_GRANT_ID!, queryParams: { limit: 1 } });
const limit = res.rawHeaders?.['x-rate-limit-limit'];
const remaining = res.rawHeaders?.['x-rate-limit-remaining'];
```

## Quick Start

### 1. Set up environment
Create a `.env` file in the `examples` directory:
```bash
NYLAS_API_KEY=your_api_key_here
NYLAS_GRANT_ID=your_grant_id_here
TEST_EMAIL=recipient@example.com  # Optional: for testing message sending
NYLAS_API_URI=https://api.us.nylas.com  # Optional: defaults to US API
```

### 2. Install dependencies
```bash
cd examples
npm install
```

### 3. Ensure test files exist
The examples expect test files in the `attachments/` subdirectory:
- `test-small-26B.txt` (small text file)
- `test-image-19KB.jpg` (small image)
- `test-document-12MB.pdf` (large PDF)
- `test-image-10MB.jpg` (large image)

### 4. Run the examples

**Attachment examples (interactive mode):**
```bash
npm run send-attachments
```

**Attachment examples (batch mode):**
```bash
npm run send-attachments small --format file --email test@example.com
npm run send-attachments large --format stream --email test@example.com
```

**Basic messages:**
```bash
npm run messages
```

## Understanding Attachment Methods

The core examples demonstrate four different approaches to sending attachments:

### 1. File Path Method (Recommended)
```typescript
const attachment = createFileRequestBuilder('test-image.jpg');
```
- Most efficient and common approach
- Uses streams internally for memory efficiency
- Perfect for files on disk

### 2. Stream Method
```typescript
const attachment = {
  filename: 'file.jpg',
  contentType: 'image/jpeg',
  content: fs.createReadStream('path/to/file.jpg'),
  size: fileSize
};
```
- Good when you already have a stream
- Useful for processing files from other sources
- Memory efficient for large files

### 3. Buffer Method
```typescript
const attachment = {
  filename: 'file.jpg',
  contentType: 'image/jpeg',
  content: fs.readFileSync('path/to/file.jpg'),
  size: buffer.length
};
```
- Loads entire file into memory
- Good for small files or when you need to process content
- Simple but uses more memory

### 4. String Content Method
```typescript
const attachment = {
  filename: 'data.txt',
  contentType: 'text/plain',
  content: 'Your text content here',
  size: Buffer.byteLength(content, 'utf8')
};
```
- Perfect for dynamically generated content
- Works for text files, JSON, XML, etc.
- Great for reports, logs, or generated data

## File Structure

```
messages/
├── send-attachments-cli.ts      # 🎯 Attachment examples + CLI tool
├── utils/
│   └── attachment-file-manager.ts # File utilities (extracted for reusability)
├── attachments/                 # Test files directory
│   ├── test-small-26B.txt
│   ├── test-image-19KB.jpg
│   ├── test-document-12MB.pdf
│   └── test-image-10MB.jpg
├── messages.ts                  # Basic message operations
└── README.md                    # This file
```

## CLI Tool Features

The attachment examples include an optional CLI interface for easy testing:

- **Interactive Mode**: Guided prompts for choosing examples
- **Batch Mode**: Non-interactive commands for automation
- **File Status Checking**: Verify test files are available
- **Multiple Formats**: Test all attachment processing methods

**Interactive mode (default):**
```bash
npm run send-attachments
```

**Batch mode examples:**
```bash
npm run send-attachments small --format stream --email test@example.com
npm run send-attachments large --format buffer --email test@example.com
npm run send-attachments status  # Check file availability
```

## Best Practices

1. **Use file paths** for most cases - it's the most efficient method
2. **Use streams** when working with large files or when you already have streams
3. **Use buffers** for small files when you need to process the content
4. **Use strings** for dynamically generated text content
5. **Always handle errors** appropriately with try/catch blocks
6. **Check file existence** before creating attachments from file paths

## Troubleshooting

**"File not found" errors:**
- Ensure test files exist in the `attachments/` directory
- Run `npm run send-attachments-cli status` to check file availability

**"Environment variable not set" errors:**
- Create a `.env` file in the `examples` directory with required variables
- See the environment setup section above

**TypeScript import errors:**
- Ensure you've run `npm install` in the examples directory
- The utils are properly exported from the attachment-file-manager module
