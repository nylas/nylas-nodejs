<div align="center">
  <a href="https://www.nylas.com/">
    <img width="100%" alt="Nylas" src="https://github.com/user-attachments/assets/137517ae-244d-47a5-8ca7-b12984971fc4" />
  </a>

  <h1>Nylas Node.js SDK</h1>

  <p>
    <strong>The official Node.js SDK for Nylas — the infrastructure that powers communications</strong>
  </p>

  <p>
    <a href="https://www.npmjs.com/package/nylas"><img src="https://img.shields.io/npm/v/nylas" alt="npm version" /></a>
    <a href="https://codecov.io/gh/nylas/nylas-nodejs"><img src="https://codecov.io/gh/nylas/nylas-nodejs/branch/main/graph/badge.svg?token=94IMGU4F09" alt="code coverage" /></a>
    <a href="https://www.npmjs.com/package/nylas"><img src="https://img.shields.io/npm/dm/nylas" alt="downloads" /></a>
    <a href="LICENSE.txt"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" /></a>
  </p>

  <p>
    <a href="https://developer.nylas.com/docs/v3/sdks/node/">📖 SDK Guide</a> ·
    <a href="https://developer.nylas.com/docs/api/v3/">📚 API Reference</a> ·
    <a href="https://dashboard-v3.nylas.com/register">🚀 Sign up</a> ·
    <a href="https://github.com/orgs/nylas-samples/repositories?q=node">💡 Samples</a> ·
    <a href="https://forums.nylas.com">💬 Forum</a>
  </p>
</div>

<br />

The official Node.js SDK for [Nylas](https://developer.nylas.com/docs/v3/) — the infrastructure that powers communications. Integrate with Gmail, Microsoft, IMAP, Zoom, and 250+ email, calendar, and meeting providers in 5 minutes. Covers [Email](https://developer.nylas.com/docs/v3/email/), [Calendar](https://developer.nylas.com/docs/v3/calendar/), [Contacts](https://developer.nylas.com/docs/v3/email/contacts/), [Scheduler](https://developer.nylas.com/docs/v3/scheduler/), [Notetaker](https://developer.nylas.com/docs/v3/notetaker/), and [Agent Accounts](https://developer.nylas.com/docs/v3/agent-accounts/).

This repository is for contributors and anyone installing the SDK from source. If you just want to use the SDK in your app, head straight to the [**Node.js SDK guide**](https://developer.nylas.com/docs/v3/sdks/node/) on developer.nylas.com.

## Get started

1. [Sign up for a free Nylas account](https://dashboard-v3.nylas.com/register) and grab your API key from the [Nylas Dashboard](https://dashboard-v3.nylas.com/).
2. Read the [Getting started guide](https://developer.nylas.com/docs/v3/getting-started/) for the core concepts (applications, grants, API keys).
3. Install the SDK and make your first request — see below.

You can also bootstrap from the terminal:

```bash
brew install nylas/nylas-cli/nylas
nylas init
```

More options in the [CLI getting-started guide](https://cli.nylas.com/guides/getting-started).

## ⚙️ Install

> **Requirements:** Node.js v18 or later.

```bash
npm install nylas
# or
yarn add nylas
```

The package ships its own TypeScript types — no `@types/nylas` needed. It's a hybrid ESM + CommonJS package, so both `import` and `require` work.

To install from source:

```bash
git clone https://github.com/nylas/nylas-nodejs.git
cd nylas-nodejs
npm install
```

### Runtime support

Tested on Node.js 18+. Also runs on AWS Lambda, Cloudflare Workers, and Vite/edge environments — see the [`examples/`](examples/) directory for working setups.

## ⚡️ Usage

You access Nylas resources (messages, calendars, events, contacts, …) through an instance of `Nylas`. Initialize it with your API key — and optionally an `apiUri` matching your [data residency](https://developer.nylas.com/docs/dev-guide/platform/data-residency/).

```typescript
import Nylas from "nylas";
// or: const Nylas = require("nylas").default;

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI, // e.g. https://api.us.nylas.com
  timeout: 30, // optional, in seconds
});
```

Once initialized, use it to make requests against a [grant](https://developer.nylas.com/docs/v3/auth/) (an authenticated end-user account):

```typescript
const calendars = await nylas.calendars.list({
  identifier: process.env.NYLAS_GRANT_ID,
});
console.log(calendars);
```

### Error handling

The SDK throws typed errors you can catch and inspect. Every API error carries a `requestId` and `flowId` — include both when filing a support ticket so we can trace the request end-to-end.

```typescript
import { NylasApiError, NylasOAuthError, NylasSdkTimeoutError } from "nylas";

try {
  await nylas.calendars.list({ identifier: grantId });
} catch (err) {
  if (err instanceof NylasApiError) {
    console.error(err.statusCode, err.type, err.message, err.requestId, err.flowId);
  } else if (err instanceof NylasSdkTimeoutError) {
    console.error("Timed out:", err.url, err.timeout);
  } else {
    throw err;
  }
}
```

Step-by-step walkthroughs in the SDK guide:

- [Send and receive email](https://developer.nylas.com/docs/v3/sdks/node/send-email/)
- [Read messages and threads](https://developer.nylas.com/docs/v3/sdks/node/read-messages-threads/)
- [Manage events on a calendar](https://developer.nylas.com/docs/v3/sdks/node/manage-events/)
- [Manage contacts](https://developer.nylas.com/docs/v3/sdks/node/manage-contacts/)
- [Manage folders and labels](https://developer.nylas.com/docs/v3/sdks/node/manage-folders-labels/)
- [Test webhooks locally](https://developer.nylas.com/docs/v3/sdks/node/webhook-testing/)

## 💡 Examples

Runnable examples live in [`examples/`](examples/) — including [agent accounts](examples/agent-accounts/), [attachments](examples/attachments/) (incl. large attachments), [calendars](examples/calendars/), [folders](examples/folders/), [grants](examples/grants/), [messages](examples/messages/), [notetakers](examples/notetakers/), and edge runtimes ([AWS Lambda](examples/aws-lambda/), [Cloudflare + Vite](examples/cloudflare-vite-calendars/), [generic edge](examples/edge-environment/)).

For full sample apps and product quickstarts, browse [**nylas-samples** on GitHub](https://github.com/orgs/nylas-samples/repositories?q=node) — every official SDK has Email, Calendar, Contacts, Scheduler, and Webhooks quickstarts.

### Batch event operations

For Google and Microsoft calendars, `events.batch()` creates, updates, and deletes
events in one request. All operations share the query parameters. HTTP 207 returns
normally, even when every operation failed; each result corresponds to the operation
at the same index. The SDK does not split batches or retry failed operations.

```ts
import type { BatchEventOperation } from 'nylas';

const queryParams = { calendarId: 'primary' };
const operations: BatchEventOperation[] = [
  {
    method: 'create',
    body: {
      title: 'Standup',
      when: { startTime: 1798794000, endTime: 1798795800 },
    },
  },
  { method: 'update', eventId: 'EVENT_ID_1', body: { title: 'Renamed' } },
  { method: 'delete', eventId: 'EVENT_ID_2' },
];
const result = await nylas.events.batch({
  identifier: grantId,
  queryParams,
  requestBody: { operations },
});

const retryOperations: BatchEventOperation[] = [];
let retryDelay = 0;
for (const [index, item] of result.data.entries()) {
  console.log(index, item.status, item.data?.id);

  // A later step can fail after the provider created the event. Never retry it.
  if (item.providerEventCreated) continue;

  if (item.status === 429 || item.status === 503) {
    retryOperations.push(operations[index]);
    // Honor retryAfter, including zero. Choose an application backoff if absent.
    retryDelay = Math.max(retryDelay, item.retryAfter ?? 1);
  }
}

// Optional caller-controlled retry: one attempt, only for the selected failures.
if (retryOperations.length > 0) {
  await new Promise((resolve) => setTimeout(resolve, retryDelay * 1000));
  const retried = await nylas.events.batch({
    identifier: grantId,
    queryParams,
    requestBody: { operations: retryOperations },
  });
  for (const [index, item] of retried.data.entries()) {
    console.log('Retry result', index, item.status);
  }
}
```

Participant notifications use the server default (`true`) when omitted. Microsoft
rejects `notifyParticipants: false`. Invalid requests raise the usual `NylasApiError`.

## 🤖 AI agents

[nylas/skills](https://github.com/nylas/skills) drops Nylas into Claude Code, Cursor, Codex, and other agents that support the skills format:

```bash
npx skills add nylas/skills
/plugin marketplace add nylas/skills   # Claude Code
```

The CLI also installs an MCP server for Claude Desktop, Claude Code, Cursor, Windsurf, or VS Code:

```bash
brew install nylas/nylas-cli/nylas
nylas mcp install
```

Walkthrough: [give AI agents email access via MCP](https://cli.nylas.com/guides/give-ai-agents-email-access-via-mcp).

## 📚 Reference

- **SDK guide:** [developer.nylas.com/docs/v3/sdks/node](https://developer.nylas.com/docs/v3/sdks/node/)
- **API reference:** [developer.nylas.com/docs/api/v3](https://developer.nylas.com/docs/api/v3/)
- **TypeDoc reference:** [nylas-nodejs-sdk-reference.pages.dev](https://nylas-nodejs-sdk-reference.pages.dev/) — generated method/class docs for this SDK
- **Webhooks (notifications):** [developer.nylas.com/docs/v3/notifications](https://developer.nylas.com/docs/v3/notifications/)
- **Auth flows:** [developer.nylas.com/docs/v3/auth](https://developer.nylas.com/docs/v3/auth/)
- **Dev guide & best practices:** [developer.nylas.com/docs/dev-guide](https://developer.nylas.com/docs/dev-guide/)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

## ✨ Upgrading

See [`CHANGELOG.md`](CHANGELOG.md) for per-release notes. Older upgrade guidance lives in [`UPGRADE.md`](UPGRADE.md).

## 💙 Contributing

Issues, ideas, and pull requests welcome — see [Contributing.md](Contributing.md). Before opening a large change, please open an issue or post in the [forum](https://forums.nylas.com) so we can sanity-check the direction.

## 🔒 Security

Found a vulnerability? Please **don't** open a public issue. Report it through our [Vulnerability Disclosure Policy](https://www.nylas.com/security/vulnerability-disclosure-policy/).

## 🔗 Other Nylas SDKs

- [nylas-python](https://github.com/nylas/nylas-python) · `pip install nylas`
- [nylas-ruby](https://github.com/nylas/nylas-ruby) · `gem install nylas`
- [nylas-java](https://github.com/nylas/nylas-java) · Maven / Gradle (Kotlin too)

## 📝 License

MIT — see [LICENSE.txt](LICENSE.txt).
