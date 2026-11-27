import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { nap } from '../nap';
import { validationCases } from './fixtures';

/** Runs `public/api/contact.php` with the PHP CLI and a fake mailer. No mail leaves the machine. */
const harness = join(process.cwd(), 'scripts/php/contact-harness.php');
const endpoint = join(process.cwd(), 'public/api/contact.php');

type Response = {
  status: number;
  headers: string[];
  json: { ok: boolean; errors: Record<string, string> } | null;
  html: string | null;
};
type Mail = { to: string; subject: string; body: string; headers: string[] };
type Answer = {
  errors: Record<string, string>;
  responses: Response[];
  mails: Mail[];
  thrown?: string;
};

function php(request: unknown): Answer {
  const run = spawnSync('php', [harness], { input: JSON.stringify(request), encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`php failed: ${run.stderr}${run.stdout}`);
  return JSON.parse(run.stdout) as Answer;
}

const guest = {
  name: 'Jan Testowy',
  email: 'jan.testowy@example.com',
  phone: '',
  message: 'Dzień dobry',
  consent: 'on',
};
const kontaktPost = { form: 'kontakt', subject: 'Konferencje', ...guest };
const rezerwacjaPost = {
  form: 'rezerwacja',
  arrival: '2027-03-10',
  departure: '2027-03-12',
  adults: '2',
  children: '0',
  room: 'Standard',
  ...guest,
};
const server = (extra: Record<string, string> = {}) => ({
  REQUEST_METHOD: 'POST',
  REMOTE_ADDR: '203.0.113.7',
  HTTP_ACCEPT: 'application/json',
  ...extra,
});

describe('contact.php validation', () => {
  it('gives the same errors as validate.ts for every shared case', () => {
    for (const testCase of validationCases) {
      const answer = php({ action: 'validate', form: testCase.form, input: testCase.input });
      expect(answer.errors, testCase.name).toEqual(testCase.errors);
    }
  });
});

describe('contact.php request handling', () => {
  let storeDir = '';
  beforeEach(() => {
    storeDir = mkdtempSync(join(tmpdir(), 'contact-test-'));
  });
  afterEach(() => {
    rmSync(storeDir, { recursive: true, force: true });
  });

  const handle = (requests: unknown[], mailFails = false) =>
    php({ action: 'handle', storeDir, mailFails, requests });

  it('sends the mail to the hotel address with Reply-To set to the guest', () => {
    const answer = handle([{ server: server(), post: kontaktPost }]);
    expect(answer.responses[0]).toMatchObject({ status: 200, json: { ok: true } });
    expect(answer.mails).toHaveLength(1);
    const [mail] = answer.mails;
    expect(mail?.to).toBe('kontakt@gosciniecuniejow.pl');
    expect(mail?.headers).toContain('Reply-To: jan.testowy@example.com');
    expect(mail?.headers).toContain('Content-Type: text/plain; charset=UTF-8');
    expect(mail?.body).toContain('Dzień dobry');
    expect(mail?.body).toContain('Temat: Konferencje');
  });

  it('encodes a non-ASCII subject as UTF-8 encoded words', () => {
    const post = { ...rezerwacjaPost, name: 'Łukasz Żółć' };
    const answer = handle([{ server: server(), post }]);
    const subject: string = answer.mails[0]?.subject ?? '';
    expect(subject).toMatch(/^=\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=/);
    const decoded = subject
      .split(/\r\n /)
      .map((word) => Buffer.from(word.slice('=?UTF-8?B?'.length, -2), 'base64').toString('utf8'))
      .join('');
    expect(decoded).toBe('Zapytanie o pobyt: Łukasz Żółć');
    expect(answer.mails[0]?.body).toContain('Przyjazd: 2027-03-10');
  });

  it('keeps every encoded word of a long subject short', () => {
    const post = { ...kontaktPost, subject: 'Zażółć gęślą jaźń '.repeat(5).trim() };
    const subject = handle([{ server: server(), post }]).mails[0]?.subject ?? '';
    for (const word of subject.split(/\r\n /)) expect(word.length).toBeLessThanOrEqual(75);
  });

  it('returns 200 and sends no mail when the honeypot is filled', () => {
    const post = { ...kontaktPost, website: 'http://spam.example' };
    const answer = handle([{ server: server(), post }]);
    expect(answer.responses[0]).toMatchObject({ status: 200, json: { ok: true } });
    expect(answer.mails).toHaveLength(0);
  });

  it('treats a honeypot sent as an array like a filled honeypot', () => {
    const post = { ...kontaktPost, website: ['x'] };
    const answer = handle([{ server: server(), post }]);
    expect(answer.responses[0]?.status).toBe(200);
    expect(answer.mails).toHaveLength(0);
  });

  it('accepts POST only', () => {
    const answer = handle([{ server: server({ REQUEST_METHOD: 'GET' }), post: kontaktPost }]);
    expect(answer.responses[0]?.status).toBe(405);
    expect(answer.responses[0]?.headers).toContain('Allow: POST');
    expect(answer.mails).toHaveLength(0);
  });

  it('rejects invalid data with 422 and the field errors', () => {
    const post = { ...kontaktPost, email: 'nie-email', consent: '' };
    const answer = handle([{ server: server(), post }]);
    expect(answer.responses[0]?.status).toBe(422);
    expect(Object.keys(answer.responses[0]?.json?.errors ?? {})).toEqual(['email', 'consent']);
    expect(answer.mails).toHaveLength(0);
  });

  it('rejects an unknown form', () => {
    const answer = handle([{ server: server(), post: { ...kontaktPost, form: 'x' } }]);
    expect(answer.responses[0]?.status).toBe(422);
    expect(answer.mails).toHaveLength(0);
  });

  it('rejects CR and LF in header values', () => {
    for (const field of ['name', 'email', 'subject']) {
      const post = { ...kontaktPost, [field]: 'a@b.pl\r\nBcc: victim@example.com' };
      const answer = handle([{ server: server(), post }]);
      expect(answer.responses[0]?.status, field).toBe(422);
      expect(answer.mails, field).toHaveLength(0);
    }
  });

  it('refuses to build a mail with CR or LF in a header value, even without validation', () => {
    const values = { ...kontaktPost, email: 'a@b.pl\r\nBcc: victim@example.com' };
    const answer = php({ action: 'build_mail', form: 'kontakt', values });
    expect(answer.thrown).toMatch(/CR or LF/);
  });

  it('limits to 5 messages per IP per hour', () => {
    const requests = Array.from({ length: 7 }, () => ({ server: server(), post: kontaktPost }));
    const answer = handle(requests);
    expect(answer.responses.map((r: { status: number }) => r.status)).toEqual([
      200, 200, 200, 200, 200, 429, 429,
    ]);
    expect(answer.mails).toHaveLength(5);
    expect(answer.responses[5]?.headers).toContain('Retry-After: 3600');
  });

  it('counts each IP on its own and forgets old messages', () => {
    const early = Array.from({ length: 5 }, () => ({
      server: server(),
      post: kontaktPost,
      now: 1000,
    }));
    const other = { server: server({ REMOTE_ADDR: '203.0.113.8' }), post: kontaktPost, now: 1000 };
    const later = { server: server(), post: kontaktPost, now: 1000 + 3601 };
    const answer = handle([...early, other, later]);
    expect(answer.responses.slice(5).map((r: { status: number }) => r.status)).toEqual([200, 200]);
  });

  it('does not count a rejected request', () => {
    const bad = { server: server(), post: { ...kontaktPost, email: '' } };
    const good = { server: server(), post: kontaktPost };
    const answer = handle([...Array(6).fill(bad), ...Array(5).fill(good)]);
    expect(answer.mails).toHaveLength(5);
  });

  it('does not store the IP address', () => {
    handle([{ server: server(), post: kontaktPost }]);
    const files = readdirSync(storeDir);
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(file).not.toContain('203.0.113.7');
      expect(readFileSync(join(storeDir, file), 'utf8')).not.toContain('203.0.113.7');
    }
  });

  it('redirects a normal post with 303 to the thank-you page', () => {
    const plain = server({ HTTP_ACCEPT: 'text/html' });
    const answer = handle([
      { server: plain, post: kontaktPost },
      { server: { ...plain, REMOTE_ADDR: '203.0.113.9' }, post: rezerwacjaPost },
    ]);
    expect(answer.responses[0]).toMatchObject({
      status: 303,
      headers: ['Location: /kontakt/dziekujemy/'],
    });
    expect(answer.responses[1]).toMatchObject({
      status: 303,
      headers: ['Location: /rezerwacja/dziekujemy/'],
    });
  });

  it('shows an HTML error page for an invalid normal post', () => {
    const plain = server({ HTTP_ACCEPT: 'text/html' });
    const answer = handle([
      { server: plain, post: { ...kontaktPost, name: '<b>' + ' '.repeat(3), email: '' } },
    ]);
    expect(answer.responses[0]?.status).toBe(422);
    expect(answer.responses[0]?.html).toContain('Wpisz adres e-mail.');
    expect(answer.responses[0]?.json).toBeNull();
  });

  it('escapes HTML in the error page', () => {
    const plain = server({ HTTP_ACCEPT: 'text/html' });
    const post = { ...kontaktPost, subject: '<script>' + 'a'.repeat(120) };
    const html = handle([{ server: plain, post }]).responses[0]?.html ?? '';
    expect(html).not.toContain('<script>');
  });

  it('returns 500 when the mail cannot be sent', () => {
    const answer = handle([{ server: server(), post: kontaktPost }], true);
    expect(answer.responses[0]?.status).toBe(500);
    expect(answer.responses[0]?.json?.ok).toBe(false);
  });
});

describe('contact.php constants', () => {
  it('uses the hotel e-mail from nap.ts', () => {
    const source = readFileSync(endpoint, 'utf8');
    expect(source).toContain(`const CONTACT_MAIL_TO = '${nap.email}';`);
  });
});
