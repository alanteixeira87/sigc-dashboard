import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_URL = 'https://www.sigc.com.br/relatorios/1741341291210x205418165883587200';
if (process.argv.includes('--help')) {
  process.stdout.write('Uso: npm run sigc:discover -- [--url=https://www.sigc.com.br/relatorios/ID]\n');
  process.exit(0);
}
const urlArgument = process.argv.find((argument) => argument.startsWith('--url='));
const targetUrl = urlArgument ? urlArgument.slice('--url='.length) : DEFAULT_URL;
const edgePath = process.env.SIGC_BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const rootDirectory = process.cwd();
const profileDirectory = process.env.SIGC_PROFILE_DIR || path.join(rootDirectory, '.sigc-automation-profile');
const outputDirectory = path.join(rootDirectory, 'automation', 'output');
const observations = new Map();

function sanitizeUrl(rawUrl) {
  const parsed = new URL(rawUrl);
  for (const key of parsed.searchParams.keys()) {
    if (/token|auth|key|secret|session|cookie|password/i.test(key)) {
      parsed.searchParams.set(key, '[REDACTED]');
    }
  }
  return parsed.toString();
}

await mkdir(outputDirectory, { recursive: true });

const context = await chromium.launchPersistentContext(profileDirectory, {
  executablePath: edgePath,
  headless: false,
  acceptDownloads: true,
  viewport: null
});

const page = context.pages()[0] || await context.newPage();

function isCandidate(response) {
  const request = response.request();
  const responseUrl = response.url();
  const contentType = response.headers()['content-type'] || '';
  const disposition = response.headers()['content-disposition'] || '';
  return responseUrl.includes('sigc.com.br') && (
    ['xhr', 'fetch'].includes(request.resourceType()) ||
    responseUrl.includes('/api/1.1/') ||
    /json|csv|excel|spreadsheet|octet-stream/i.test(`${contentType} ${disposition}`)
  );
}

page.on('response', (response) => {
  if (!isCandidate(response)) return;
  const request = response.request();
  const entry = {
    method: request.method(),
    status: response.status(),
    resourceType: request.resourceType(),
    url: sanitizeUrl(response.url()),
    contentType: response.headers()['content-type'] || '',
    contentDisposition: response.headers()['content-disposition'] || ''
  };
  observations.set(`${entry.method} ${entry.url}`, entry);
  process.stdout.write(`[${entry.status}] ${entry.method} ${entry.resourceType} ${entry.url}\n`);
});

page.on('download', async (download) => {
  const safeName = download.suggestedFilename().replace(/[^a-zA-Z0-9._-]/g, '_');
  const destination = path.join(outputDirectory, `${Date.now()}-${safeName}`);
  await download.saveAs(destination);
  process.stdout.write(`Download salvo localmente: ${destination}\n`);
});

async function finish(exitCode = 0) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(outputDirectory, `network-${timestamp}.json`);
  await writeFile(reportPath, JSON.stringify([...observations.values()], null, 2), 'utf8');
  process.stdout.write(`\nRelatório seguro salvo em: ${reportPath}\n`);
  process.stdout.write('Cookies, cabeçalhos de autenticação e conteúdo das respostas não foram registrados.\n');
  await context.close();
  process.exit(exitCode);
}

process.on('SIGINT', () => void finish(130));

await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
process.stdout.write('\nFaça login, abra o relatório e execute a atualização/exportação normalmente.\n');
process.stdout.write('Quando terminar, volte a este terminal e pressione Enter.\n');

process.stdin.setEncoding('utf8');
process.stdin.resume();
process.stdin.once('data', () => void finish());
