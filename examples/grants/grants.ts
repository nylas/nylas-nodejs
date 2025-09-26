import Nylas from 'nylas';
import dotenv from 'dotenv';
import path from 'path';
import { Grant } from 'nylas';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check for required environment variables
const apiKey: string = process.env.NYLAS_API_KEY || '';

if (!apiKey) {
  throw new Error('NYLAS_API_KEY environment variable is not set');
}

// Initialize the Nylas client
const nylas = new Nylas({
  apiKey,
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
});

/**
 * Demonstrates how to list all grants with basic parameters
 */
async function listAllGrants(): Promise<void> {
  console.log('\n=== Listing All Grants ===');
  
  try {
    const grants = await nylas.grants.list();
    
    console.log(`Found ${grants.data.length} grants`);
    
    if (grants.data.length > 0) {
      console.log('\nGrant Summary:');
      grants.data.forEach((grant: Grant, index: number) => {
        console.log(`${index + 1}. ID: ${grant.id}`);
        console.log(`   Provider: ${grant.provider}`);
        console.log(`   Email: ${grant.email || 'N/A'}`);
        console.log(`   Status: ${grant.grantStatus || 'N/A'}`);
        console.log(`   Created: ${new Date(grant.createdAt * 1000).toISOString()}`);
        console.log(`   Updated: ${grant.updatedAt ? new Date(grant.updatedAt * 1000).toISOString() : 'N/A'}`);
        console.log(`   Scopes: ${grant.scope.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('No grants found');
    }
  } catch (error) {
    console.error('Error listing grants:', error);
    throw error;
  }
}

/**
 * Demonstrates how to list grants with pagination
 */
async function listGrantsWithPagination(): Promise<void> {
  console.log('\n=== Listing Grants with Pagination ===');
  
  try {
    const grants = await nylas.grants.list({
      queryParams: {
        limit: 5,
        offset: 0,
      },
    });
    
    console.log(`Retrieved ${grants.data.length} grants (limit: 5, offset: 0)`);
    
    grants.data.forEach((grant: Grant, index: number) => {
      console.log(`${index + 1}. ${grant.email || grant.id} (${grant.provider})`);
    });
    
    // Demonstrate accessing response metadata
    console.log('\nResponse metadata:');
    console.log(`Request ID: ${grants.requestId}`);
    
    // Access rate limit headers if available
    if (grants.rawHeaders) {
      const rateLimit = grants.rawHeaders['x-rate-limit-limit'];
      const rateLimitRemaining = grants.rawHeaders['x-rate-limit-remaining'];
      if (rateLimit && rateLimitRemaining) {
        console.log(`Rate Limit: ${rateLimitRemaining}/${rateLimit} remaining`);
      }
    }
  } catch (error) {
    console.error('Error listing grants with pagination:', error);
    throw error;
  }
}

/**
 * Demonstrates how to sort grants by creation date (newest first)
 */
async function listGrantsSortedByCreationDate(): Promise<void> {
  console.log('\n=== Listing Grants Sorted by Creation Date (Newest First) ===');
  
  try {
    const grants = await nylas.grants.list({
      queryParams: {
        sortBy: 'created_at',
        orderBy: 'desc',
        limit: 10,
      },
    });
    
    console.log(`Found ${grants.data.length} grants, sorted by creation date (newest first)`);
    
    grants.data.forEach((grant: Grant, index: number) => {
      const createdDate = new Date(grant.createdAt * 1000);
      console.log(`${index + 1}. ${grant.email || grant.id}`);
      console.log(`   Provider: ${grant.provider}`);
      console.log(`   Created: ${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString()}`);
      console.log(`   Status: ${grant.grantStatus || 'Active'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error listing grants sorted by creation date:', error);
    throw error;
  }
}

/**
 * Demonstrates how to sort grants by last update date (most recently updated first)
 */
async function listGrantsSortedByUpdateDate(): Promise<void> {
  console.log('\n=== Listing Grants Sorted by Update Date (Most Recently Updated First) ===');
  
  try {
    const grants = await nylas.grants.list({
      queryParams: {
        sortBy: 'updated_at',
        orderBy: 'desc',
        limit: 10,
      },
    });
    
    console.log(`Found ${grants.data.length} grants, sorted by update date (most recently updated first)`);
    
    grants.data.forEach((grant: Grant, index: number) => {
      const createdDate = new Date(grant.createdAt * 1000);
      const updatedDate = grant.updatedAt ? new Date(grant.updatedAt * 1000) : null;
      
      console.log(`${index + 1}. ${grant.email || grant.id}`);
      console.log(`   Provider: ${grant.provider}`);
      console.log(`   Created: ${createdDate.toLocaleDateString()} ${createdDate.toLocaleTimeString()}`);
      console.log(`   Updated: ${updatedDate ? `${updatedDate.toLocaleDateString()} ${updatedDate.toLocaleTimeString()}` : 'Never'}`);
      console.log(`   Status: ${grant.grantStatus || 'Active'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error listing grants sorted by update date:', error);
    throw error;
  }
}

/**
 * Demonstrates how to filter grants by provider
 */
async function listGrantsByProvider(provider: string = 'google'): Promise<void> {
  console.log(`\n=== Listing Grants Filtered by Provider: ${provider} ===`);
  
  try {
    const grants = await nylas.grants.list({
      queryParams: {
        provider: provider as any, // Cast to satisfy TypeScript - provider accepts Provider enum
        sortBy: 'created_at',
        orderBy: 'desc',
      },
    });
    
    console.log(`Found ${grants.data.length} ${provider} grants`);
    
    if (grants.data.length > 0) {
      grants.data.forEach((grant: Grant, index: number) => {
        console.log(`${index + 1}. ${grant.email || grant.id}`);
        console.log(`   Scopes: ${grant.scope.join(', ')}`);
        console.log(`   Status: ${grant.grantStatus || 'Active'}`);
        console.log(`   Created: ${new Date(grant.createdAt * 1000).toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log(`No ${provider} grants found`);
    }
  } catch (error) {
    console.error(`Error listing ${provider} grants:`, error);
    throw error;
  }
}

/**
 * Demonstrates how to filter grants by status
 */
async function listGrantsByStatus(status: string = 'valid'): Promise<void> {
  console.log(`\n=== Listing Grants Filtered by Status: ${status} ===`);
  
  try {
    const grants = await nylas.grants.list({
      queryParams: {
        grantStatus: status,
        sortBy: 'created_at',
        orderBy: 'desc',
      },
    });
    
    console.log(`Found ${grants.data.length} grants with status: ${status}`);
    
    grants.data.forEach((grant: Grant, index: number) => {
      console.log(`${index + 1}. ${grant.email || grant.id}`);
      console.log(`   Provider: ${grant.provider}`);
      console.log(`   Status: ${grant.grantStatus || 'Active'}`);
      console.log(`   Created: ${new Date(grant.createdAt * 1000).toLocaleDateString()}`);
      console.log('');
    });
  } catch (error) {
    console.error(`Error listing grants with status ${status}:`, error);
    throw error;
  }
}

/**
 * Demonstrates how to fetch a specific grant by ID
 */
async function fetchSpecificGrant(grantId?: string): Promise<void> {
  console.log('\n=== Fetching Specific Grant ===');
  
  try {
    // If no grant ID provided, get the first grant from the list
    if (!grantId) {
      console.log('No grant ID provided, fetching first available grant...');
      const grants = await nylas.grants.list({ queryParams: { limit: 1 } });
      
      if (grants.data.length === 0) {
        console.log('No grants available to fetch');
        return;
      }
      
      grantId = grants.data[0].id;
      console.log(`Using grant ID: ${grantId}`);
    }
    
    const grant = await nylas.grants.find({ grantId });
    
    console.log('\nGrant Details:');
    console.log(`ID: ${grant.data.id}`);
    console.log(`Provider: ${grant.data.provider}`);
    console.log(`Email: ${grant.data.email || 'N/A'}`);
    console.log(`Name: ${grant.data.name || 'N/A'}`);
    console.log(`Status: ${grant.data.grantStatus || 'Active'}`);
    console.log(`Scopes: ${grant.data.scope.join(', ')}`);
    console.log(`Created: ${new Date(grant.data.createdAt * 1000).toISOString()}`);
    console.log(`Updated: ${grant.data.updatedAt ? new Date(grant.data.updatedAt * 1000).toISOString() : 'Never'}`);
    console.log(`Provider User ID: ${grant.data.providerUserId || 'N/A'}`);
    console.log(`IP Address: ${grant.data.ip || 'N/A'}`);
    console.log(`User Agent: ${grant.data.userAgent || 'N/A'}`);
    
    if (grant.data.settings && Object.keys(grant.data.settings).length > 0) {
      console.log('\nProvider Settings:');
      console.log(JSON.stringify(grant.data.settings, null, 2));
    }
    
    console.log(`\nRequest ID: ${grant.requestId}`);
  } catch (error) {
    console.error('Error fetching specific grant:', error);
    throw error;
  }
}

/**
 * Demonstrates how to filter grants by date range
 */
async function listGrantsByDateRange(): Promise<void> {
  console.log('\n=== Listing Grants by Date Range (Last 30 Days) ===');
  
  try {
    // Calculate timestamps for last 30 days
    const thirtyDaysAgo = Math.floor((Date.now() - (30 * 24 * 60 * 60 * 1000)) / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    const grants = await nylas.grants.list({
      queryParams: {
        since: thirtyDaysAgo,
        before: now,
        sortBy: 'created_at',
        orderBy: 'desc',
      },
    });
    
    console.log(`Found ${grants.data.length} grants created in the last 30 days`);
    
    grants.data.forEach((grant: Grant, index: number) => {
      const createdDate = new Date(grant.createdAt * 1000);
      const daysAgo = Math.floor((Date.now() - grant.createdAt * 1000) / (24 * 60 * 60 * 1000));
      
      console.log(`${index + 1}. ${grant.email || grant.id}`);
      console.log(`   Provider: ${grant.provider}`);
      console.log(`   Created: ${createdDate.toLocaleDateString()} (${daysAgo} days ago)`);
      console.log(`   Status: ${grant.grantStatus || 'Active'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error listing grants by date range:', error);
    throw error;
  }
}

/**
 * Demonstrates advanced grant listing with multiple filters and custom sorting
 */
async function advancedGrantListing(): Promise<void> {
  console.log('\n=== Advanced Grant Listing with Multiple Filters ===');
  
  try {
    // Get all grants first to demonstrate client-side sorting/filtering
    const allGrants = await nylas.grants.list({
      queryParams: {
        sortBy: 'created_at',
        orderBy: 'desc',
      },
    });
    
    console.log(`\nTotal grants: ${allGrants.data.length}`);
    
    // Group grants by provider
    const grantsByProvider = allGrants.data.reduce((acc: Record<string, Grant[]>, grant: Grant) => {
      if (!acc[grant.provider]) {
        acc[grant.provider] = [];
      }
      acc[grant.provider].push(grant);
      return acc;
    }, {});
    
    console.log('\nGrants by Provider:');
    Object.entries(grantsByProvider).forEach(([provider, grants]) => {
      console.log(`  ${provider}: ${grants.length} grants`);
    });
    
    // Find grants with specific scopes
    const grantsWithCalendarScope = allGrants.data.filter(grant => 
      grant.scope.some(scope => scope.toLowerCase().includes('calendar'))
    );
    
    console.log(`\nGrants with calendar scope: ${grantsWithCalendarScope.length}`);
    
    // Find recently updated grants (within last 7 days)
    const sevenDaysAgo = Math.floor((Date.now() - (7 * 24 * 60 * 60 * 1000)) / 1000);
    const recentlyUpdated = allGrants.data.filter(grant => 
      grant.updatedAt && grant.updatedAt > sevenDaysAgo
    );
    
    console.log(`\nGrants updated in last 7 days: ${recentlyUpdated.length}`);
    
    if (recentlyUpdated.length > 0) {
      console.log('\nRecently Updated Grants:');
      recentlyUpdated.forEach((grant: Grant, index: number) => {
        const updatedDate = new Date(grant.updatedAt! * 1000);
        console.log(`  ${index + 1}. ${grant.email || grant.id} - Updated: ${updatedDate.toLocaleDateString()}`);
      });
    }
    
  } catch (error) {
    console.error('Error in advanced grant listing:', error);
    throw error;
  }
}

/**
 * Main function to run all examples
 */
async function main(): Promise<void> {
  console.log('🚀 Nylas Grants API Examples');
  console.log('=============================');
  
  try {
    // Run all the example functions
    await listAllGrants();
    await listGrantsWithPagination();
    await listGrantsSortedByCreationDate();
    await listGrantsSortedByUpdateDate();
    await listGrantsByProvider('google');
    await listGrantsByStatus('valid');
    await fetchSpecificGrant();
    await listGrantsByDateRange();
    await advancedGrantListing();
    
    console.log('\n✅ All examples completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
    process.exit(1);
  }
}

// Run the examples if this file is executed directly
if (require.main === module) {
  main();
}

// Export functions for use in other files
export {
  listAllGrants,
  listGrantsWithPagination,
  listGrantsSortedByCreationDate,
  listGrantsSortedByUpdateDate,
  listGrantsByProvider,
  listGrantsByStatus,
  fetchSpecificGrant,
  listGrantsByDateRange,
  advancedGrantListing,
};
