import Nylas from 'nylas';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.NYLAS_API_KEY || '';
const apiUri = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';
const agentAccountEmail = process.env.AGENT_ACCOUNT_EMAIL || '';
const agentAccountGrantId = process.env.AGENT_ACCOUNT_GRANT_ID || '';
const appPassword = process.env.AGENT_ACCOUNT_APP_PASSWORD || '';
const skipCleanup = process.env.AGENT_ACCOUNTS_SKIP_CLEANUP === 'true';
const deleteCreatedGrant =
  process.env.AGENT_ACCOUNTS_DELETE_CREATED_GRANT === 'true';

if (!apiKey) {
  throw new Error('NYLAS_API_KEY environment variable is not set');
}

const nylas = new Nylas({
  apiKey,
  apiUri,
});

const runId = Date.now();

/**
 * Demonstrates creating a reusable list for rule matching.
 */
async function createAndManageList(): Promise<string> {
  console.log('\n=== Agent Account Lists ===');

  const list = await nylas.lists.create({
    requestBody: {
      name: `SDK example blocked domains ${runId}`,
      description: 'Created by the Agent Accounts SDK example.',
      type: 'domain',
    },
  });

  console.log(`Created list: ${list.data.id}`);

  const updatedList = await nylas.lists.addItems({
    listId: list.data.id,
    requestBody: {
      items: ['spam-domain.example', 'another-bad-domain.example'],
    },
  });

  console.log(`Added items. Item count: ${updatedList.data.itemsCount ?? 0}`);

  const items = await nylas.lists.listItems({
    listId: list.data.id,
    queryParams: {
      limit: 10,
    },
  });

  console.log(`Listed ${items.data.length} item(s) from the list`);

  await nylas.lists.removeItems({
    listId: list.data.id,
    requestBody: {
      items: ['another-bad-domain.example'],
    },
  });

  console.log('Removed one list item');

  return list.data.id;
}

/**
 * Demonstrates creating an inbound rule that references a list.
 */
async function createInboundRule(listId: string): Promise<string> {
  console.log('\n=== Agent Account Rules ===');

  const rule = await nylas.rules.create({
    requestBody: {
      name: `SDK example block list rule ${runId}`,
      description: 'Blocks inbound mail from domains in the example list.',
      priority: 1,
      trigger: 'inbound',
      match: {
        operator: 'any',
        conditions: [
          {
            field: 'from.domain',
            operator: 'in_list',
            value: [listId],
          },
        ],
      },
      actions: [{ type: 'block' }],
    },
  });

  console.log(`Created inbound rule: ${rule.data.id}`);

  const rules = await nylas.rules.list({
    queryParams: {
      limit: 10,
    },
  });

  console.log(`Listed ${rules.data.length} rule(s)`);

  return rule.data.id;
}

/**
 * Demonstrates creating a policy that links the inbound rule.
 */
async function createPolicy(ruleId: string): Promise<string> {
  console.log('\n=== Agent Account Policies ===');

  const policy = await nylas.policies.create({
    requestBody: {
      name: `SDK example policy ${runId}`,
      rules: [ruleId],
      limits: {
        limitAttachmentSizeLimit: 26214400,
        limitAttachmentCountLimit: 50,
        limitInboxRetentionPeriod: 30,
        limitSpamRetentionPeriod: 7,
      },
      spamDetection: {
        useListDnsbl: true,
        useHeaderAnomalyDetection: true,
        spamSensitivity: 1.0,
      },
    },
  });

  console.log(`Created policy: ${policy.data.id}`);

  const policies = await nylas.policies.list({
    queryParams: {
      limit: 10,
    },
  });

  console.log(`Listed ${policies.data.length} policy/policies`);

  return policy.data.id;
}

/**
 * Demonstrates provisioning an Agent Account through the SDK's custom auth flow.
 */
async function maybeCreateAgentAccount(
  policyId: string
): Promise<string | undefined> {
  if (!agentAccountEmail) {
    console.log(
      '\nSkipping Agent Account creation. Set AGENT_ACCOUNT_EMAIL to create one.'
    );
    return undefined;
  }

  console.log('\n=== Agent Account Provisioning ===');

  const grant = await nylas.auth.customAuthentication({
    requestBody: {
      provider: 'nylas',
      settings: {
        email: agentAccountEmail,
        policyId,
        ...(appPassword ? { appPassword } : {}),
      },
    },
  });

  console.log(`Created Agent Account grant: ${grant.data.id}`);
  console.log(`Email: ${grant.data.email ?? agentAccountEmail}`);
  console.log(`Status: ${grant.data.grantStatus ?? 'N/A'}`);

  return grant.data.id;
}

/**
 * Demonstrates grant-scoped operations that work with Agent Account grants.
 */
async function maybeVerifyGrantScopedApis(grantId?: string): Promise<void> {
  const identifier = grantId || agentAccountGrantId;

  if (!identifier) {
    console.log(
      '\nSkipping grant-scoped checks. Set AGENT_ACCOUNT_GRANT_ID or AGENT_ACCOUNT_EMAIL.'
    );
    return;
  }

  console.log('\n=== Grant-Scoped Agent Account APIs ===');

  const messages = await nylas.messages.list({
    identifier,
    queryParams: {
      limit: 5,
    },
  });

  console.log(`Listed ${messages.data.length} message(s)`);

  const evaluations = await nylas.rules.listEvaluations({
    identifier,
    queryParams: {
      limit: 10,
    },
  });

  console.log(`Listed ${evaluations.data.length} rule evaluation(s)`);
}

async function cleanup({
  policyId,
  ruleId,
  listId,
  createdGrantId,
}: {
  policyId?: string;
  ruleId?: string;
  listId?: string;
  createdGrantId?: string;
}): Promise<void> {
  if (skipCleanup) {
    console.log('\nSkipping cleanup because AGENT_ACCOUNTS_SKIP_CLEANUP=true');
    return;
  }

  console.log('\n=== Cleanup ===');

  if (policyId) {
    await nylas.policies.destroy({ policyId });
    console.log(`Deleted policy: ${policyId}`);
  }

  if (ruleId) {
    await nylas.rules.destroy({ ruleId });
    console.log(`Deleted rule: ${ruleId}`);
  }

  if (listId) {
    await nylas.lists.destroy({ listId });
    console.log(`Deleted list: ${listId}`);
  }

  if (createdGrantId && deleteCreatedGrant) {
    await nylas.grants.destroy({ grantId: createdGrantId });
    console.log(`Deleted Agent Account grant: ${createdGrantId}`);
  } else if (createdGrantId) {
    console.log(
      `Left Agent Account grant in place: ${createdGrantId}. Set AGENT_ACCOUNTS_DELETE_CREATED_GRANT=true to delete it.`
    );
  }
}

async function main(): Promise<void> {
  console.log('Nylas Agent Accounts SDK Example');
  console.log('================================');

  let listId: string | undefined;
  let ruleId: string | undefined;
  let policyId: string | undefined;
  let createdGrantId: string | undefined;

  try {
    listId = await createAndManageList();
    ruleId = await createInboundRule(listId);
    policyId = await createPolicy(ruleId);
    createdGrantId = await maybeCreateAgentAccount(policyId);
    await maybeVerifyGrantScopedApis(createdGrantId);

    console.log('\nAgent Accounts SDK example completed successfully.');
  } catch (error) {
    console.error('\nError running Agent Accounts SDK example:', error);
    process.exitCode = 1;
  } finally {
    await cleanup({ policyId, ruleId, listId, createdGrantId });
  }
}

if (require.main === module) {
  main();
}

export {
  createAndManageList,
  createInboundRule,
  createPolicy,
  maybeCreateAgentAccount,
  maybeVerifyGrantScopedApis,
};
