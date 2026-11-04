import dotenv from 'dotenv';
import path from 'path';
import Nylas, { BatchEventOperation } from 'nylas';

// From examples/: npx ts-node calendars/event_batch.ts
// Set NYLAS_API_KEY, NYLAS_GRANT_ID, and NYLAS_CALENDAR_ID in examples/.env.
// NYLAS_UPDATE_EVENT_ID and NYLAS_DELETE_EVENT_ID must name distinct existing events.
async function main(): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  const apiKey = process.env.NYLAS_API_KEY || '';
  const grantId = process.env.NYLAS_GRANT_ID || '';
  const calendarId = process.env.NYLAS_CALENDAR_ID || '';
  const updateEventId = process.env.NYLAS_UPDATE_EVENT_ID || '';
  const deleteEventId = process.env.NYLAS_DELETE_EVENT_ID || '';
  const apiUri = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';

  if (
    [apiKey, grantId, calendarId, updateEventId, deleteEventId].some(
      (value) => !value.trim()
    ) ||
    updateEventId === deleteEventId ||
    (apiUri !== 'https://api.us.nylas.com' &&
      apiUri !== 'https://api.eu.nylas.com')
  ) {
    throw new Error('Invalid example configuration.');
  }

  const nylas = new Nylas({ apiKey, apiUri });
  const queryParams = { calendarId };
  const startTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  const operations: BatchEventOperation[] = [
    {
      method: 'create',
      body: {
        title: 'Standup',
        when: { startTime, endTime: startTime + 30 * 60 },
      },
    },
    { method: 'update', eventId: updateEventId, body: { title: 'Renamed' } },
    { method: 'delete', eventId: deleteEventId },
  ];
  const result = await nylas.events.batch({
    identifier: grantId,
    queryParams,
    requestBody: { operations },
  });

  // HTTP 207 returns normally, even if every operation failed.
  // Results correspond to operations at the same index.
  const retryOperations: BatchEventOperation[] = [];
  let retryDelay = 0;
  for (const [index, item] of result.data.entries()) {
    console.log(`Operation ${index}: ${item.status}`);

    // Never retry: the provider created the event before a later step failed.
    if (item.providerEventCreated) continue;
    if (item.status !== 429 && item.status !== 503) continue;
    if (
      typeof item.retryAfter !== 'number' ||
      !Number.isFinite(item.retryAfter) ||
      item.retryAfter < 0
    ) {
      continue;
    }

    retryOperations.push(operations[index]);
    retryDelay = Math.max(retryDelay, item.retryAfter);
  }

  // One caller-controlled retry after the provider delay, including zero.
  // Longer delays need application scheduling; Node timers would truncate them.
  if (retryOperations.length === 0 || retryDelay * 1000 > 2 ** 31 - 1) return;
  await new Promise((resolve) => setTimeout(resolve, retryDelay * 1000));
  const retried = await nylas.events.batch({
    identifier: grantId,
    queryParams,
    requestBody: { operations: retryOperations },
  });
  for (const [index, item] of retried.data.entries()) {
    console.log(`Retry ${index}: ${item.status}`);
  }
}

if (require.main === module) {
  main().catch(() => {
    console.error('Unable to complete the batch example.');
    process.exitCode = 1;
  });
}
