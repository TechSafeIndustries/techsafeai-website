const form = document.querySelector<HTMLFormElement>('#intake-form') as HTMLFormElement;
if (!form) throw new Error('Intake form not found.');

const screens = [...form.querySelectorAll<HTMLElement>('[data-screen]')];
const progress = [...document.querySelectorAll<HTMLElement>('[data-progress-stage]')];
const errorSummary = document.querySelector<HTMLElement>('#intake-errors');
const reviewSummary = document.querySelector<HTMLElement>('#review-summary');
const submitStatus = document.querySelector<HTMLElement>('#submit-status');
const confirmation = document.querySelector<HTMLElement>('#intake-confirmation');
const startedAt = form.querySelector<HTMLInputElement>('#startedAt');

let screenIndex = 0;
if (startedAt) startedAt.value = String(Date.now());

const labelFor = (name: string, value: string) => {
  const control = form.querySelector<HTMLInputElement | HTMLOptionElement>(`[name="${CSS.escape(name)}"][value="${CSS.escape(value)}"], select[name="${CSS.escape(name)}"] option[value="${CSS.escape(value)}"]`);
  if (control instanceof HTMLOptionElement) return control.textContent?.trim() || value;
  if (control instanceof HTMLInputElement) {
    const userFacingLabel = control.closest('label')?.querySelector<HTMLElement>('span:not(.choice-index)')?.textContent?.trim();
    return userFacingLabel || control.getAttribute('aria-label')?.trim() || value;
  }
  return value;
};

function setScreen(index: number) {
  screenIndex = Math.max(0, Math.min(index, screens.length - 1));
  screens.forEach((screen, i) => { screen.hidden = i !== screenIndex; });
  const stage = Number(screens[screenIndex]?.dataset.stage || 1);
  progress.forEach((item) => {
    const itemStage = Number(item.dataset.progressStage);
    item.toggleAttribute('aria-current', itemStage === stage);
    item.classList.toggle('is-complete', itemStage < stage);
  });
  clearErrors();
  screens[screenIndex]?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea, button')?.focus({ preventScroll: true });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: Math.max(0, (document.querySelector('.intake-main')?.getBoundingClientRect().top || 0) + window.scrollY - 24), behavior: reducedMotion ? 'auto' : 'smooth' });
}

function clearErrors() {
  form.querySelectorAll('[aria-invalid="true"]').forEach((element) => element.removeAttribute('aria-invalid'));
  if (errorSummary) {
    errorSummary.hidden = true;
    const list = errorSummary.querySelector('ul');
    if (list) list.innerHTML = '';
  }
}

function showErrors(messages: { element?: HTMLElement; message: string }[]) {
  if (!messages.length || !errorSummary) return;
  const list = errorSummary.querySelector('ul');
  if (list) {
    list.innerHTML = '';
    messages.forEach(({ message }) => {
      const li = document.createElement('li');
      li.textContent = message;
      list.append(li);
    });
  }
  errorSummary.hidden = false;
  errorSummary.focus();
}

function validateScreen(screen: HTMLElement) {
  const issues: { element?: HTMLElement; message: string }[] = [];
  const controls = [...screen.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea')].filter((el) => !el.disabled && el.type !== 'hidden');

  for (const control of controls) {
    if (!control.checkValidity()) {
      control.setAttribute('aria-invalid', 'true');
      const label = control.closest('label')?.querySelector('span')?.textContent?.trim() || control.name || 'Field';
      issues.push({ element: control, message: `${label}: ${control.validationMessage}` });
    }
  }

  for (const group of screen.querySelectorAll<HTMLElement>('[data-required-group]')) {
    const checked = group.querySelector('input[type="checkbox"]:checked');
    if (!checked) {
      const name = group.dataset.requiredGroup || 'Selection';
      issues.push({ element: group, message: `${name}: choose at least one option.` });
      group.setAttribute('aria-invalid', 'true');
    }
  }

  const industry = form.elements.namedItem('industryKey') as RadioNodeList | null;
  const otherIndustry = form.elements.namedItem('otherIndustry') as HTMLInputElement | null;
  if (screen.dataset.screen === '3' && industry && otherIndustry && industry.value === 'OTHER_REGULATED' && !otherIndustry.value.trim()) {
    otherIndustry.setAttribute('aria-invalid', 'true');
    issues.push({ element: otherIndustry, message: 'Other industry / operation: describe the industry or regulated operation.' });
  }

  const activity = form.elements.namedItem('activityKey') as RadioNodeList | null;
  const otherActivity = form.elements.namedItem('otherActivity') as HTMLInputElement | null;
  if (screen.dataset.screen === '3' && activity && otherActivity && activity.value === 'OTHER' && !otherActivity.value.trim()) {
    otherActivity.setAttribute('aria-invalid', 'true');
    issues.push({ element: otherActivity, message: 'Other activity: describe the activity.' });
  }

  const jurisdiction = form.elements.namedItem('jurisdictionScope') as RadioNodeList | null;
  const countries = form.elements.namedItem('countries') as HTMLInputElement | null;
  if (screen.dataset.screen === '4' && jurisdiction && countries && jurisdiction.value && jurisdiction.value !== 'UNKNOWN' && !countries.value.trim()) {
    countries.setAttribute('aria-invalid', 'true');
    issues.push({ element: countries, message: 'Country / countries: enter the jurisdiction country or countries.' });
  }

  if (issues.length) {
    showErrors(issues);
    return false;
  }
  return true;
}

function updateConditionalFields() {
  for (const wrapper of document.querySelectorAll<HTMLElement>('[data-show-when]')) {
    const expression = wrapper.dataset.showWhen || '';
    const [name, rawValues] = expression.split(':');
    const values = (rawValues || '').split(',');
    const field = form.elements.namedItem(name) as RadioNodeList | HTMLInputElement | null;
    const current = field && 'value' in field ? String(field.value) : '';
    wrapper.hidden = !values.includes(current);
  }
}

function getValue(name: string) {
  const field = form.elements.namedItem(name);
  if (!field) return '';
  if (field instanceof RadioNodeList) return field.value;
  return (field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
}

function checked(name: string) {
  return [...form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(name)}"]:checked`)].map((input) => input.value);
}

function yesNo(name: string) {
  const value = getValue(name);
  return value ? labelFor(name, value) : 'Not provided';
}

function buildReview() {
  if (!reviewSummary) return;
  const rows = [
    ['Challenge', labelFor('challengeKey', getValue('challengeKey'))],
    ['Problem summary', getValue('problemSummary')],
    ['Organisation', getValue('organisationName')],
    ['Industry', labelFor('industryKey', getValue('industryKey')) + (getValue('otherIndustry') ? ` — ${getValue('otherIndustry')}` : '')],
    ['Activity', labelFor('activityKey', getValue('activityKey')) + (getValue('otherActivity') ? ` — ${getValue('otherActivity')}` : '')],
    ['Operating environment', checked('operatingEnvironment').map((v) => labelFor('operatingEnvironment', v)).join(', ')],
    ['Jurisdiction', `${labelFor('jurisdictionScope', getValue('jurisdictionScope'))}${getValue('countries') ? ` — ${getValue('countries')}` : ''}${getValue('regions') ? ` / ${getValue('regions')}` : ''}`],
    ['Desired outcome', getValue('desiredOutcome')],
    ['Timing', `${labelFor('trigger', getValue('trigger'))} · ${labelFor('timing', getValue('timing'))}`],
    ['Internal capability', `Safety/compliance: ${yesNo('safetyCompliance')}; AI/technology: ${yesNo('aiTechnology')}; Sponsor: ${yesNo('accountableSponsor')}; AITL: ${yesNo('aitlAvailable')}; Adviser: ${yesNo('externalAdviser')}`],
    ['Security', labelFor('securityLevel', getValue('securityLevel'))],
    ['Contact', `${getValue('contactName')} · ${getValue('email')}`]
  ];

  reviewSummary.innerHTML = '';
  rows.forEach(([term, description], index) => {
    const row = document.createElement('div');
    row.className = 'review-row';
    const body = document.createElement('div');
    const dt = document.createElement('strong');
    dt.textContent = term;
    const dd = document.createElement('span');
    dd.textContent = description;
    body.append(dt, dd);
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'review-edit';
    edit.textContent = 'Edit';
    const target = [0, 0, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7][index] ?? 0;
    edit.dataset.editScreen = String(target);
    row.append(body, edit);
    reviewSummary.append(row);
  });
}

function payloadFromForm() {
  return {
    startedAt: Number(getValue('startedAt')),
    companyWebsite: getValue('companyWebsite'),
    turnstileToken: getValue('turnstileToken'),
    challenge: { key: getValue('challengeKey'), problemSummary: getValue('problemSummary') },
    organisation: { name: getValue('organisationName'), sizeBand: getValue('organisationSize'), footprint: getValue('footprint') },
    industry: { key: getValue('industryKey'), other: getValue('otherIndustry'), multiSector: (form.elements.namedItem('multiSector') as HTMLInputElement)?.checked || false },
    activity: { key: getValue('activityKey'), other: getValue('otherActivity') },
    operatingEnvironment: checked('operatingEnvironment'),
    jurisdiction: { scope: getValue('jurisdictionScope'), countries: getValue('countries'), regions: getValue('regions') },
    outcome: { desiredOutcome: getValue('desiredOutcome'), trigger: getValue('trigger'), timing: getValue('timing') },
    internalCapability: {
      safetyCompliance: getValue('safetyCompliance'),
      aiTechnology: getValue('aiTechnology'),
      accountableSponsor: getValue('accountableSponsor'),
      aitlAvailable: getValue('aitlAvailable'),
      externalAdviser: getValue('externalAdviser')
    },
    security: { level: getValue('securityLevel'), note: getValue('securityNote'), acknowledged: (form.elements.namedItem('securityAcknowledged') as HTMLInputElement)?.checked || false },
    contact: { name: getValue('contactName'), email: getValue('email'), telephone: getValue('telephone') }
  };
}

for (const button of form.querySelectorAll<HTMLButtonElement>('[data-next]')) {
  button.addEventListener('click', () => {
    const current = screens[screenIndex];
    if (!validateScreen(current)) return;
    if (Number(current.dataset.screen) === 8) buildReview();
    setScreen(screenIndex + 1);
  });
}

for (const button of form.querySelectorAll<HTMLButtonElement>('[data-back]')) {
  button.addEventListener('click', () => setScreen(screenIndex - 1));
}

reviewSummary?.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-edit-screen]');
  if (!target) return;
  setScreen(Number(target.dataset.editScreen));
});

form.addEventListener('change', updateConditionalFields);

for (const counter of document.querySelectorAll<HTMLElement>('[data-counter-for]')) {
  const name = counter.dataset.counterFor || '';
  const field = form.elements.namedItem(name) as HTMLTextAreaElement | null;
  if (!field) continue;
  const update = () => { counter.textContent = `${field.value.length} / ${field.maxLength}`; };
  field.addEventListener('input', update);
  update();
}

const challengeFromUrl = new URLSearchParams(window.location.search).get('challenge');
if (challengeFromUrl) {
  const carried = form.querySelector<HTMLInputElement>(`input[name="challengeKey"][value="${CSS.escape(challengeFromUrl)}"]`);
  if (carried) carried.checked = true;
}
updateConditionalFields();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearErrors();

  for (let i = 0; i < screens.length - 1; i++) {
    if (!validateScreen(screens[i])) {
      setScreen(i);
      validateScreen(screens[i]);
      return;
    }
  }

  const submitButton = form.querySelector<HTMLButtonElement>('#submit-enquiry');
  if (submitButton) submitButton.disabled = true;
  if (submitStatus) submitStatus.textContent = 'Submitting your context securely…';

  try {
    const response = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payloadFromForm())
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result?.accepted !== true) {
      if (submitStatus) submitStatus.textContent = result?.message || 'We could not confirm receipt of your enquiry. Please review your information and try again later.';
      if (result?.fieldErrors) showErrors(Object.values(result.fieldErrors).map((message) => ({ message: String(message) })));
      return;
    }

    if (submitStatus) submitStatus.textContent = '';
    form.hidden = true;
    if (confirmation) {
      confirmation.hidden = false;
      confirmation.focus();
    }
  } catch {
    if (submitStatus) submitStatus.textContent = 'The server is unavailable. Your enquiry has not been confirmed as received.';
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

setScreen(0);
