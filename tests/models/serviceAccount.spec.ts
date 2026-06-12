import { createVerify, generateKeyPairSync } from 'node:crypto';
import {
  canonicalJson,
  generateNonce,
  ServiceAccountSigner,
} from '../../src/models/serviceAccount';

describe('ServiceAccountSigner', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const privateKeyPem = privateKey.export({
    type: 'pkcs1',
    format: 'pem',
  }) as string;
  const pkcs8PrivateKeyPem = privateKey.export({
    type: 'pkcs8',
    format: 'pem',
  }) as string;

  it('should serialize JSON canonically with sorted keys', () => {
    expect(
      canonicalJson({
        z: 1,
        a: { y: true, x: 'value' },
        list: [{ b: 2, a: 1 }],
      })
    ).toEqual('{"a":{"x":"value","y":true},"list":[{"a":1,"b":2}],"z":1}');
  });

  it('should omit undefined and function object fields while preserving array slots', () => {
    expect(
      canonicalJson({
        kept: 'value',
        omitted: undefined,
        ignored: () => 'value',
        list: [undefined, () => 'value', 'ok'],
      })
    ).toEqual('{"kept":"value","list":[null,null,"ok"]}');
  });

  it('should reject non-finite numbers', () => {
    expect(() => canonicalJson({ value: Number.NaN })).toThrow(
      'Service account signing only supports finite numbers.'
    );
  });

  it('should generate secure alphanumeric nonces', () => {
    const nonce = generateNonce(24);

    expect(nonce).toHaveLength(24);
    expect(nonce).toMatch(/^[A-Za-z0-9]+$/);
    expect(() => generateNonce(0)).toThrow(
      'Nonce length must be a positive integer.'
    );
  });

  it('should accept base64-encoded PEM private keys', () => {
    const signer = new ServiceAccountSigner({
      privateKeyPem: Buffer.from(pkcs8PrivateKeyPem, 'utf8').toString('base64'),
      privateKeyId: 'service-account-key-id',
    });

    const signed = signer.buildHeaders({
      method: 'GET',
      path: '/v3/admin/domains',
      timestamp: 1742932766,
      nonce: 'nonce-1234567890123456',
    });

    expect(signed.headers['X-Nylas-Signature']).toEqual(expect.any(String));
  });

  it('should reject non-RSA private keys', () => {
    const { privateKey: ecPrivateKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
    });

    expect(
      () =>
        new ServiceAccountSigner({
          privateKeyPem: ecPrivateKey.export({
            type: 'pkcs8',
            format: 'pem',
          }),
          privateKeyId: 'service-account-key-id',
        })
    ).toThrow('Service account private key must be RSA.');
  });

  it('should create service account signing headers', () => {
    const signer = new ServiceAccountSigner({
      privateKeyPem,
      privateKeyId: 'service-account-key-id',
    });

    const signed = signer.buildHeaders({
      method: 'POST',
      path: '/v3/admin/domains',
      body: {
        name: 'My transactional domain',
        domain_address: 'mail.example.com',
      },
      timestamp: 1742932766,
      nonce: 'nonce-1234567890123456',
    });

    expect(signed.headers).toEqual({
      'X-Nylas-Kid': 'service-account-key-id',
      'X-Nylas-Nonce': 'nonce-1234567890123456',
      'X-Nylas-Timestamp': '1742932766',
      'X-Nylas-Signature': expect.any(String),
    });
    expect(signed.serializedBody).toEqual(
      '{"domain_address":"mail.example.com","name":"My transactional domain"}'
    );

    const canonicalEnvelope = canonicalJson({
      method: 'post',
      nonce: 'nonce-1234567890123456',
      path: '/v3/admin/domains',
      payload:
        '{"domain_address":"mail.example.com","name":"My transactional domain"}',
      timestamp: 1742932766,
    });
    const verifier = createVerify('RSA-SHA256');
    verifier.update(canonicalEnvelope);

    expect(
      verifier.verify(publicKey, signed.headers['X-Nylas-Signature'], 'base64')
    ).toBe(true);
  });

  it('should produce deterministic signatures with fixed timestamp and nonce', () => {
    const signer = new ServiceAccountSigner({
      privateKeyPem,
      privateKeyId: 'service-account-key-id',
    });
    const request = {
      method: 'GET',
      path: '/v3/admin/domains/domain123',
      timestamp: 1742932766,
      nonce: 'nonce-1234567890123456',
    };

    const first = signer.buildHeaders(request);
    const second = signer.buildHeaders(request);

    expect(second).toEqual(first);
    expect(first.serializedBody).toBeUndefined();
  });
});
