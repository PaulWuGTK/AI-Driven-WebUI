import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readText(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

function extractEnclosedBlock(text, token, openChar, closeChar) {
  const tokenIndex = text.indexOf(token);
  if (tokenIndex === -1) return null;

  const blockStart = text.indexOf(openChar, tokenIndex);
  if (blockStart === -1) return null;

  let depth = 0;
  for (let i = blockStart; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === openChar) depth += 1;
    if (ch === closeChar) depth -= 1;
    if (depth === 0) {
      return text.slice(blockStart, i + 1);
    }
  }

  return null;
}

function extractObjectBlock(text, token) {
  return extractEnclosedBlock(text, token, '{', '}');
}

function extractArrayBlock(text, token) {
  return extractEnclosedBlock(text, token, '[', ']');
}

function extractKeysFromObjectBlock(block) {
  const keys = new Set();
  const keyPattern = /'([^']+)'\s*:/g;
  let match;
  while ((match = keyPattern.exec(block)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

function parseRouteVisibilityRules(routerText) {
  const rules = [];
  const arrayBlock = extractArrayBlock(routerText, 'const routeVisibilityRules');
  if (!arrayBlock) return rules;

  const rulePattern = /\{\s*pathPrefix:\s*'([^']+)'\s*,\s*menuKey:\s*'([^']+)'\s*\}/g;
  let match;
  while ((match = rulePattern.exec(arrayBlock)) !== null) {
    rules.push({
      pathPrefix: match[1],
      menuKey: match[2]
    });
  }

  return rules;
}

function main() {
  const routerText = readText('src/router/index.ts');
  const visibilityText = readText('src/types/menuVisibility.ts');

  const menuRulesBlock = extractObjectBlock(visibilityText, 'export const menuVisibilityRules');
  const roleRulesBlock = extractObjectBlock(visibilityText, 'export const menuRoleVisibilityRules');

  if (!menuRulesBlock || !roleRulesBlock) {
    console.error('Failed to parse menu visibility rule blocks.');
    process.exit(1);
  }

  const availableMenuKeys = new Set([
    ...extractKeysFromObjectBlock(menuRulesBlock),
    ...extractKeysFromObjectBlock(roleRulesBlock)
  ]);

  const routeRules = parseRouteVisibilityRules(routerText);
  if (routeRules.length === 0) {
    console.error('No route visibility rules found in src/router/index.ts');
    process.exit(1);
  }

  const missingMenuKeys = [];
  const pathPrefixMap = new Map();
  const duplicatePathPrefixWarnings = [];
  const conflictingPathPrefixErrors = [];

  for (const rule of routeRules) {
    if (!availableMenuKeys.has(rule.menuKey)) {
      missingMenuKeys.push(rule);
    }

    const prev = pathPrefixMap.get(rule.pathPrefix);
    if (!prev) {
      pathPrefixMap.set(rule.pathPrefix, rule.menuKey);
      continue;
    }

    if (prev === rule.menuKey) {
      duplicatePathPrefixWarnings.push(rule);
    } else {
      conflictingPathPrefixErrors.push({
        pathPrefix: rule.pathPrefix,
        firstMenuKey: prev,
        secondMenuKey: rule.menuKey
      });
    }
  }

  console.log(`Route rules: ${routeRules.length}`);
  console.log(`Unique pathPrefix: ${pathPrefixMap.size}`);
  console.log(`Known menu keys: ${availableMenuKeys.size}`);

  if (duplicatePathPrefixWarnings.length > 0) {
    console.warn('\n[WARN] Duplicate pathPrefix entries with same menuKey:');
    for (const item of duplicatePathPrefixWarnings) {
      console.warn(`- ${item.pathPrefix} -> ${item.menuKey}`);
    }
  }

  if (missingMenuKeys.length > 0) {
    console.error('\n[ERROR] routeVisibilityRules references unknown menuKey:');
    for (const item of missingMenuKeys) {
      console.error(`- ${item.pathPrefix} -> ${item.menuKey}`);
    }
  }

  if (conflictingPathPrefixErrors.length > 0) {
    console.error('\n[ERROR] pathPrefix mapped to different menuKey values:');
    for (const item of conflictingPathPrefixErrors) {
      console.error(`- ${item.pathPrefix} -> ${item.firstMenuKey} / ${item.secondMenuKey}`);
    }
  }

  if (missingMenuKeys.length > 0 || conflictingPathPrefixErrors.length > 0) {
    process.exit(1);
  }

  console.log('\nRoute visibility check passed.');
}

main();
