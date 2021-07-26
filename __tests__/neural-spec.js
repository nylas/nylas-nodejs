import Nylas from '../src/nylas';
import File from '../src/models/file';
import NylasConnection from '../src/nylas-connection';
import fetch from 'node-fetch';

jest.mock('node-fetch', () => {
  const { Request, Response } = jest.requireActual('node-fetch');
  const fetch = jest.fn();
  fetch.Request = Request;
  fetch.Response = Response;
  return fetch;
});

describe('Neural', () => {
  let testContext;

  beforeEach(() => {
    Nylas.config({
      clientId: 'myClientId',
      clientSecret: 'myClientSecret',
      apiServer: 'https://api.nylas.com',
    });
    testContext = {};
    testContext.connection = Nylas.with('123');
    jest.spyOn(testContext.connection, 'request');
  });

  describe('Clean Conversation', () => {
    beforeEach(() => {
      const serverResponse = [
        {
          account_id: 'account123',
          body: "<img src='cid:1781777f666586677621' /> This is the body",
          conversation:
            "<img src='cid:1781777f666586677621' /> This is the conversation",
          date: 1624029503,
          from: [
            {
              email: 'swag@nylas.com',
              name: 'Nylas Swag',
            },
          ],
          id: 'abc123',
          model_version: '0.0.1',
          object: 'message',
          provider_name: 'gmail',
          subject: 'Subject',
          to: [
            {
              email: 'me@nylas.com',
              name: 'me',
            },
          ],
        },
      ];

      testContext.connection.neural._request = jest.fn(() =>
        Promise.resolve(serverResponse)
      );
    });

    test('should properly decode object', done => {
      return testContext.connection.neural
        .cleanConversation(['abc123'])
        .then(convoList => {
          expect(convoList.length).toEqual(1);
          const convo = convoList[0];
          // Test message-specific values were parsed
          expect(convo.id).toEqual('abc123');
          expect(convo.body).toEqual(
            "<img src='cid:1781777f666586677621' /> This is the body"
          );

          // Test conversation-specific values were parsed
          expect(convo.conversation).toEqual(
            "<img src='cid:1781777f666586677621' /> This is the conversation"
          );
          expect(convo.modelVersion).toEqual('0.0.1');
          done();
        });
    });

    test('should properly extract all images and return a file', async done => {
      testContext.connection.files.find = jest.fn(a => {
        const fileJson = { id: a };
        return Promise.resolve(new File(testContext.connection, fileJson));
      });
      const convoList = await testContext.connection.neural.cleanConversation([
        'abc123',
      ]);
      return convoList[0].extractImages().then(f => {
        expect(f.length).toEqual(1);
        expect(f[0].id).toEqual('1781777f666586677621');
        done();
      });
    });
  });

  describe('Sentiment Analysis', () => {
    beforeEach(() => {
      const sentiment = {
        account_id: 'abc123',
        processed_length: 17,
        sentiment: 'NEUTRAL',
        sentiment_score: 0.20000000298023224,
        text: 'This is some text',
      };

      testContext.connection.neural._request = jest.fn((path, body) => {
        if (body['message_id']) {
          return Promise.resolve([sentiment]);
        }
        return Promise.resolve(sentiment);
      });
    });

    const evaluateSentiment = convo => {
      expect(convo.accountId).toEqual('abc123');
      expect(convo.processedLength).toEqual(17);
      expect(convo.sentiment).toEqual('NEUTRAL');
      expect(convo.sentimentScore).toEqual(0.20000000298023224);
      expect(convo.text).toEqual('This is some text');
    };

    test('should properly decode object from message', done => {
      return testContext.connection.neural
        .sentimentAnalysisMessage(['abc123'])
        .then(convoList => {
          const sentBody =
            testContext.connection.neural._request.mock.calls[0][1];
          expect(sentBody).toEqual({ message_id: ['abc123'] });
          expect(convoList.length).toEqual(1);
          evaluateSentiment(convoList[0]);
          done();
        });
    });

    test('should properly decode object from text', done => {
      return testContext.connection.neural
        .sentimentAnalysisText('This is some text')
        .then(convo => {
          const sentBody =
            testContext.connection.neural._request.mock.calls[0][1];
          expect(sentBody).toEqual({ text: 'This is some text' });
          evaluateSentiment(convo);
          done();
        });
    });
  });

  describe('Extract Signature', () => {
    beforeEach(() => {
      const serverResponse = [
        {
          account_id: 'account123',
          body:
            "This is the body<div>Nylas Swag</div><div>Software Engineer</div><div>123-456-8901</div><div>swag@nylas.com</div><img src='https://example.com/logo.png' alt='https://example.com/link.html'></a>",
          signature:
            'Nylas Swag\n\nSoftware Engineer\n\n123-456-8901\n\nswag@nylas.com',
          contacts: {
            job_titles: ['Software Engineer'],
            links: [
              {
                description: 'string',
                url: 'https://example.com/link.html',
              },
            ],
            phone_numbers: ['123-456-8901'],
            emails: ['swag@nylas.com'],
            names: [
              {
                first_name: 'Nylas',
                last_name: 'Swag',
              },
            ],
          },
          date: 1624029503,
          from: [
            {
              email: 'swag@nylas.com',
              name: 'Nylas Swag',
            },
          ],
          id: 'abc123',
          model_version: '0.0.1',
          object: 'message',
          provider_name: 'gmail',
          subject: 'Subject',
          to: [
            {
              email: 'me@nylas.com',
              name: 'me',
            },
          ],
        },
      ];

      testContext.connection.neural._request = jest.fn(() =>
        Promise.resolve(serverResponse)
      );
    });

    test('should properly decode both the signature and contact', done => {
      return testContext.connection.neural
        .extractSignature(['abc123'])
        .then(sigList => {
          expect(sigList.length).toEqual(1);
          const sig = sigList[0];
          expect(sig.signature).toEqual(
            'Nylas Swag\n\nSoftware Engineer\n\n123-456-8901\n\nswag@nylas.com'
          );
          expect(sig.modelVersion).toEqual('0.0.1');

          // Check that the contact object parsed properly
          expect(sig.contacts.jobTitles).toEqual(['Software Engineer']);
          expect(sig.contacts.phoneNumbers).toEqual(['123-456-8901']);
          expect(sig.contacts.emails).toEqual(['swag@nylas.com']);

          // Check if the links parsed properly
          expect(sig.contacts.links.length).toEqual(1);
          expect(sig.contacts.links[0].description).toEqual('string');
          expect(sig.contacts.links[0].url).toEqual(
            'https://example.com/link.html'
          );

          // Check if the contact parsed properly
          expect(sig.contacts.names.length).toEqual(1);
          expect(sig.contacts.names[0].firstName).toEqual('Nylas');
          expect(sig.contacts.names[0].lastName).toEqual('Swag');
          done();
        });
    });

    test('should properly convert contact in signature to contact object', done => {
      return testContext.connection.neural
        .extractSignature(['abc123'])
        .then(sigList => {
          const contact = sigList[0].contacts.toContactObject();

          expect(contact.givenName).toEqual('Nylas');
          expect(contact.surname).toEqual('Swag');
          expect(contact.jobTitle).toEqual('Software Engineer');
          expect(contact.emailAddresses.length).toEqual(1);
          expect(contact.emailAddresses[0].email).toEqual('swag@nylas.com');
          expect(contact.phoneNumbers.length).toEqual(1);
          expect(contact.phoneNumbers[0].number).toEqual('123-456-8901');
          expect(contact.webPages.length).toEqual(1);
          expect(contact.webPages[0].url).toEqual(
            'https://example.com/link.html'
          );
          done();
        });
    });
  });

  describe('Categorize', () => {
    beforeEach(() => {
      const serverResponse = [
        {
          account_id: 'account123',
          body: 'This is a body',
          categorizer: {
            categorized_at: 1624570089,
            category: 'feed',
            model_version: '6194f733',
            subcategories: ['ooo'],
          },
          date: 1624029503,
          from: [
            {
              email: 'swag@nylas.com',
              name: 'Nylas Swag',
            },
          ],
          id: 'abc123',
          object: 'message',
          provider_name: 'gmail',
          subject: 'Subject',
          to: [
            {
              email: 'me@nylas.com',
              name: 'me',
            },
          ],
        },
      ];

      testContext = {};
      testContext.connection = new NylasConnection('123', { clientId: 'foo' });
      jest.spyOn(testContext.connection, 'request');

      const response = () => {
        return {
          status: 200,
          buffer: () => {
            return Promise.resolve('body');
          },
          json: () => {
            return Promise.resolve(serverResponse);
          },
          headers: new Map(),
        };
      };

      fetch.mockImplementation(() => Promise.resolve(response()));
    });

    const evaluateCategorize = categorizer => {
      expect(categorizer).toBeDefined();
      expect(categorizer.category).toEqual('feed');
      expect(categorizer.categorizedAt).toEqual(
        new Date('2021-06-24T21:28:09Z')
      );
      expect(categorizer.modelVersion).toEqual('6194f733');
      expect(categorizer.subcategories.length).toEqual(1);
      expect(categorizer.subcategories[0]).toEqual('ooo');
    };

    test('should properly decode the category object', done => {
      return testContext.connection.neural
        .categorize(['abc123'])
        .then(categorizeList => {
          expect(categorizeList.length).toEqual(1);
          evaluateCategorize(categorizeList[0].categorizer);
          done();
        });
    });

    test('should properly call recategorize and return a new NeuralCategorize object', async done => {
      const categorizeList = await testContext.connection.neural.categorize([
        'abc123',
      ]);
      const newCategorize = await categorizeList[0].reCategorize('feed');
      const options = testContext.connection.request.mock.calls[1][0];

      expect(options.url.toString()).toEqual(
        'https://api.nylas.com/neural/categorize/feedback'
      );
      expect(options.method).toEqual('POST');
      expect(JSON.parse(options.body)).toEqual({
        message_id: 'abc123',
        category: 'feed',
      });
      evaluateCategorize(newCategorize.categorizer);
      done();
    });
  });

  describe('OCR', () => {
    beforeEach(() => {
      const serverResponse = {
        account_id: 'account123',
        content_type: 'application/pdf',
        filename: 'sample.pdf',
        id: 'abc123',
        object: 'file',
        ocr: ['This is page 1', 'This is page 2'],
        processed_pages: 2,
        size: 20,
      };

      testContext.connection.neural._request = jest.fn(() =>
        Promise.resolve(serverResponse)
      );
    });

    test('should properly decode the ocr object', done => {
      return testContext.connection.neural.ocrRequest('abc123').then(file => {
        expect(file.ocr.length).toEqual(2);
        expect(file.ocr[0]).toEqual('This is page 1');
        expect(file.ocr[1]).toEqual('This is page 2');
        expect(file.processedPages).toEqual(2);
        done();
      });
    });
  });
});
