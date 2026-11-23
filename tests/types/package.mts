import Nylas, {
  Attachment,
  CreateNotetakerRequest,
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
const notetakerRequest: CreateNotetakerRequest = {
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  notetakerSettings: {
    name: 'Nylas Notetaker',
    recordingType: 'audio',
    transcription: true,
    summary: true,
    actionItems: true,
  },
};

void attachment;
void notetakerRequest;
void apiError;
void NylasOAuthError;
void NylasSdkTimeoutError;
void WhenType;
