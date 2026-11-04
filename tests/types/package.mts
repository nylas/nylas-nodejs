import Nylas, {
  Attachment,
  NylasApiError,
  NylasOAuthError,
  NylasSdkTimeoutError,
  WhenType,
} from 'nylas';

const client: Nylas = new Nylas({ apiKey: 'test-key' });
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
void attachment;
void apiError;
void NylasOAuthError;
void NylasSdkTimeoutError;
void WhenType;
