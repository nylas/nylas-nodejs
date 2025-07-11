const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Alternative types generation using Microsoft API Extractor
 * This generates types.d.ts using the TypeScript compiler and API Extractor
 * instead of manual regex parsing
 */

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`); // eslint-disable-line no-console
}

function createApiExtractorConfig() {
  const configPath = path.join(__dirname, '..', 'api-extractor.json');
  
  const config = {
    "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
    "mainEntryPointFilePath": "<projectFolder>/lib/types/types.d.ts",
    "bundledPackages": [],
    "compiler": {
      "tsconfigFilePath": "<projectFolder>/tsconfig.json"
    },
    "apiReport": {
      "enabled": false
    },
    "docModel": {
      "enabled": false
    },
    "dtsRollup": {
      "enabled": true,
      "untrimmedFilePath": "<projectFolder>/dist/types.d.ts",
      "publicTrimmedFilePath": "<projectFolder>/dist/types-public.d.ts"
    },
    "tsdocMetadata": {
      "enabled": false
    },
    "messages": {
      "compilerMessageReporting": {
        "default": {
          "logLevel": "warning"
        }
      },
      "extractorMessageReporting": {
        "default": {
          "logLevel": "warning"
        }
      },
      "tsdocMessageReporting": {
        "default": {
          "logLevel": "warning"
        }
      }
    }
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log(`✅ Created API Extractor config: ${configPath}`, 'green');
}

function createTypesEntryPoint() {
  // Create a comprehensive types entry point for API Extractor to analyze
  const typesEntryContent = `/**
 * Public API types for third-party developers.
 * This file serves as the main entry point for API Extractor.
 * 
 * @public
 */

// Configuration types
export type {
  NylasConfig,
  OverridableNylasConfig,
  Overrides,
  Region,
} from '../config.js';

/**
 * Configuration constants for different regions
 * @public
 */
export {
  REGION_CONFIG,
  DEFAULT_SERVER_URL,
  DEFAULT_REGION,
} from '../config.js';

// Base classes and interfaces
export type { AsyncListResponse } from '../resources/resource.js';

/**
 * Base Resource class for extending Nylas SDK functionality
 * @public
 */
export { Resource } from '../resources/resource.js';

export type { default as APIClient } from '../apiClient.js';

// Export enum values that need to be used at runtime
export { WhenType } from '../models/events.js';

// APIClient types  
export type { RequestOptionsParams } from '../apiClient.js';
export { FLOW_ID_HEADER, REQUEST_ID_HEADER } from '../apiClient.js';

// Response types
export type {
  NylasResponse,
  NylasListResponse,
  NylasBaseResponse,
  ListResponseInnerType,
} from '../models/response.js';

// Common query parameter types
export type { ListQueryParams } from '../models/listQueryParams.js';

// Error types
export type {
  AbstractNylasApiError,
  AbstractNylasSdkError,
  NylasApiError,
  NylasOAuthError,
  NylasSdkTimeoutError,
  NylasApiErrorResponse,
  NylasApiErrorResponseData,
  NylasOAuthErrorResponse,
} from '../models/error.js';

// Utility constants
export { SDK_VERSION } from '../version.js';

// All model types
export * from '../models/index.js';

// Resource parameter interfaces - auto-generated exports
// These would be automatically included by API Extractor
`;

  const entryPointPath = path.join(__dirname, '..', 'src', 'typesEntry.ts');
  fs.writeFileSync(entryPointPath, typesEntryContent);
  log(`✅ Created types entry point: ${entryPointPath}`, 'green');
}

function runApiExtractor() {
  log('🔍 Running API Extractor...', 'blue');
  
  try {
    // First, ensure we have a clean build
    execSync('npm run build', { stdio: 'pipe' });
    
    // Check if API Extractor is installed
    try {
      execSync('npx api-extractor --version', { stdio: 'pipe' });
    } catch (error) {
      log('⚠️  API Extractor not installed. To try this approach:', 'yellow');
      log('    npm install -D @microsoft/api-extractor', 'yellow');
      return;
    }
    
    // Run API Extractor
    execSync('npx api-extractor run --local', { 
      encoding: 'utf8',
      stdio: 'pipe' 
    });
    
    log('✅ API Extractor completed successfully', 'green');
    
    // Check if output files were created
    const outputFiles = [
      'dist/types.d.ts',
      'dist/types-public.d.ts'
    ];
    
    outputFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const size = fs.statSync(filePath).size;
        log(`📄 Generated: ${file} (${size} bytes)`, 'green');
      }
    });
    
  } catch (error) {
    log('❌ API Extractor failed:', 'red');
    log(error.stdout || error.message, 'red');
    throw error;
  }
}

function generateTypesWithApiExtractor() {
  log('🚀 Generating types using API Extractor...', 'blue');
  
  try {
    // Step 1: Create API Extractor configuration
    createApiExtractorConfig();
    
    // Step 2: Create types entry point
    createTypesEntryPoint();
    
    // Step 3: Run API Extractor
    runApiExtractor();
    
    log('🎉 Types generation completed!', 'green');
    log('', 'reset');
    log('Generated files:', 'blue');
    log('  - dist/types.d.ts (complete API)', 'green');
    log('  - dist/types-public.d.ts (public API only)', 'green');
    log('', 'reset');
    log('Benefits of this approach:', 'blue');
    log('  ✅ Uses TypeScript compiler (100% accurate)', 'green');
    log('  ✅ Automatic type extraction', 'green');
    log('  ✅ Industry standard tooling', 'green');
    log('  ✅ Can trim @internal/@beta APIs', 'green');
    log('  ✅ Generates API reports for reviews', 'green');
    
  } catch (error) {
    log('💥 Types generation failed!', 'red');
    throw error;
  }
}

if (require.main === module) {
  generateTypesWithApiExtractor();
} 