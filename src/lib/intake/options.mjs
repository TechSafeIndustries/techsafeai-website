export const CHALLENGES = [
  ['AUDIT_ASSURANCE', 'Prepare for an audit or assurance review'],
  ['CONTROL_VERIFICATION', 'Prove critical controls actually work'],
  ['SYSTEM_EVIDENCE_FRAGMENTATION', 'Fix fragmented systems, records or evidence'],
  ['CONTRACTOR_COMPETENCY', 'Strengthen contractor, induction or competency controls'],
  ['RECURRING_FINDINGS_INCIDENTS', 'Stop recurring incidents, findings or corrective-action failures'],
  ['AI_READINESS_GOVERNANCE', 'Introduce AI with appropriate governance'],
  ['AI_INFORMATION_SECURITY', 'Protect information while using AI'],
  ['WORKFLOW_ADMIN_DECISIONS', 'Reduce admin and turn information into decisions'],
  ['TRANSFORMATION_VALUE', 'Move a stalled improvement or AI initiative into verified value'],
  ['INTERNAL_AI_CAPABILITY', 'Build internal AI leadership and capability'],
  ['OTHER_UNSURE', 'Something else or not sure where it fits']
];

export const INDUSTRIES = [
  ['MINING_RESOURCES', 'Mining & Resources'],
  ['CONSTRUCTION_INFRASTRUCTURE', 'Construction & Infrastructure'],
  ['OTHER_REGULATED', 'Other Risk-Intensive / Regulated Operations'],
  ['OTHER_UNSURE', 'Other / Not Sure']
];

export const ACTIVITIES = [
  ['SITE_FIELD', 'Site / field operations'],
  ['PLANT_PROCESSING', 'Plant / processing'],
  ['PROJECT_CONSTRUCTION', 'Project / construction delivery'],
  ['MAINTENANCE_ASSET', 'Maintenance / asset management'],
  ['TRANSPORT_LOGISTICS', 'Transport / logistics'],
  ['WAREHOUSING', 'Warehousing'],
  ['ASSURANCE_AUDIT', 'Assurance / audit'],
  ['CONTRACTOR_MANAGEMENT', 'Contractor management'],
  ['CORPORATE_GOVERNANCE', 'Corporate / governance'],
  ['DIGITAL_AI_TECHNOLOGY', 'Digital / AI / technology'],
  ['OTHER', 'Other']
];

export const OPERATING_ENVIRONMENTS = [
  ['SITE_FIELD', 'Site / field operations'],
  ['PLANT_PROCESSING', 'Plant / processing'],
  ['CONSTRUCTION_PROJECT', 'Construction / project environments'],
  ['TRANSPORT_LOGISTICS', 'Transport / logistics'],
  ['WAREHOUSING', 'Warehousing'],
  ['INFRASTRUCTURE_UTILITIES', 'Infrastructure / utilities'],
  ['CONTROLLED_OFFICE', 'Controlled office / executive environments'],
  ['MIXED', 'Mixed environments']
];

export const ORGANISATION_SIZES = [
  ['LT50', 'Fewer than 50 people'],
  ['50_249', '50–249'],
  ['250_999', '250–999'],
  ['1000_4999', '1,000–4,999'],
  ['5000_PLUS', '5,000+'],
  ['UNSURE', 'Not sure']
];

export const JURISDICTION_SCOPES = [
  ['SINGLE_JURISDICTION', 'Single jurisdiction'],
  ['MULTI_JURISDICTION', 'Multiple jurisdictions'],
  ['UNKNOWN', 'Not sure']
];

export const TRIGGERS = [
  ['AUDIT_REVIEW', 'Upcoming audit, assurance or external review'],
  ['INCIDENT_FINDING', 'Incident, finding or recurring issue'],
  ['CHANGE_PROJECT', 'Operational change or major project'],
  ['AI_INITIATIVE', 'AI or technology initiative'],
  ['EXECUTIVE_PRIORITY', 'Executive / board priority'],
  ['EFFICIENCY_VALUE', 'Workflow, cost or productivity pressure'],
  ['OTHER', 'Other / not sure']
];

export const TIMING = [
  ['IMMEDIATE', 'Immediate / current issue'],
  ['WITHIN_30_DAYS', 'Within 30 days'],
  ['ONE_TO_THREE_MONTHS', '1–3 months'],
  ['THREE_TO_SIX_MONTHS', '3–6 months'],
  ['SIX_PLUS_MONTHS', '6+ months'],
  ['UNSURE', 'Not sure']
];

export const READINESS = [
  ['YES', 'Yes'],
  ['NO', 'No'],
  ['UNSURE', 'Not sure']
];

export const SECURITY_LEVELS = [
  ['STANDARD', 'Standard business information'],
  ['HEIGHTENED', 'Heightened confidentiality likely'],
  ['FORMAL_REVIEW', 'Formal security review likely'],
  ['DATA_RESIDENCY', 'Data residency requirements may apply'],
  ['UNSURE', 'Not sure']
];

export const optionValues = (options) => new Set(options.map(([value]) => value));
export const optionLabel = (options, value) => options.find(([key]) => key === value)?.[1] ?? value;
