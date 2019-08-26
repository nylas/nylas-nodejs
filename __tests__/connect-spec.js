import Nylas from '../src/nylas';

describe('Connect', () => {

  const name = 'Connect Test';
  const password = 'connecting123';
  const scopes = 'email, calendar, contacts';
  const exchangeEmail = 'connect_test@outlook.com';
  const gmailEmail = 'connect_test@gmail.com';
  const imapEmail = 'connect_test@yahoo.com';
  const o365Email = 'connect_test@nylatest.onmicrosoft.com';
  const CLIENT_ID = 'abc';
  const authorizeParams = ((email, provider, settings, reauthAccountId) => {
  	return {
	  	name: 'Connect Test',
	  	emailAddress: email,
	  	provider: provider,
	  	settings: settings,
	  	scopes: scopes,
	  	reauthAccountId: reauthAccountId,	
  	}
  });
  const authorizeJSON = {
  	code: 'bOjq4Wt9ZAlCy0CSbVeDGDQ5PquytC',
  }
  beforeEach(() => {
    Nylas.config({
      clientId: CLIENT_ID,
      clientSecret: 'xyz',
    });
  });

  describe('authorize', () => {
    test('Should throw an error when the clientId is not passed in to Nylas.config()', done => {
      // expect.assertions(1);
      Nylas.config({});
      Nylas.connect.authorize(authorizeParams(exchangeEmail, 'exchange', { username: exchangeEmail, password: password })).then(resp => {
        console.log('RESP: ', resp)
        // expect(resp).toThrow();
        done();
        })
    });

    test('Should do a POST request to /connect/authorize', done => {
      expect.assertions(2);
      Nylas.connect.connection.request = jest.fn(() =>
        Promise.resolve(authorizeJSON)
      );
      Nylas.connect.authorize(authorizeParams(exchangeEmail, 'exchange', { username: exchangeEmail, password: password }, '1234xyz')).then(resp => {
        expect(resp).toEqual(authorizeJSON);
        expect(Nylas.connect.connection.request).toHaveBeenCalledWith({
          method: 'POST',
          path: '/connect/authorize',
          body: {
          	client_id: CLIENT_ID,
          	name: name,
          	email_address: exchangeEmail,
          	provider: 'exchange',
          	settings: { username: exchangeEmail, password: password },
          	scopes: scopes,
          	reauth_account_id: '1234xyz', 
          }
        });
        done();
        })
    });

    test('Should be successful if no reauthAccountId param is passed in', done => {
      expect.assertions(2);
	  Nylas.connect.connection.request = jest.fn(() =>
	   Promise.resolve(authorizeJSON)
	  );
	  Nylas.connect.authorize(authorizeParams(exchangeEmail, 'exchange', { username: exchangeEmail, password: password })).then(resp => {
	   expect(resp).toEqual(authorizeJSON);
	   expect(Nylas.connect.connection.request).toHaveBeenCalledWith({
	     method: 'POST',
	     path: '/connect/authorize',
	     body: {
	     	client_id: CLIENT_ID,
	     	name: name,
	     	email_address: exchangeEmail,
	     	provider: 'exchange',
	     	settings: { username: exchangeEmail, password: password },
	     	scopes: scopes,
	     	reauth_account_id: undefined, 
	     }
	   });
	   done();
	   })
    });

    // test('Should authorize any provider', done => {
    //   expect.assertions(2);
  	 //  Nylas.connect.connection.request = jest.fn(() =>
  	 //   Promise.resolve(authorizeJSON)
  	 //  );
  	 //  Nylas.connect.authorize(authorizeParams(exchangeEmail, 'exchange', { username: exchangeEmail, password: password })).then(resp => {
  	 //   expect(resp).toEqual(authorizeJSON);
  	 //   expect(Nylas.connect.connection.request).toHaveBeenCalledWith({
  	 //     method: 'POST',
  	 //     path: '/connect/authorize',
  	 //     body: {
  	 //     	client_id: CLIENT_ID,
  	 //     	name: name,
  	 //     	email_address: exchangeEmail,
  	 //     	provider: 'exchange',
  	 //     	settings: { username: exchangeEmail, password: password },
  	 //     	scopes: scopes,
  	 //     	reauth_account_id: undefined, 
  	 //     }
  	 //   });
  	 //   done();
  	 //   })
    // });
  
  });
});