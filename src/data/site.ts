export const site = {
  name: 'TechSafeAI',
  canonicalBase: 'https://techsafe.ai',
  description:
    'TechSafeAI is a governed Operational Intelligence platform for high-risk industries, delivered through Product Services and Consultancy Services.',
  proposition:
    'TechSafeAI works with risk-intensive and regulated organisations, with initial sector depth in Mining & Resources and Construction & Infrastructure.'
} as const;

// Phase 9 (Mission 10, 2026-08-28): service areas for the /consulting route.
export const consultingServices = [
  { title: 'Operational Risk & Assurance', summary: 'Structured review of operational risk exposure, controls and assurance activity.' },
  { title: 'HSSE Advisory', summary: 'Health, safety, security and environmental advisory grounded in operating context, not templates.' },
  { title: 'Operational Reviews', summary: 'Independent review of workflow, ownership and operating effectiveness.' },
  { title: 'Control Verification', summary: 'Check whether critical controls actually work, with evidence, not assumption.' },
  { title: 'Incident Investigation & Learning', summary: 'Investigate incidents and turn findings into learning, not just closed actions.' },
  { title: 'Governance & Management Systems', summary: 'Design and strengthen the management systems that govern operational decisions.' },
  { title: 'Digital & AI Transformation', summary: 'Move stalled digital or AI initiatives into governed, accountable operating change.' },
  { title: 'AI & Operational Intelligence Advisory', summary: 'Advise on where AI and Operational Intelligence genuinely add value, and where they do not.' },
  { title: 'TechSafeAI Implementation', summary: 'Human-led support to implement TechSafeAI Product Services inside your operating environment.' },
  { title: 'Custom Engagements', summary: 'Founder-approved specialist consultancy scoped to a specific operating problem.' }
] as const;

// Phase 9 (Mission 10, 2026-08-28): capability tiers for the /product route.
export const productTiers = {
  core: [
    { title: 'Operational Intelligence Cockpit', summary: 'A governed view of operational context drawn from the systems you already run.' },
    { title: 'SAI', summary: 'Systems Assistant Intelligence. SAI assists the human — it explains and helps, it does not decide.' },
    { title: 'Evidence Intelligence', summary: 'Surfaces what evidence exists, what is missing, and where a claim is not yet supported.' },
    { title: 'Human Review', summary: 'Consequential judgement stays with accountable people. TechSafeAI supports the review, not the decision.' },
    { title: '3P Structure & Coverage', summary: 'People, Property and Planet as connected operational-domain coverage beneath the platform.' }
  ],
  assurance: [
    { title: 'Risk & Activity Intelligence', summary: 'Connects activities to the risks and controls that govern them.' },
    { title: 'Control Assurance', summary: 'Structures evidence requirements and verification against defined controls.' },
    { title: 'Trend & Change Intelligence', summary: 'Shows pattern and change over time, so attention goes where it is needed.' }
  ],
  enterprise: [
    { title: 'Multi-Site / Portfolio Intelligence', summary: 'Governed visibility across sites and portfolios, not just a single operation.' },
    { title: 'Organisational Context', summary: 'Reflects how your organisation is actually structured and accountable.' },
    { title: 'Advanced Integrations', summary: 'Connects to existing operational systems without becoming a new system of record.' },
    { title: 'Configurable Industry Libraries', summary: 'Industry-configurable models that reflect the operating context of your sector.' }
  ],
  future: [
    { title: 'Work Preparation Intelligence', summary: 'FUTURE — planned capability, not currently delivered. Shown here for transparency about direction, not as a live feature.' }
  ]
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
