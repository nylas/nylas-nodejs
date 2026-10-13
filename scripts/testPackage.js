const assert = require('node:assert/strict');

async function testPackage() {
  const commonjs = require('nylas');
  const esm = await import('nylas');

  assert.equal(commonjs, commonjs.default);
  for (const Nylas of [commonjs, esm.default]) {
    const nylas = new Nylas({ apiKey: 'test-key' });
    assert.equal(typeof nylas.messages.send, 'function');
    const { secret, secretHash, url } = nylas.auth.urlForOAuth2PKCE({
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
    });
    assert(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        secret
      ),
      'PKCE must generate a UUID v4'
    );
    assert.equal(typeof secretHash, 'string');
    assert(secretHash.length > 0, 'PKCE must generate a challenge');
    assert.equal(new URL(url).searchParams.get('code_challenge'), secretHash);
  }
}

testPackage().catch(() => {
  console.error('Package compatibility check failed');
  process.exitCode = 1;
});
