import crypto from 'node:crypto';

export function createEnquiryId() {
  return crypto.randomUUID();
}

export function isValidEnquiryId(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function canonicalise(value) {
  if (Array.isArray(value)) return value.map(canonicalise);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalise(value[key])]));
  }
  return value;
}

export function contextFingerprint(validatedData) {
  const canonical = JSON.stringify(canonicalise(validatedData));
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

export function serialiseWorkpacketStub(workpacketStub) {
  return JSON.stringify(workpacketStub);
}
