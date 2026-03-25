export interface Bool01LegacyIssue {
  key: string;
  path: string;
  endpoint: string;
  sample: boolean;
  firstSeenAt: string;
  hitCount: number;
}

const legacyIssueMap = new Map<string, Bool01LegacyIssue>();
const LEGACY_EVENT = 'bool01-legacy-detected';
const KEY_PATTERN = /(enable|enabled|autochannel)/i;

const nowIso = (): string => new Date().toISOString();

const toPathString = (segments: string[]): string => {
  if (segments.length === 0) return '(root)';
  return segments.join('.');
};

const shouldTrackKey = (key: string): boolean => KEY_PATTERN.test(key);

const recordIssue = (endpoint: string, path: string, key: string, sample: boolean): Bool01LegacyIssue => {
  const mapKey = `${endpoint}|${path}`;
  const existing = legacyIssueMap.get(mapKey);
  if (existing) {
    existing.hitCount += 1;
    return existing;
  }

  const created: Bool01LegacyIssue = {
    key,
    path,
    endpoint,
    sample,
    firstSeenAt: nowIso(),
    hitCount: 1
  };
  legacyIssueMap.set(mapKey, created);
  return created;
};

const walk = (
  endpoint: string,
  value: unknown,
  segments: string[],
  newlyFound: Bool01LegacyIssue[]
): void => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walk(endpoint, item, [...segments, `[${index}]`], newlyFound);
    });
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    const nextSegments = [...segments, key];
    if (typeof child === 'boolean' && shouldTrackKey(key)) {
      const issue = recordIssue(endpoint, toPathString(nextSegments), key, child);
      if (issue.hitCount === 1) {
        newlyFound.push(issue);
      }
      return;
    }
    walk(endpoint, child, nextSegments, newlyFound);
  });
};

export const reportLegacyBooleanFields = (endpoint: string, payload: unknown): Bool01LegacyIssue[] => {
  const newlyFound: Bool01LegacyIssue[] = [];
  walk(endpoint, payload, [], newlyFound);

  if (newlyFound.length > 0) {
    console.warn('[bool01-migration] Legacy boolean fields detected:', newlyFound);
    window.dispatchEvent(new CustomEvent(LEGACY_EVENT, { detail: { issues: newlyFound } }));
  }

  return newlyFound;
};

export const getLegacyBooleanIssues = (): Bool01LegacyIssue[] =>
  Array.from(legacyIssueMap.values()).sort((a, b) => a.firstSeenAt.localeCompare(b.firstSeenAt));

export const clearLegacyBooleanIssues = (): void => {
  legacyIssueMap.clear();
};

export const BOOL01_LEGACY_EVENT = LEGACY_EVENT;
