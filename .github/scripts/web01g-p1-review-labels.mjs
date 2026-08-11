import { spawn } from 'node:child_process';
import http from 'node:http';
import { CHALLENGES } from '../../src/lib/intake/options.mjs';

const chrome = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const debugPort = 9222;
const browser = spawn(chrome, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  `--remote-debugging-port=${debugPort}`,
  '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=/tmp/web01g-p1-chrome',
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const requestJson = (method, path) => new Promise((resolve, reject) => {
  const request = http.request({ host: '127.0.0.1', port: debugPort, path, method }, (response) => {
    let body = '';
    response.on('data', (chunk) => body += chunk);
    response.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (error) { reject(error); }
    });
  });
  request.on('error', reject);
  request.end();
});

try {
  let chromeReady = false;
  for (let i = 0; i < 40; i++) {
    try {
      await requestJson('GET', '/json/version');
      chromeReady = true;
      break;
    } catch {
      await sleep(250);
    }
  }
  if (!chromeReady) throw new Error('Chrome DevTools endpoint did not start.');

  const results = [];

  for (const [challengeKey, expectedLabel] of CHALLENGES) {
    const target = await requestJson('PUT', `/json/new?${encodeURIComponent(`http://127.0.0.1:4321/start-with-your-challenge?challenge=${challengeKey}`)}`);
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });

    let id = 0;
    const pending = new Map();
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !pending.has(message.id)) return;
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
    });

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const messageId = ++id;
      pending.set(messageId, { resolve, reject });
      ws.send(JSON.stringify({ id: messageId, method, params }));
    });

    const evaluate = async (expression) => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };

    const setValue = async (selector, value) => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Missing ${selector}');e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return e.value})()`);
    const click = async (selector) => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('Missing ${selector}');e.click();return true})()`);

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: `http://127.0.0.1:4321/start-with-your-challenge?challenge=${challengeKey}` });
    await sleep(650);

    const carried = await evaluate(`document.querySelector('input[name="challengeKey"]:checked')?.value || ''`);
    if (carried !== challengeKey) throw new Error(`Challenge carry-forward failed for ${challengeKey}: ${carried}`);

    await setValue('textarea[name="problemSummary"]', 'This is controlled preliminary business context for browser review validation.');
    await click('[data-screen="1"] [data-next]');

    await setValue('input[name="organisationName"]', 'Example Operations');
    await setValue('select[name="organisationSize"]', '250_999');
    await click('[data-screen="2"] [data-next]');

    await click('input[name="industryKey"][value="MINING_RESOURCES"]');
    await click('input[name="activityKey"][value="SITE_FIELD"]');
    await click('[data-screen="3"] [data-next]');

    await click('input[name="operatingEnvironment"][value="SITE_FIELD"]');
    await click('input[name="jurisdictionScope"][value="UNKNOWN"]');
    await click('[data-screen="4"] [data-next]');

    await setValue('textarea[name="desiredOutcome"]', 'Prepare a controlled human review of the declared preliminary business context.');
    await setValue('select[name="trigger"]', 'EXECUTIVE_PRIORITY');
    await setValue('select[name="timing"]', 'ONE_TO_THREE_MONTHS');
    await click('[data-screen="5"] [data-next]');

    for (const name of ['safetyCompliance', 'aiTechnology', 'accountableSponsor', 'aitlAvailable', 'externalAdviser']) {
      await setValue(`select[name="${name}"]`, 'UNSURE');
    }
    await click('[data-screen="6"] [data-next]');

    await setValue('select[name="securityLevel"]', 'STANDARD');
    await click('input[name="securityAcknowledged"]');
    await click('[data-screen="7"] [data-next]');

    await setValue('input[name="contactName"]', 'Test User');
    await setValue('input[name="email"]', 'test@example.com');
    await click('[data-screen="8"] [data-next]');

    const review = await evaluate(`(()=>{const row=[...document.querySelectorAll('.review-row')].find((r)=>r.querySelector('strong')?.textContent?.trim()==='Challenge');return row?.querySelector('span')?.textContent?.trim()||''})()`);
    if (review !== expectedLabel) throw new Error(`Review label mismatch for ${challengeKey}: expected ${JSON.stringify(expectedLabel)}, got ${JSON.stringify(review)}`);
    if (/^\s*\d{1,2}/.test(review)) throw new Error(`Decorative numbering leaked for ${challengeKey}: ${review}`);

    results.push({ challengeKey, reviewLabel: review, pass: true });
    ws.close();
  }

  console.log(JSON.stringify({ reviewLabelRegression: 'PASS', count: results.length, results }, null, 2));
} finally {
  browser.kill('SIGTERM');
}
