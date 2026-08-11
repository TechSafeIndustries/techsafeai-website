import crypto from 'node:crypto';

function canonicalise(value) {
  if (Array.isArray(value)) return value.map(canonicalise);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalise(value[key])]));
  }
  return value;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function deriveEnquiryId(validatedData, startedAt) {
  const stableInput = JSON.stringify(canonicalise({ startedAt: Number(startedAt), data: validatedData }));
  return `web_${sha256(stableInput).slice(0, 40)}`;
}

export function isValidEnquiryId(value) {
  return typeof value === 'string' && /^web_[0-9a-f]{40}$/i.test(value);
}

export function contextFingerprint(validatedData) {
  return sha256(JSON.stringify(canonicalise(validatedData)));
}

export function serialiseWorkpacketStub(workpacketStub) {
  return JSON.stringify(workpacketStub);
}
