/**
 * Multi-Credential Authentication Example
 *
 * This example demonstrates how to use the multi-credential feature to manage
 * multiple provider credentials under a single connector.
 */

import Nylas from '../src/nylas';
import { CredentialType } from '../src/models/credentials';

const nylas = new Nylas({
  apiKey: 'your-api-key',
});

async function multiCredentialExample() {
  // Step 1: Create a connector (automatically creates a default credential)
  console.log('Step 1: Creating connector with default credentials...');
  const connector = await nylas.connectors.create({
    requestBody: {
      name: 'My Multi-Tenant Google Connector',
      provider: 'google',
      settings: {
        clientId: 'default-gcp-project-client-id',
        clientSecret: 'default-gcp-project-client-secret',
        topicName: 'default-topic',
      },
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    },
  });
  console.log('Connector created:', connector.data.provider);
  console.log('Active credential ID:', connector.data.activeCredentialId);

  // Step 2: Create additional credentials for different GCP projects
  console.log('\nStep 2: Creating additional credentials...');

  const projectACredential = await nylas.connectors.credentials.create({
    provider: 'google',
    requestBody: {
      name: 'GCP Project A',
      credentialType: CredentialType.CONNECTOR,
      credentialData: {
        clientId: 'project-a-client-id',
        clientSecret: 'project-a-client-secret',
        topicName: 'project-a-topic',
      },
    },
  });
  console.log('Created credential for Project A:', projectACredential.data.id);

  const projectBCredential = await nylas.connectors.credentials.create({
    provider: 'google',
    requestBody: {
      name: 'GCP Project B',
      credentialType: CredentialType.CONNECTOR,
      credentialData: {
        clientId: 'project-b-client-id',
        clientSecret: 'project-b-client-secret',
        topicName: 'project-b-topic',
      },
    },
  });
  console.log('Created credential for Project B:', projectBCredential.data.id);

  // Step 3: List all credentials for this connector
  console.log('\nStep 3: Listing all credentials...');
  const credentialsList = await nylas.connectors.credentials.list({
    provider: 'google',
  });
  console.log(`Total credentials: ${credentialsList.data.length}`);

  // Step 4: Use specific credential in Hosted OAuth flow
  console.log(
    '\nStep 4: Generating hosted auth URL with Project A credentials...'
  );
  const authUrlProjectA = nylas.auth.urlForOAuth2({
    clientId: 'your-nylas-app-client-id',
    redirectUri: 'https://your-app.com/callback',
    provider: 'google',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    credentialId: projectACredential.data.id, // Use Project A credentials
  });
  console.log('Auth URL for Project A:', authUrlProjectA);

  // Step 5: Use different credential for another user
  console.log(
    '\nStep 5: Generating hosted auth URL with Project B credentials...'
  );
  const authUrlProjectB = nylas.auth.urlForOAuth2({
    clientId: 'your-nylas-app-client-id',
    redirectUri: 'https://your-app.com/callback',
    provider: 'google',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    credentialId: projectBCredential.data.id, // Use Project B credentials
  });
  console.log('Auth URL for Project B:', authUrlProjectB);

  // Step 6: Use credential with PKCE flow
  console.log('\nStep 6: Generating PKCE auth URL with specific credential...');
  const pkceAuth = nylas.auth.urlForOAuth2PKCE({
    clientId: 'your-nylas-app-client-id',
    redirectUri: 'https://your-app.com/callback',
    provider: 'google',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    credentialId: projectACredential.data.id,
  });
  console.log('PKCE Auth URL:', pkceAuth.url);
  console.log('Secret (store this securely):', pkceAuth.secret);

  // Step 7: Custom authentication with specific credential
  console.log(
    '\nStep 7: Using custom authentication with specific credential...'
  );
  const customGrant = await nylas.auth.customAuthentication({
    requestBody: {
      provider: 'google',
      settings: {
        // Provider-specific settings
        refresh_token: 'user-refresh-token',
        credentialId: projectBCredential.data.id, // Use Project B credentials
      },
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    },
  });
  console.log('Grant created:', customGrant.data.id);
  console.log('Credential used:', customGrant.data.credentialId);

  // Step 8: Update connector to change default credential
  console.log('\nStep 8: Updating connector default credential...');
  const updatedConnector = await nylas.connectors.update({
    provider: 'google',
    requestBody: {
      activeCredentialId: projectACredential.data.id, // Set Project A as default
    },
  });
  console.log(
    'Updated active credential:',
    updatedConnector.data.activeCredentialId
  );

  // Step 9: Use default credential (no credentialId specified)
  console.log(
    '\nStep 9: Generating auth URL without specifying credential (uses default)...'
  );
  const defaultAuthUrl = nylas.auth.urlForOAuth2({
    clientId: 'your-nylas-app-client-id',
    redirectUri: 'https://your-app.com/callback',
    provider: 'google',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    // No credentialId specified - will use activeCredentialId from connector
  });
  console.log('Auth URL using default credential:', defaultAuthUrl);

  // Step 10: Cleanup - Delete a credential
  console.log('\nStep 10: Deleting Project B credential...');
  await nylas.connectors.credentials.destroy({
    provider: 'google',
    credentialsId: projectBCredential.data.id,
  });
  console.log('Credential deleted successfully');
}

// Microsoft Multi-Tenant Example
async function microsoftMultiTenantExample() {
  console.log('\n=== Microsoft Multi-Tenant Example ===\n');

  // Create Microsoft connector
  const msConnector = await nylas.connectors.create({
    requestBody: {
      name: 'Multi-Tenant Microsoft Connector',
      provider: 'microsoft',
      settings: {
        clientId: 'default-tenant-client-id',
        clientSecret: 'default-tenant-client-secret',
        tenant: 'common',
      },
      scope: ['https://graph.microsoft.com/Mail.Read'],
    },
  });
  console.log('Microsoft connector created');

  // Create credential for Tenant A
  const tenantACredential = await nylas.connectors.credentials.create({
    provider: 'microsoft',
    requestBody: {
      name: 'Tenant A',
      credentialType: CredentialType.CONNECTOR,
      credentialData: {
        clientId: 'tenant-a-client-id',
        clientSecret: 'tenant-a-client-secret',
        tenant: 'tenant-a-id',
      },
    },
  });
  console.log('Created credential for Tenant A:', tenantACredential.data.id);

  // Create credential for Tenant B
  const tenantBCredential = await nylas.connectors.credentials.create({
    provider: 'microsoft',
    requestBody: {
      name: 'Tenant B',
      credentialType: CredentialType.CONNECTOR,
      credentialData: {
        clientId: 'tenant-b-client-id',
        clientSecret: 'tenant-b-client-secret',
        tenant: 'tenant-b-id',
      },
    },
  });
  console.log('Created credential for Tenant B:', tenantBCredential.data.id);

  // Use Tenant A credentials for auth
  const tenantAAuthUrl = nylas.auth.urlForOAuth2({
    clientId: 'your-nylas-app-client-id',
    redirectUri: 'https://your-app.com/callback',
    provider: 'microsoft',
    scope: ['https://graph.microsoft.com/Mail.Read'],
    credentialId: tenantACredential.data.id,
  });
  console.log('Auth URL for Tenant A:', tenantAAuthUrl);

  // Admin consent flow with specific credential
  const adminConsentUrl = nylas.auth.urlForAdminConsent({
    clientId: 'your-nylas-app-client-id',
    redirectUri: 'https://your-app.com/callback',
    credentialId: tenantBCredential.data.id,
  });
  console.log('Admin consent URL for Tenant B:', adminConsentUrl);
}

// Run examples
if (require.main === module) {
  multiCredentialExample()
    .then(() => microsoftMultiTenantExample())
    .then(() => console.log('\n✅ All examples completed successfully!'))
    .catch((error) => console.error('❌ Error:', error));
}

export { multiCredentialExample, microsoftMultiTenantExample };
