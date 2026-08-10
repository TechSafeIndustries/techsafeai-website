import {
  ACTIVITIES,
  CHALLENGES,
  INDUSTRIES,
  JURISDICTION_SCOPES,
  OPERATING_ENVIRONMENTS,
  ORGANISATION_SIZES,
  READINESS,
  SECURITY_LEVELS,
  TIMING,
  TRIGGERS,
  optionLabel,
  optionValues
} from '../../lib/intake/options.mjs';

const allowed = {
  challenge: optionValues(CHALLENGES),
  industry: optionValues(INDUSTRIES),
  activity: optionValues(ACTIVITIES),
  environment: optionValues(OPERATING_ENVIRONMENTS),
  organisationSize: optionValues(ORGANISATION_SIZES),
  jurisdictionScope: optionValues(JURISDICTION_SCOPES),
  trigger: optionValues(TRIGGERS),
  timing: optionValues(TIMING),
  readiness: optionValues(READINESS),
  security: optionValues(SECURITY_LEVELS)
};

const text = (value) => typeof value === 'string' ? value.trim() : '';
const bool = (value) => value === true;

function add(errors, field, message) {
  if (!errors[field]) errors[field] = message;
}

function validateText(errors, field, value, { required = false, min = 0, max }) {
  const v = text(value);
  if (required && !v) add(errors, field, 'This field is required.');
  if (v && min && v.length < min) add(errors, field, `Enter at least ${min} characters.`);
  if (v && max && v.length > max) add(errors, field, `Use no more than ${max} characters.`);
  return v;
}

function validateChoice(errors, field, value, set, required = true) {
  const v = text(value);
  if (required && !v) add(errors, field, 'Choose an option.');
  if (v && !set.has(v)) add(errors, field, 'Choose a valid option.');
  return v;
}

export function validateEnquiryPayload(raw) {
  const errors = {};
  const value = raw && typeof raw === 'object' ? raw : {};

  const challengeKey = validateChoice(errors, 'challenge.key', value.challenge?.key, allowed.challenge);
  const problemSummary = validateText(errors, 'challenge.problemSummary', value.challenge?.problemSummary, { required: true, min: 10, max: 300 });

  const organisationName = validateText(errors, 'organisation.name', value.organisation?.name, { required: true, min: 2, max: 120 });
  const organisationSize = validateChoice(errors, 'organisation.sizeBand', value.organisation?.sizeBand, allowed.organisationSize);
  const footprint = validateText(errors, 'organisation.footprint', value.organisation?.footprint, { max: 160 });

  const industryKey = validateChoice(errors, 'industry.key', value.industry?.key, allowed.industry);
  const otherIndustry = validateText(errors, 'industry.other', value.industry?.other, { max: 100 });
  if (industryKey === 'OTHER_REGULATED' && !otherIndustry) add(errors, 'industry.other', 'Describe the industry or regulated operation.');

  const activityKey = validateChoice(errors, 'activity.key', value.activity?.key, allowed.activity);
  const otherActivity = validateText(errors, 'activity.other', value.activity?.other, { max: 120 });
  if (activityKey === 'OTHER' && !otherActivity) add(errors, 'activity.other', 'Describe the activity.');
  const multiSector = bool(value.industry?.multiSector);

  const environment = Array.isArray(value.operatingEnvironment)
    ? [...new Set(value.operatingEnvironment.map(text).filter(Boolean))]
    : [];
  if (!environment.length) add(errors, 'operatingEnvironment', 'Choose at least one operating environment.');
  if (environment.some((item) => !allowed.environment.has(item))) add(errors, 'operatingEnvironment', 'Choose valid operating environments.');

  const jurisdictionScope = validateChoice(errors, 'jurisdiction.scope', value.jurisdiction?.scope, allowed.jurisdictionScope);
  const countries = validateText(errors, 'jurisdiction.countries', value.jurisdiction?.countries, { max: 120 });
  const regions = validateText(errors, 'jurisdiction.regions', value.jurisdiction?.regions, { max: 160 });
  if (jurisdictionScope !== 'UNKNOWN' && !countries) add(errors, 'jurisdiction.countries', 'Enter the country or countries.');

  const desiredOutcome = validateText(errors, 'outcome.desiredOutcome', value.outcome?.desiredOutcome, { required: true, min: 10, max: 300 });
  const trigger = validateChoice(errors, 'outcome.trigger', value.outcome?.trigger, allowed.trigger);
  const timing = validateChoice(errors, 'outcome.timing', value.outcome?.timing, allowed.timing);

  const capability = {};
  for (const key of ['safetyCompliance', 'aiTechnology', 'accountableSponsor', 'aitlAvailable', 'externalAdviser']) {
    capability[key] = validateChoice(errors, `internalCapability.${key}`, value.internalCapability?.[key], allowed.readiness);
  }

  const securityLevel = validateChoice(errors, 'security.level', value.security?.level, allowed.security);
  const securityNote = validateText(errors, 'security.note', value.security?.note, { max: 200 });
  const securityAcknowledged = bool(value.security?.acknowledged);
  if (!securityAcknowledged) add(errors, 'security.acknowledged', 'You must acknowledge the security boundary before submission.');

  const contactName = validateText(errors, 'contact.name', value.contact?.name, { required: true, min: 2, max: 100 });
  const email = validateText(errors, 'contact.email', value.contact?.email, { required: true, max: 254 }).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) add(errors, 'contact.email', 'Enter a valid email address.');
  const telephone = validateText(errors, 'contact.telephone', value.contact?.telephone, { max: 40 });

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: {
      challenge: { key: challengeKey, problemSummary },
      organisation: { name: organisationName, sizeBand: organisationSize, footprint },
      industry: { key: industryKey, other: otherIndustry, multiSector },
      activity: { key: activityKey, other: otherActivity },
      operatingEnvironment: environment,
      jurisdiction: { scope: jurisdictionScope, countries, regions },
      outcome: { desiredOutcome, trigger, timing },
      internalCapability: capability,
      security: { level: securityLevel, note: securityNote, acknowledged: securityAcknowledged },
      contact: { name: contactName, email, telephone }
    }
  };
}

export function buildWorkpacketStub(data, now = new Date()) {
  const industryStatus =
    data.industry.key === 'MINING_RESOURCES' || data.industry.key === 'CONSTRUCTION_INFRASTRUCTURE'
      ? 'SUPPORTED'
      : data.industry.key === 'OTHER_REGULATED'
        ? 'PACK_REQUIRED'
        : 'UNCLASSIFIED';

  const activityStatus = data.activity.key === 'OTHER' ? 'PACK_REQUIRED' : 'SUPPORTED';

  return {
    workpacketStubVersion: '1.0',
    createdAt: now.toISOString(),
    challenge: {
      key: data.challenge.key,
      label: optionLabel(CHALLENGES, data.challenge.key),
      problemSummary: data.challenge.problemSummary
    },
    problemContext: data.challenge.problemSummary,
    organisationContext: data.organisation,
    industryContext: {
      key: data.industry.key,
      label: optionLabel(INDUSTRIES, data.industry.key),
      other: data.industry.other,
      multiSector: data.industry.multiSector
    },
    activityContext: {
      key: data.activity.key,
      label: optionLabel(ACTIVITIES, data.activity.key),
      other: data.activity.other
    },
    operatingEnvironment: data.operatingEnvironment.map((key) => ({
      key,
      label: optionLabel(OPERATING_ENVIRONMENTS, key)
    })),
    jurisdictionContext: data.jurisdiction,
    desiredOutcome: data.outcome.desiredOutcome,
    timing: {
      trigger: data.outcome.trigger,
      triggerLabel: optionLabel(TRIGGERS, data.outcome.trigger),
      timing: data.outcome.timing,
      timingLabel: optionLabel(TIMING, data.outcome.timing)
    },
    internalCapability: data.internalCapability,
    securityDeclaration: {
      level: data.security.level,
      levelLabel: optionLabel(SECURITY_LEVELS, data.security.level),
      note: data.security.note,
      acknowledged: true
    },
    contact: data.contact,
    contextStatuses: {
      industryScopeType: data.industry.multiSector ? 'MULTI_SECTOR' : (data.industry.key === 'OTHER_UNSURE' ? 'UNKNOWN' : 'SINGLE_SECTOR'),
      industryContextStatus: industryStatus,
      activityContextStatus: activityStatus,
      jurisdictionScopeType: data.jurisdiction.scope,
      applicability: 'NOT_ASSESSED'
    },
    humanValidationRequired: true
  };
}
