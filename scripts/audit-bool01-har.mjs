#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const USAGE = `
Usage:
  node scripts/audit-bool01-har.mjs <path-to-har> [--all]

Options:
  --all    Track all boolean fields (default tracks keys matching /enable|enabled|autochannel/i)
`;

const args = process.argv.slice(2);
const harPath = args.find((arg) => !arg.startsWith('--'));
const trackAllBoolean = args.includes('--all');

if (!harPath) {
  console.error(USAGE.trim());
  process.exit(2);
}

const absPath = path.resolve(harPath);
if (!fs.existsSync(absPath)) {
  console.error(`[ERROR] HAR file not found: ${absPath}`);
  process.exit(2);
}

const raw = fs.readFileSync(absPath, 'utf8');
let har;
try {
  har = JSON.parse(raw);
} catch (err) {
  console.error('[ERROR] Failed to parse HAR JSON:', err instanceof Error ? err.message : String(err));
  process.exit(2);
}

const entries = har?.log?.entries;
if (!Array.isArray(entries)) {
  console.error('[ERROR] Invalid HAR: missing log.entries[]');
  process.exit(2);
}

const KEY_PATTERN = /(enable|enabled|autochannel)/i;

function shouldTrackKey(key) {
  if (trackAllBoolean) return true;
  return KEY_PATTERN.test(key);
}

function parseMaybeJson(text) {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function walkBoolean(value, segments, issues, base) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkBoolean(item, [...segments, `[${index}]`], issues, base);
    });
    return;
  }

  if (!value || typeof value !== 'object') return;

  Object.entries(value).forEach(([key, child]) => {
    const next = [...segments, key];
    if (typeof child === 'boolean' && shouldTrackKey(key)) {
      issues.push({
        ...base,
        path: next.join('.'),
        value: child
      });
      return;
    }
    walkBoolean(child, next, issues, base);
  });
}

const issues = [];

entries.forEach((entry) => {
  const method = entry?.request?.method ?? 'UNKNOWN';
  const url = entry?.request?.url ?? '(unknown)';

  const reqJson = parseMaybeJson(entry?.request?.postData?.text);
  if (reqJson) {
    walkBoolean(reqJson, [], issues, {
      direction: 'request',
      method,
      url
    });
  }

  const resJson = parseMaybeJson(entry?.response?.content?.text);
  if (resJson) {
    walkBoolean(resJson, [], issues, {
      direction: 'response',
      method,
      url
    });
  }
});

const dedupMap = new Map();
issues.forEach((issue) => {
  const key = `${issue.direction}|${issue.method}|${issue.url}|${issue.path}|${issue.value}`;
  if (!dedupMap.has(key)) dedupMap.set(key, issue);
});
const uniqueIssues = Array.from(dedupMap.values());

console.log(`HAR file: ${absPath}`);
console.log(`Entries: ${entries.length}`);
console.log(`Boolean issues (${trackAllBoolean ? 'all keys' : 'enable-like keys'}): ${uniqueIssues.length}`);

if (uniqueIssues.length > 0) {
  console.log('\nDetected boolean fields:');
  uniqueIssues.forEach((issue, idx) => {
    console.log(
      `${idx + 1}. [${issue.direction}] ${issue.method} ${issue.url}\n` +
      `   ${issue.path} (${issue.value ? 'true' : 'false'})`
    );
  });
  process.exit(1);
}

console.log('No boolean fields detected for the selected key scope.');
process.exit(0);
