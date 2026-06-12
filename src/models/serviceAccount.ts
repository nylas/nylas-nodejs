import {
  createPrivateKey,
  createSign,
  KeyObject,
  randomInt,
} from 'node:crypto';

const NONCE_LENGTH = 20;
const NONCE_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const SIGNED_BODY_METHODS = new Set(['post', 'put', 'patch']);

/**
 * Configuration for Nylas Service Account request signing.
 */
export interface ServiceAccountSignerConfig {
  /**
   * RSA private key in PEM format. Base64-encoded PEM is also accepted.
   */
  privateKeyPem: string | Buffer;
  /**
   * The `private_key_id` from the Nylas Service Account credentials file.
   */
  privateKeyId: string;
}

/**
 * Inputs for creating Nylas Service Account signing headers.
 */
export interface BuildServiceAccountHeadersParams {
  method: string;
  path: string;
  body?: Record<string, unknown>;
  timestamp?: number;
  nonce?: string;
}

/**
 * Nylas Service Account signing headers and the canonical JSON body, when the
 * request method signs a payload.
 */
export interface ServiceAccountSignedRequest {
  headers: Record<string, string>;
  serializedBody?: string;
}

function normalizePrivateKey(privateKeyPem: string | Buffer): string | Buffer {
  if (Buffer.isBuffer(privateKeyPem) || privateKeyPem.includes('BEGIN')) {
    return privateKeyPem;
  }

  return Buffer.from(privateKeyPem, 'base64').toString('utf8');
}

function loadRsaPrivateKey(privateKeyPem: string | Buffer): KeyObject {
  const privateKey = createPrivateKey(normalizePrivateKey(privateKeyPem));
  if (privateKey.asymmetricKeyType !== 'rsa') {
    throw new Error('Service account private key must be RSA.');
  }
  return privateKey;
}

export function generateNonce(length = NONCE_LENGTH): string {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error('Nonce length must be a positive integer.');
  }

  let nonce = '';
  for (let i = 0; i < length; i++) {
    nonce += NONCE_ALPHABET[randomInt(NONCE_ALPHABET.length)];
  }
  return nonce;
}

function canonicalValue(value: unknown): string {
  if (value === undefined || typeof value === 'function') {
    return 'null';
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalValue).join(',')}]`;
  }

  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error('Service account signing only supports finite numbers.');
  }

  if (value && typeof value === 'object') {
    const data = value as Record<string, unknown>;
    return `{${Object.keys(data)
      .filter((key) => {
        const item = data[key];
        return item !== undefined && typeof item !== 'function';
      })
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalValue(data[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

/**
 * Serialize JSON deterministically with sorted object keys and no extra
 * whitespace, matching Nylas Service Account signing requirements.
 */
export function canonicalJson(data: Record<string, unknown>): string {
  return canonicalValue(data);
}

/**
 * Generates Nylas Service Account request signing headers.
 */
export class ServiceAccountSigner {
  private readonly privateKey: KeyObject;
  private readonly privateKeyId: string;

  constructor({ privateKeyPem, privateKeyId }: ServiceAccountSignerConfig) {
    this.privateKey = loadRsaPrivateKey(privateKeyPem);
    this.privateKeyId = privateKeyId;
  }

  public buildHeaders({
    method,
    path,
    body,
    timestamp = Math.floor(Date.now() / 1000),
    nonce = generateNonce(),
  }: BuildServiceAccountHeadersParams): ServiceAccountSignedRequest {
    const methodLower = method.toLowerCase();
    const serializedBody =
      body && SIGNED_BODY_METHODS.has(methodLower)
        ? canonicalJson(body)
        : undefined;
    const signingEnvelope: Record<string, unknown> = {
      method: methodLower,
      nonce,
      path,
      timestamp,
    };

    if (serializedBody) {
      signingEnvelope.payload = serializedBody;
    }

    const signature = createSign('RSA-SHA256')
      .update(canonicalJson(signingEnvelope))
      .sign(this.privateKey, 'base64');

    return {
      headers: {
        'X-Nylas-Kid': this.privateKeyId,
        'X-Nylas-Nonce': nonce,
        'X-Nylas-Timestamp': String(timestamp),
        'X-Nylas-Signature': signature,
      },
      serializedBody,
    };
  }
}
