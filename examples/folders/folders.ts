import 'dotenv/config';

import Nylas from '../../src/nylas';

const GRANT_ID = process.env.NYLAS_GRANT_ID || '';

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY || '',
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
});

/**
 * This example shows how to list folders using the Nylas Node.js SDK.
 * 
 * For Microsoft accounts, you can use the includeHiddenFolders parameter
 * to include hidden folders in the response.
 */
async function listFolders() {
  try {
    console.log('Listing all folders...\n');

    // List all folders
    const folders = await nylas.folders.list({
      identifier: GRANT_ID,
    });

    console.log('Found', folders.data.length, 'folders');
    
    folders.data.forEach((folder, index) => {
      console.log(`${index + 1}. ${folder.name} (ID: ${folder.id})`);
      if (folder.parentId) {
        console.log(`   Parent ID: ${folder.parentId}`);
      }
      if (folder.attributes && folder.attributes.length > 0) {
        console.log(`   Attributes: ${folder.attributes.join(', ')}`);
      }
      console.log('');
    });

    // For Microsoft accounts: List folders including hidden ones
    console.log('\n--- Microsoft Only: Including Hidden Folders ---\n');
    
    const foldersWithHidden = await nylas.folders.list({
      identifier: GRANT_ID,
      queryParams: {
        includeHiddenFolders: true,
      },
    });

    console.log('Found', foldersWithHidden.data.length, 'folders (including hidden)');
    
    // List only parent folders (no parentId)
    console.log('\n--- Parent Folders Only ---\n');
    
    const parentFoldersWithHidden = await nylas.folders.list({
      identifier: GRANT_ID,
      queryParams: {
        includeHiddenFolders: true,
      },
    });

    const parentFolders = parentFoldersWithHidden.data.filter(folder => !folder.parentId);
    console.log('Found', parentFolders.length, 'parent folders');
    
    parentFolders.forEach((folder, index) => {
      console.log(`${index + 1}. ${folder.name} (ID: ${folder.id})`);
      if (folder.childCount) {
        console.log(`   Child folders: ${folder.childCount}`);
      }
      if (folder.totalCount) {
        console.log(`   Total items: ${folder.totalCount}`);
      }
      if (folder.unreadCount) {
        console.log(`   Unread items: ${folder.unreadCount}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error listing folders:', error);
  }
}

if (!GRANT_ID) {
  console.error('Please set NYLAS_GRANT_ID in your environment variables');
} else {
  listFolders().catch(console.error);
} 