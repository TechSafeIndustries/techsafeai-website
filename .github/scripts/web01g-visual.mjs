import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';

const chrome = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const port = 9222;
const browser = spawn(chrome, [
  '--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${port}`,
  '--remote-debugging-address=127.0.0.1', '--user-data-dir=/tmp/web01g-final-chrome', 'about:blank'
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const requestJson = (method, path) => new Promise((resolve, reject) => {
  const request = http.request({ host: '127.0.0.1', port, path, method }, (response) => {
    let body = '';
    response.on('data', (chunk) => body += chunk);
    response.on('end', () => { try { resolve(JSON.parse(body)); } catch (error) { reject(error); } });
  });
  request.on('error', reject); request.end();
});
for (let i = 0; i < 30; i++) { try { await requestJson('GET', '/json/version'); break; } catch { await sleep(300); } }

fs.mkdirSync('validation-artifacts', { recursive: true });
const widths = [1440, 1024, 768, 390, 320];
const results = [];

for (const width of widths) {
  const target = await requestJson('PUT', '/json/new?http://127.0.0.1:4321/start-with-your-challenge?challenge=CONTROL_VERIFICATION');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  let messageId = 0;
  const pending = new Map();
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const handlers = pending.get(message.id); pending.delete(message.id);
      message.error ? handlers.reject(new Error(JSON.stringify(message.error))) : handlers.resolve(message.result);
    }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++messageId; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const click = (selector) => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('missing ${selector}');e.click();return true})()`);
  const setValue = (selector, newValue) => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('missing ${selector}');e.value=${JSON.stringify(newValue)};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return e.value})()`);
  const currentScreen = () => evaluate(`document.querySelector('[data-screen]:not([hidden])')?.dataset.screen || ''`);
  const assertNoOverflow = async (label) => {
    const data = await evaluate(`({scroll:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),client:document.documentElement.clientWidth})`);
    if (data.scroll > data.client + 1) throw new Error(`horizontal overflow ${width}px ${label}: ${JSON.stringify(data)}`);
  };
  const capture = async (name) => {
    await evaluate(`document.querySelector('.intake-layout')?.scrollIntoView({block:'start'})`); await sleep(80);
    const rect = await evaluate(`(()=>{const e=document.querySelector('.intake-layout');const r=e.getBoundingClientRect();return{x:Math.max(0,r.x+scrollX),y:Math.max(0,r.y+scrollY),w:r.width,h:r.height}})()`);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, fromSurface: true, clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 1 } });
    fs.writeFileSync(`validation-artifacts/${name}`, Buffer.from(shot.data, 'base64'));
  };

  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width <= 768 });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.navigate', { url: 'http://127.0.0.1:4321/start-with-your-challenge?challenge=CONTROL_VERIFICATION' });
  await sleep(850);

  const initial = await evaluate(`(()=>({carried:document.querySelector('input[name="challengeKey"]:checked')?.value,stages:document.querySelectorAll('[data-progress-stage]').length,handoffHidden:document.querySelector('#intake-confirmation')?.hidden,upload:!!document.querySelector('input[type="file"]'),reduced:getComputedStyle(document.documentElement).scrollBehavior}))()`);
  if (initial.carried !== 'CONTROL_VERIFICATION' || initial.stages !== 7 || initial.handoffHidden !== true || initial.upload || initial.reduced !== 'auto') throw new Error(`initial state regression ${width}: ${JSON.stringify(initial)}`);
  await assertNoOverflow('challenge');
  if (width === 1440) await capture('WEB-01G_challenge_desktop.png');
  if (width === 390) await capture('WEB-01G_challenge_mobile.png');

  await setValue('textarea[name="problemSummary"]', 'We need a clearer view of control verification across operating sites.');
  await click('[data-screen="1"] [data-next]');
  await setValue('input[name="organisationName"]', 'Example Operations');
  await setValue('select[name="organisationSize"]', '250_999');
  await setValue('input[name="footprint"]', 'Three Australian operating sites');
  await click('[data-screen="2"] [data-next]');
  await click('input[name="industryKey"][value="OTHER_REGULATED"]');
  await setValue('input[name="otherIndustry"]', 'Regulated processing operation');
  await click('input[name="multiSector"]');
  await click('input[name="activityKey"][value="OTHER"]');
  await setValue('input[name="otherActivity"]', 'Critical operational assurance');
  await click('[data-screen="3"] [data-next]');
  await click('input[name="operatingEnvironment"][value="PLANT_PROCESSING"]');
  await click('input[name="operatingEnvironment"][value="SITE_FIELD"]');
  await click('input[name="jurisdictionScope"][value="MULTI_JURISDICTION"]');
  await setValue('input[name="countries"]', 'Australia, New Zealand');
  await setValue('input[name="regions"]', 'Western Australia, Queensland');
  await assertNoOverflow('operating-context');
  if (width === 1440) await capture('WEB-01G_operating-context_desktop.png');
  if (width === 390) await capture('WEB-01G_operating-context_mobile.png');
  await click('[data-screen="4"] [data-next]');
  await setValue('textarea[name="desiredOutcome"]', 'Create a clearer evidence-backed basis for human review and prioritisation.');
  await setValue('select[name="trigger"]', 'AUDIT_REVIEW');
  await setValue('select[name="timing"]', 'ONE_TO_THREE_MONTHS');
  await click('[data-screen="5"] [data-next]');
  await setValue('select[name="safetyCompliance"]', 'YES');
  await setValue('select[name="aiTechnology"]', 'UNSURE');
  await setValue('select[name="accountableSponsor"]', 'YES');
  await setValue('select[name="aitlAvailable"]', 'NO');
  await setValue('select[name="externalAdviser"]', 'UNSURE');
  await click('[data-screen="6"] [data-next]');
  await setValue('select[name="securityLevel"]', 'HEIGHTENED');
  await setValue('textarea[name="securityNote"]', 'Formal security review may be required before protected information is requested.');
  await click('input[name="securityAcknowledged"]');
  await assertNoOverflow('security');
  if (width === 1440) await capture('WEB-01G_security_desktop.png');
  if (width === 390) await capture('WEB-01G_security_mobile.png');
  await click('[data-screen="7"] [data-next]');
  await setValue('input[name="contactName"]', 'Test User');
  await setValue('input[name="email"]', 'test@example.com');
  await click('[data-screen="8"] [data-next]');
  if (await currentScreen() !== '9') throw new Error(`review not reached ${width}`);
  const reviewTruth = await evaluate(`document.querySelector('[data-screen="9"]')?.innerText.includes('It is not an assessment or compliance determination.')`);
  if (!reviewTruth) throw new Error(`review boundary missing ${width}`);
  await assertNoOverflow('review');
  if (width === 1440) await capture('WEB-01G_review_desktop.png');
  if (width === 390) await capture('WEB-01G_review_mobile.png');

  if (width >= 768) {
    const effectiveWidth = Math.max(320, Math.floor(width / 2));
    await send('Emulation.setDeviceMetricsOverride', { width: effectiveWidth, height: 1000, deviceScaleFactor: 1, mobile: effectiveWidth <= 768 });
    await sleep(120);
    const reflow = await evaluate(`({scroll:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),client:document.documentElement.clientWidth})`);
    if (reflow.scroll > reflow.client + 1) throw new Error(`effective 200% reflow overflow ${width}->${effectiveWidth}: ${JSON.stringify(reflow)}`);
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width <= 768 });
    await sleep(100);
  }

  await click('#submit-enquiry');
  for (let i=0;i<30;i++) { if (await evaluate(`!document.querySelector('#intake-confirmation').hidden`)) break; await sleep(100); }
  const handoff = await evaluate(`(()=>{const e=document.querySelector('#intake-confirmation');const img=e?.querySelector('img');const r=img?.getBoundingClientRect();return{visible:!!e&&!e.hidden,text:e?.innerText||'',imageWidth:r?.width||0}})()`);
  if (!handoff.visible || !handoff.text.includes('human review') || handoff.imageWidth > 420.1 || (width <= 390 && handoff.imageWidth > 260.1)) throw new Error(`handoff regression ${width}: ${JSON.stringify(handoff)}`);
  await assertNoOverflow('handoff');
  if (width === 1440) await capture('WEB-01G_handoff_desktop.png');
  if (width === 390) await capture('WEB-01G_handoff_mobile.png');

  results.push({ width, noHorizontalOverflow: true, initialHandoffHidden: true, effective200PercentReflow: width >= 768 ? Math.max(320, Math.floor(width / 2)) : 'covered-by-mobile-reflow', handoffImageWidth: handoff.imageWidth });
  ws.close();
}

fs.writeFileSync('validation-artifacts/responsive-results.json', JSON.stringify(results, null, 2));
browser.kill('SIGTERM');
