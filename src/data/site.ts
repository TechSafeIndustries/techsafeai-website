export const site = {
  name: 'TechSafeAI',
  canonicalBase: 'https://techsafe.ai',
  description:
    'AI-enabled safety, compliance, risk and operational transformation consultancy for risk-intensive and regulated organisations.',
  proposition:
    'TechSafeAI works with risk-intensive and regulated organisations, with initial sector depth in Mining & Resources and Construction & Infrastructure.'
} as const;

export const painPoints = [
  { key: 'AUDIT_ASSURANCE', label: 'Prepare for an audit or assurance review' },
  { key: 'CONTROL_VERIFICATION', label: 'Prove critical controls actually work' },
  { key: 'SYSTEM_EVIDENCE_FRAGMENTATION', label: 'Fix fragmented systems, records or evidence' },
  { key: 'CONTRACTOR_COMPETENCY', label: 'Strengthen contractor, induction or competency controls' },
  { key: 'RECURRING_FINDINGS_INCIDENTS', label: 'Stop recurring incidents, findings or corrective-action failures' },
  { key: 'AI_READINESS_GOVERNANCE', label: 'Introduce AI with appropriate governance' },
  { key: 'AI_INFORMATION_SECURITY', label: 'Protect information while using AI' },
  { key: 'WORKFLOW_ADMIN_DECISIONS', label: 'Reduce admin and turn information into decisions' },
  { key: 'TRANSFORMATION_VALUE', label: 'Move a stalled improvement or AI initiative into verified value' },
  { key: 'INTERNAL_AI_CAPABILITY', label: 'Build internal AI leadership and capability' },
  { key: 'OTHER_UNSURE', label: 'Something else or not sure where it fits' }
] as const;

export const capabilities = [
  {
    slug: 'safety-compliance-readiness',
    title: 'Safety & Compliance Readiness',
    summary: 'Prepare for scrutiny by clarifying obligations, scope, controls, evidence and ownership.',
    tag: 'Audit / assurance / readiness'
  },
  {
    slug: 'systems-evidence-assurance',
    title: 'Systems & Evidence Assurance',
    summary: 'Connect requirements, records, control verification and operating evidence into a defensible position.',
    tag: 'Evidence / controls / systems'
  },
  {
    slug: 'ai-readiness-governance',
    title: 'AI Readiness & Governance',
    summary: 'Identify where AI may add value, what governs its use and where human verification must remain.',
    tag: 'AI / governance / security'
  },
  {
    slug: 'operational-ai-transformation',
    title: 'Operational & AI Transformation',
    summary: 'Turn findings or stalled initiatives into controlled workflow change, accountable ownership and measurable outcomes.',
    tag: 'DRIVER-6 / transformation / value'
  },
  {
    slug: 'ai-capability-enablement',
    title: 'AI Capability Enablement',
    summary: 'Build internal capability to identify, govern and operate AI-supported work without outsourcing accountability.',
    tag: 'AITL / capability / governance'
  }
] as const;

export const featuredSectors = [
  {
    slug: 'mining-resources',
    title: 'Mining & Resources',
    summary: 'High-consequence work, contractor assurance, critical controls, evidence, operational systems and governed transformation.'
  },
  {
    slug: 'construction-infrastructure',
    title: 'Construction & Infrastructure',
    summary: 'Contractor control, competency, safe systems of work, changing work fronts, assurance and digital workflow improvement.'
  }
] as const;

export const broaderContexts = [
  'Processing & manufacturing',
  'Transport & logistics',
  'Field operations & critical infrastructure',
  'Executive & controlled office environments'
] as const;
