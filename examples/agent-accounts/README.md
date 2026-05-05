# Agent Accounts Example

This example verifies the Agent Accounts SDK surface by using the SDK to:

- Create a List and manage its items.
- Create a Rule that references the List.
- Create a Policy that links the Rule.
- Optionally create a Nylas Agent Account grant with `provider: 'nylas'`.
- Optionally list messages and rule evaluations for an Agent Account grant.

## Setup

From the `examples` directory:

```bash
npm install
cp .env.example .env
```

Set the common environment variables:

```bash
NYLAS_API_KEY=your_nylas_api_key_here
NYLAS_API_URI=https://api.us.nylas.com
```

## Run without creating an Agent Account

This exercises Policies, Rules, and Lists, then cleans them up:

```bash
npm run agent-accounts
```

## Run against an existing Agent Account

Set an Agent Account grant ID to also verify grant-scoped APIs:

```bash
AGENT_ACCOUNT_GRANT_ID=your_agent_account_grant_id
```

Then run:

```bash
npm run agent-accounts
```

## Create an Agent Account

To create a new Agent Account, set an email address on a registered domain:

```bash
AGENT_ACCOUNT_EMAIL=agent@your-registered-domain.com
```

Optionally enable IMAP/SMTP access by setting:

```bash
AGENT_ACCOUNT_APP_PASSWORD=YourSecurePassword123
```

By default, the example cleans up the Policy, Rule, and List it creates, but leaves any newly created Agent Account grant in place. To delete the created grant too:

```bash
AGENT_ACCOUNTS_DELETE_CREATED_GRANT=true
```

To keep all created resources for inspection:

```bash
AGENT_ACCOUNTS_SKIP_CLEANUP=true
```
