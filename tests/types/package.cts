import Nylas, {
  Attachment,
  NylasApiError,
  NylasOAuthError,
  NylasSdkTimeoutError,
  WhenType,
} from 'nylas';
import NylasConstructor = require('nylas');

const client: Nylas = new Nylas({ apiKey: 'test-key' });
const classicClient: NylasConstructor = new NylasConstructor({
  apiKey: 'test-key',
});
const classicDefaultClient: NylasConstructor = new NylasConstructor.default({
  apiKey: 'test-key',
});
const attachment: Attachment = {
  id: 'attachment-id',
  grantId: 'grant-id',
  filename: 'test.txt',
  contentType: 'text/plain',
};
const apiError: NylasApiError = new NylasApiError({
  requestId: 'test-request',
  error: { type: 'test', message: 'test' },
});

void client;
void classicClient;
void classicDefaultClient;
void attachment;
void apiError;
void NylasOAuthError;
void NylasSdkTimeoutError;
void WhenType;
