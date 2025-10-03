# CommonJS-Only Nylas SDK Example

This example demonstrates how to use the Nylas Node.js SDK in a pure CommonJS (CJS) environment without ES module syntax.

## Purpose

- Shows CommonJS `require()` syntax with the Nylas SDK
- Demonstrates environment variable handling in CommonJS
- Provides a simple messages listing example
- Serves as a reference for projects that must use CommonJS

## Key Differences from ESM

This example showcases the CommonJS equivalent of the ESM-only example:

| ESM Syntax                     | CommonJS Syntax                    |
| ------------------------------ | ---------------------------------- |
| `import Nylas from 'nylas'`    | `const Nylas = require('nylas')`   |
| `import dotenv from 'dotenv'`  | `const dotenv = require('dotenv')` |
| `import path from 'node:path'` | `const path = require('path')`     |
| `import.meta.dirname`          | `__dirname`                        |
| `export { logger }`            | `module.exports = { logger }`      |

## Setup

1. **Install dependencies:**

   ```bash
   cd examples/cjs-only
   npm install
   ```

2. **Set up environment variables:**

   - Copy `examples/.env.example` to `examples/.env`
   - Fill in your `NYLAS_API_KEY` and `NYLAS_GRANT_ID`

3. **Run the example:**
   ```bash
   npm start
   # or
   node index.js
   ```

## Requirements

- Node.js (any version - CommonJS is supported in all Node.js versions)
- Valid Nylas API credentials
- A grant with message access permissions

## What This Example Does

1. Loads environment variables using `dotenv`
2. Validates required API credentials
3. Initializes the Nylas client
4. Lists messages from the specified grant
5. Logs the results with proper error handling

## File Structure

```
cjs-only/
├── index.js          # Main example file (CommonJS)
├── package.json      # Package configuration (no "type": "module")
├── utils/
│   └── logger.js     # Logger utility (CommonJS exports)
└── README.md         # This file
```

## Troubleshooting

- **"NYLAS_API_KEY environment variable is not set"**: Make sure you've created the `.env` file in the `examples/` directory with your API key
- **"NYLAS_GRANT_ID environment variable is not set"**: Add your grant ID to the `.env` file
- **Module not found errors**: Run `npm install` to install dependencies
- **Permission errors**: Ensure your API key and grant have the necessary permissions to list messages

## Related Examples

- `../esm-only/` - ESM version of this same example
- `../messages/` - More comprehensive message handling examples
