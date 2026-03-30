import { reportLegacyBooleanField } from './bool01MigrationGuard';

export interface Flag01Context {
  endpoint?: string;
  path?: string;
  reportBoolean?: boolean;
}

const contextlessWarnedValues = new Set<string>();

const warnContextlessBoolean = (value: boolean): void => {
  const key = value ? 'true' : 'false';
  if (contextlessWarnedValues.has(key)) return;

  contextlessWarnedValues.add(key);
  console.warn(
    '[bool01-migration] toFlag01 received legacy boolean without endpoint/path context.',
    { sample: value }
  );
};

export const toFlag01 = (
  value: unknown,
  fallback: 0 | 1 = 0,
  context?: Flag01Context
): 0 | 1 => {
  if (typeof value === 'boolean' && context?.reportBoolean !== false) {
    if (context?.endpoint && context?.path) {
      reportLegacyBooleanField(context.endpoint, context.path, value);
    } else {
      warnContextlessBoolean(value);
    }
  }

  if (typeof value === 'number') return value === 1 ? 1 : 0;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === '1' || normalized === 'true') return 1;
    if (normalized === '0' || normalized === 'false') return 0;
  }

  return fallback;
};

