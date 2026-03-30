import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, 'src');
const viewsRoot = path.join(srcRoot, 'views');
const routerFile = path.join(srcRoot, 'router', 'index.ts');

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.vue']);

const walk = (dir, fileList = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, fileList);
      continue;
    }
    fileList.push(fullPath);
  }
  return fileList;
};

const normalize = (filePath) => filePath.split(path.sep).join('/');

const toProjectRelative = (absPath) => normalize(path.relative(projectRoot, absPath));

const fileExists = (absPath) => {
  try {
    return fs.statSync(absPath).isFile();
  } catch {
    return false;
  }
};

const allFiles = walk(srcRoot).filter((filePath) => SOURCE_EXTENSIONS.has(path.extname(filePath)));
const allViewFiles = walk(viewsRoot).filter((filePath) => filePath.endsWith('.vue'));

const allViewSet = new Set(allViewFiles.map((filePath) => path.resolve(filePath)));
const referencedViewSet = new Set();
const importPattern = /['"`]([^'"`]*\.vue)['"`]/g;

for (const sourceFile of allFiles) {
  const content = fs.readFileSync(sourceFile, 'utf8');
  let match = importPattern.exec(content);
  while (match) {
    const specifier = match[1];
    let resolvedPath = null;

    if (specifier.startsWith('.')) {
      resolvedPath = path.resolve(path.dirname(sourceFile), specifier);
    } else if (specifier.startsWith('@/')) {
      resolvedPath = path.resolve(srcRoot, specifier.slice(2));
    } else if (specifier.startsWith('src/')) {
      resolvedPath = path.resolve(projectRoot, specifier);
    }

    if (resolvedPath) {
      if (!path.extname(resolvedPath)) {
        resolvedPath = `${resolvedPath}.vue`;
      }
      if (fileExists(resolvedPath) && allViewSet.has(path.resolve(resolvedPath))) {
        referencedViewSet.add(path.resolve(resolvedPath));
      }
    }

    match = importPattern.exec(content);
  }
}

const routerContent = fs.readFileSync(routerFile, 'utf8');
const routeImportPattern = /component:\s*\(\)\s*=>\s*import\(\s*['"`]([^'"`]*\.vue)['"`]\s*\)/g;
const routeViewSet = new Set();
let routeMatch = routeImportPattern.exec(routerContent);
while (routeMatch) {
  let target = routeMatch[1];
  if (target.startsWith('.')) {
    target = path.resolve(path.dirname(routerFile), target);
  } else if (target.startsWith('@/')) {
    target = path.resolve(srcRoot, target.slice(2));
  } else if (target.startsWith('src/')) {
    target = path.resolve(projectRoot, target);
  } else {
    target = null;
  }

  if (target && fileExists(target) && allViewSet.has(path.resolve(target))) {
    routeViewSet.add(path.resolve(target));
  }

  routeMatch = routeImportPattern.exec(routerContent);
}

const referencedViews = [...referencedViewSet].sort();
const routeViews = [...routeViewSet].sort();
const orphanViews = [...allViewSet].filter((filePath) => !referencedViewSet.has(filePath)).sort();
const embeddedOnlyViews = referencedViews.filter((filePath) => !routeViewSet.has(filePath));

console.log('View usage audit');
console.log(`- total views: ${allViewSet.size}`);
console.log(`- referenced views: ${referencedViews.length}`);
console.log(`- route views: ${routeViews.length}`);
console.log(`- embedded-only views: ${embeddedOnlyViews.length}`);
console.log(`- orphan views: ${orphanViews.length}`);

if (orphanViews.length > 0) {
  console.log('\nOrphan views (not referenced by router or any imports):');
  for (const filePath of orphanViews) {
    console.log(`- ${toProjectRelative(filePath)}`);
  }
}

if (embeddedOnlyViews.length > 0) {
  console.log('\nEmbedded-only views (used as child components, not direct routes):');
  for (const filePath of embeddedOnlyViews) {
    console.log(`- ${toProjectRelative(filePath)}`);
  }
}
