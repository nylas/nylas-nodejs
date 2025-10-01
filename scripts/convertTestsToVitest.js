#!/usr/bin/env node

const fs = require('fs');

// Test files to convert
const testFiles = [
  'tests/apiClient.spec.ts',
  'tests/nylas.spec.ts',
  'tests/utils.spec.ts',
  'tests/utils/fetchWrapper.spec.ts',
  'tests/utils/fetchWrapper-esm.spec.ts',
  'tests/utils/fetchWrapper-cjs.spec.ts',
  'tests/resources/applications.spec.ts',
  'tests/resources/attachments.spec.ts',
  'tests/resources/auth.spec.ts',
  'tests/resources/bookings.spec.ts',
  'tests/resources/calendars.spec.ts',
  'tests/resources/contacts.spec.ts',
  'tests/resources/credentials.spec.ts',
  'tests/resources/drafts.spec.ts',
  'tests/resources/events.spec.ts',
  'tests/resources/folders.spec.ts',
  'tests/resources/grants.spec.ts',
  'tests/resources/messages.spec.ts',
  'tests/resources/notetakers.spec.ts',
  'tests/resources/redirectUris.spec.ts',
  'tests/resources/sessions.spec.ts',
  'tests/resources/smartCompose.spec.ts',
  'tests/resources/threads.spec.ts',
  'tests/resources/webhooks.spec.ts',
  'tests/resources/configurations.spec.ts',
];

// Patterns to replace
const replacements = [
  // Import statements
  {
    pattern: /import\s+{\s*([^}]+)\s*}\s+from\s+['"]jest['"];?/g,
    replacement: "import { $1 } from 'vitest';",
  },
  {
    pattern: /import\s+fetchMock\s+from\s+['"]jest-fetch-mock['"];?/g,
    replacement: '// fetchMock removed - using global fetch mock',
  },
  {
    pattern:
      /import\s+{\s*enableFetchMocks\s*}\s+from\s+['"]jest-fetch-mock['"];?/g,
    replacement: '// enableFetchMocks removed - using global fetch mock',
  },

  // Jest globals (if not imported)
  {
    pattern: /^describe\(/gm,
    replacement:
      "import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll, vi } from 'vitest';\n\ndescribe(",
  },

  // Mock functions
  {
    pattern: /jest\.fn\(\)/g,
    replacement: 'vi.fn()',
  },
  {
    pattern: /jest\.mock\(/g,
    replacement: 'vi.mock(',
  },
  {
    pattern: /jest\.spyOn\(/g,
    replacement: 'vi.spyOn(',
  },
  {
    pattern: /jest\.clearAllMocks\(\)/g,
    replacement: 'vi.clearAllMocks()',
  },
  {
    pattern: /jest\.resetAllMocks\(\)/g,
    replacement: 'vi.resetAllMocks()',
  },
  {
    pattern: /jest\.restoreAllMocks\(\)/g,
    replacement: 'vi.restoreAllMocks()',
  },

  // Mock types
  {
    pattern: /jest\.Mocked<([^>]+)>/g,
    replacement: 'any',
  },

  // Fetch mock calls
  {
    pattern: /fetchMock\.resetMocks\(\)/g,
    replacement: 'vi.clearAllMocks()',
  },
  {
    pattern: /fetchMock\.mockResolvedValueOnce\(/g,
    replacement: 'vi.mocked(fetch).mockResolvedValueOnce(',
  },
  {
    pattern: /fetchMock\.mockResolvedValue\(/g,
    replacement: 'vi.mocked(fetch).mockResolvedValue(',
  },
  {
    pattern: /fetchMock\.mockRejectedValueOnce\(/g,
    replacement: 'vi.mocked(fetch).mockRejectedValueOnce(',
  },
  {
    pattern: /fetchMock\.mockRejectedValue\(/g,
    replacement: 'vi.mocked(fetch).mockRejectedValue(',
  },
  {
    pattern: /fetchMock\.mockImplementation\(/g,
    replacement: 'vi.mocked(fetch).mockImplementation(',
  },
  {
    pattern: /fetchMock\.mockImplementationOnce\(/g,
    replacement: 'vi.mocked(fetch).mockImplementationOnce(',
  },

  // Remove jest-fetch-mock specific calls
  {
    pattern: /fetchMock\.enableMocks\(\);?/g,
    replacement: '',
  },
  {
    pattern: /fetchMock\.disableMocks\(\);?/g,
    replacement: '',
  },
];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function convertFile(filePath) {
  if (!fs.existsSync(filePath)) {
    // eslint-disable-next-line no-console
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`Converting ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');

  // Apply all replacements
  replacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });

  // Clean up any remaining jest references that might have been missed
  content = content.replace(/jest\./g, 'vi.');

  // Write the converted file
  fs.writeFileSync(filePath, content);
  // eslint-disable-next-line no-console
  console.log(`✓ Converted ${filePath}`);
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function main() {
  // eslint-disable-next-line no-console
  console.log(`Found ${testFiles.length} test files to convert:`);
  // eslint-disable-next-line no-console
  testFiles.forEach((file) => console.log(`  - ${file}`));
  // eslint-disable-next-line no-console
  console.log('');

  testFiles.forEach(convertFile);

  // eslint-disable-next-line no-console
  console.log('\n✅ All test files converted to Vitest!');
}

if (require.main === module) {
  main();
}

module.exports = { convertFile, replacements };
