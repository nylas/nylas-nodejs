import dotenv from 'dotenv';
import path from 'path';
import * as process from 'process';
import Nylas, {
  Folder,
  NylasResponse,
  NylasListResponse,
  NylasApiError,
  ListFolderQueryParams
} from 'nylas';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const NYLAS_API_KEY = process.env.NYLAS_API_KEY;
const NYLAS_GRANT_ID = process.env.NYLAS_GRANT_ID;

if (!NYLAS_API_KEY) {
  console.error('NYLAS_API_KEY is required. Please add it to your .env file.');
  process.exit(1);
}

if (!NYLAS_GRANT_ID) {
  console.error('NYLAS_GRANT_ID is required. Please add it to your .env file.');
  process.exit(1);
}

async function listFoldersExample() {
  try {
    // Initialize Nylas client
    const nylas = new Nylas({
      apiKey: NYLAS_API_KEY!,
      apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
    });

    console.log('=== Nylas Folders API Demo ===\n');

    // 1. List all folders (default behavior - multi-level hierarchy)
    console.log('1. Listing all folders (multi-level hierarchy):');
    const allFolders: NylasListResponse<Folder> = await nylas.folders.list({
      identifier: NYLAS_GRANT_ID!,
      queryParams: {}
    });

    console.log(`Found ${allFolders.data.length} folders total:`);
    allFolders.data.forEach((folder, index) => {
      console.log(`  ${index + 1}. ${folder.name} (ID: ${folder.id})`);
      if (folder.parentId) {
        console.log(`     └─ Parent ID: ${folder.parentId}`);
      }
      if (folder.childCount !== undefined) {
        console.log(`     └─ Child Count: ${folder.childCount}`);
      }
    });
    console.log();

    // 2. List folders with single-level hierarchy (Microsoft only)
    console.log('2. Listing folders with single-level hierarchy (Microsoft only):');
    const singleLevelFolders: NylasListResponse<Folder> = await nylas.folders.list({
      identifier: NYLAS_GRANT_ID!,
      queryParams: {
        singleLevel: true
      } as any
    });

    console.log(`Found ${singleLevelFolders.data.length} folders at single level:`);
    singleLevelFolders.data.forEach((folder, index) => {
      console.log(`  ${index + 1}. ${folder.name} (ID: ${folder.id})`);
      if (folder.parentId) {
        console.log(`     └─ Parent ID: ${folder.parentId}`);
      }
    });
    console.log();

    // 3. List folders with both singleLevel and parentId parameters
    const rootFolders = allFolders.data.filter(folder => !folder.parentId);
    if (rootFolders.length > 0) {
      const rootFolder = rootFolders[0];
      console.log(`3. Listing child folders of "${rootFolder.name}" with single-level hierarchy:`);
      
      const childFolders: NylasListResponse<Folder> = await nylas.folders.list({
        identifier: NYLAS_GRANT_ID!,
        queryParams: {
          parentId: rootFolder.id,
          singleLevel: true
        } as any
      });

      console.log(`Found ${childFolders.data.length} direct child folders:`);
      childFolders.data.forEach((folder, index) => {
        console.log(`  ${index + 1}. ${folder.name} (ID: ${folder.id})`);
      });
    } else {
      console.log('3. No root folders found to demonstrate parentId + singleLevel combination.');
    }
    console.log();

    // 4. Compare single-level vs multi-level for the same parent
    if (rootFolders.length > 0) {
      const rootFolder = rootFolders[0];
      console.log('4. Comparing single-level vs multi-level hierarchy:');
      
      // Multi-level (default)
      const multiLevelChildren: NylasListResponse<Folder> = await nylas.folders.list({
        identifier: NYLAS_GRANT_ID!,
        queryParams: {
          parentId: rootFolder.id,
          singleLevel: false // explicit false
        } as any
      });

      // Single-level
      const singleLevelChildren: NylasListResponse<Folder> = await nylas.folders.list({
        identifier: NYLAS_GRANT_ID!,
        queryParams: {
          parentId: rootFolder.id,
          singleLevel: true
        } as any
      });

      console.log(`Multi-level hierarchy: ${multiLevelChildren.data.length} folders`);
      console.log(`Single-level hierarchy: ${singleLevelChildren.data.length} folders`);
      
      if (multiLevelChildren.data.length !== singleLevelChildren.data.length) {
        console.log('📝 Note: Different folder counts indicate the singleLevel parameter is working correctly.');
        console.log('   Multi-level includes nested folders, single-level shows only direct children.');
      }
    }

  } catch (error) {
    if (error instanceof NylasApiError) {
      console.error('Nylas API Error:', error.message);
      console.error('Status Code:', error.statusCode);
      console.error('Error Type:', error.type);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Enhanced demonstration with detailed explanations
async function detailedFoldersDemo() {
  try {
    const nylas = new Nylas({
      apiKey: NYLAS_API_KEY!,
      apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
    });

    console.log('\n=== Detailed singleLevel Parameter Demo ===\n');

    console.log('The singleLevel parameter controls folder hierarchy traversal:');
    console.log('• singleLevel: true  → Returns only direct children (single level)');
    console.log('• singleLevel: false → Returns all descendants (multi-level, default)');
    console.log('• Microsoft accounts only - ignored for other providers\n');

    // Show all query parameter combinations
    const queryVariations: Array<{name: string, params: any}> = [
      {
        name: 'Default (multi-level)',
        params: {}
      },
      {
        name: 'Explicit multi-level',
        params: { singleLevel: false }
      },
      {
        name: 'Single-level only',
        params: { singleLevel: true }
      }
    ];

    for (const variation of queryVariations) {
      console.log(`--- ${variation.name} ---`);
      console.log(`Query params: ${JSON.stringify(variation.params)}`);
      
      try {
        const folders: NylasListResponse<Folder> = await nylas.folders.list({
          identifier: NYLAS_GRANT_ID!,
          queryParams: variation.params
        });

        console.log(`Result: ${folders.data.length} folders found`);
        
        // Show folder hierarchy structure
        const rootFolders = folders.data.filter(f => !f.parentId);
        const childFolders = folders.data.filter(f => f.parentId);
        
        console.log(`├─ Root folders: ${rootFolders.length}`);
        console.log(`└─ Child folders: ${childFolders.length}`);
      } catch (error) {
        console.log(`Error: ${error instanceof NylasApiError ? error.message : 'Unknown error'}`);
      }
      console.log();
    }

  } catch (error) {
    console.error('Demo error:', error);
  }
}

// Run the examples
async function main() {
  await listFoldersExample();
  await detailedFoldersDemo();
  
  console.log('=== Folders API Demo Complete ===');
  console.log('\nKey takeaways:');
  console.log('1. The singleLevel parameter is Microsoft-specific');
  console.log('2. Use singleLevel: true to get only direct children');
  console.log('3. Use singleLevel: false (or omit) for full hierarchy');
  console.log('4. Combine with parentId to control which folder to start from');
}

if (require.main === module) {
  main().catch(console.error);
}

export default main; 