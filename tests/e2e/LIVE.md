This optional runner performs real writes in one configured test mailbox. It is
separate from `npm run test:e2e` and is never invoked by CI. Use Node.js 24 and
install the repository's development dependencies first.

Validate the updated account configuration without creating objects:

```sh
node scripts/testLiveE2E.js --test-account-file /absolute/path/to/examples/.env --verify-only
```

After that check succeeds, explicitly enable test-account writes:

```sh
node scripts/testLiveE2E.js --test-account-file /absolute/path/to/examples/.env --allow-test-account-writes
```

The runner reads `NYLAS_API_KEY`, `NYLAS_API_URI`, `NYLAS_GRANT_ID`, and
`TEST_EMAIL` as data from the selected file. It accepts the US/EU Nylas API origins
and requires the current grant to be valid and its email address to match
`TEST_EMAIL`. Credentials are not forwarded to build/install subprocesses.
Output contains case names and status codes only; raw errors and account data
are suppressed.

Each invocation freshly builds, packs, and installs the SDK. It creates three
uniquely named drafts with Buffer, base64, and unknown-size stream attachments
whose encoded content exceeds 3 MiB, then finds, filters, updates, downloads, and
deletes them. Download checks run when the provider exposes attachment IDs.

It also sends one Buffer, base64, and unknown-size stream attachment message to
the same mailbox, reads each resulting message, and verifies its downloaded
attachment bytes. These use the same >3 MiB encoded payloads as the draft cases.

For a Microsoft grant, it additionally creates an upload session, validates the response,
uploads 1 MiB of synthetic bytes directly to the documented HTTPS storage host
without an authorization header, completes the session, and sends its reference
once to the same test mailbox. It reads and downloads the resulting attachment.
Send requests are never retried automatically. A different provider reports this
case as unavailable. No transactional send is attempted without a configured
domain.

A `finally` block deletes returned object IDs and revisits exact synthetic
subjects to catch late self-delivery or uncertain write outcomes. Consistency
polling and cleanup attempts are bounded. Any failed cleanup fails the run.
Upload sessions have no SDK delete endpoint and expire through the API's normal
retention policy.

The upload checks follow the current
[create-session contract](https://developer.nylas.com/docs/reference/api/attachments/create-attachment-upload-session/),
[completion contract](https://developer.nylas.com/docs/reference/api/attachments/complete-attachment-upload-session/),
and [large-attachment guide](https://developer.nylas.com/docs/v3/email/send-large-attachments/).
Unexpected upload hosts, methods, headers, or required field values fail closed.
