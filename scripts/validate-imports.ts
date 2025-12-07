// Prüft relative Imports in allen .ts/.tsx/.js/.jsx Dateien unter src/
// Keine externen Abhängigkeiten (kein glob/chalk) -> sollte in jedem Node/ts-node Umfeld laufen.
//
// Usage (project root):
//  npx ts-node ./scripts/validate-imports.ts
//
// Output: Liste fehlender Imports mit Dateiname + Zeilennummer + import string + geprüfte Pfad-Alternativen.

import * as fs from 'fs';
import * as path from 'path';

type MissingImport = {
  file: string;
  line: number;
  importText: string;
  importPath: string;
  checkedPaths: string[];
};

function readFileUtf8(p: string) {
  return fs.readFileSync(p, 'utf8');
}

function resolveCandidatePaths(baseDir: string, rel: string): string[] {
  const candidates: string[] = [];
  const joined = path.join(baseDir, rel);
  candidates.push(joined);
  candidates.push(joined + '.ts');
  candidates.push(joined + '.tsx');
  candidates.push(joined + '.js');
  candidates.push(joined + '.jsx');
  candidates.push(path.join(joined, 'index.ts'));
  candidates.push(path.join(joined, 'index.tsx'));
  candidates.push(path.join(joined, 'index.js'));
  candidates.push(path.join(joined, 'index.jsx'));
  return candidates;
}

function fileExistsCaseInsensitive(p: string): boolean {
  if (fs.existsSync(p)) return true;
  try {
    const parts = path.resolve(p).split(path.sep).filter(Boolean);
    let cur = path.isAbsolute(p) ? path.sep : '';
    for (const part of parts) {
      const listing = fs.existsSync(cur || '.') ? fs.readdirSync(cur || '.') : [];
      const found = listing.find((x) => x.toLowerCase() === part.toLowerCase());
      if (!found) return false;
      cur = path.join(cur, found);
    }
    return fs.existsSync(cur);
  } catch {
    return false;
  }
}

function parseImports(fileContent: string): Array<{ raw: string; path: string; line: number }> {
  const imports: Array<{ raw: string; path: string; line: number }> = [];
  const lines = fileContent.split(/\r?\n/);
  const importRegex = /\bimport\b[\s\S]*?from\s*['"](.+?)['"]/;
  const importOnlyRegex = /\bimport\s+['"](.+?)['"]/; // side-effect imports
  const requireRegex = /\brequire\(\s*['"](.+?)['"]\s*\)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m = line.match(importRegex);
    if (m && m[1]) {
      imports.push({ raw: line.trim(), path: m[1], line: i + 1 });
      continue;
    }
    m = line.match(importOnlyRegex);
    if (m && m[1]) {
      imports.push({ raw: line.trim(), path: m[1], line: i + 1 });
      continue;
    }
    m = line.match(requireRegex);
    if (m && m[1]) {
      imports.push({ raw: line.trim(), path: m[1], line: i + 1 });
      continue;
    }
  }
  return imports;
}

function isRelativeImport(p: string) {
  return p.startsWith('./') || p.startsWith('../') || p === '.' || p === '..';
}

function walkDirSync(dir: string, exts: string[], fileList: string[] = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const res = path.join(dir, it.name);
    if (it.isDirectory()) {
      walkDirSync(res, exts, fileList);
    } else if (it.isFile()) {
      if (exts.includes(path.extname(it.name))) {
        fileList.push(res);
      }
    }
  }
  return fileList;
}

function relativePath(p: string) {
  return path.relative(process.cwd(), p).replace(/\\/g, '/');
}

function run() {
  const root = process.cwd();
  const src = path.join(root, 'src');
  if (!fs.existsSync(src)) {
    console.error('Kein src/ Verzeichnis im Projektroot gefunden. Bitte im Projekt-Root ausführen.');
    process.exit(1);
  }

  const exts = ['.ts', '.tsx', '.js', '.jsx'];
  const files = walkDirSync(src, exts);
  const missing: MissingImport[] = [];

  for (const abs of files) {
    const content = readFileUtf8(abs);
    const imports = parseImports(content);
    if (imports.length === 0) continue;

    const baseDir = path.dirname(abs);
    for (const imp of imports) {
      const impPath = imp.path;
      if (!isRelativeImport(impPath)) continue; // skip npm packages / aliases
      const candidates = resolveCandidatePaths(baseDir, impPath);
      const checked: string[] = [];
      let found = false;
      for (const cand of candidates) {
        checked.push(relativePath(cand));
        if (fileExistsCaseInsensitive(cand)) { found = true; break; }
      }
      if (!found) {
        missing.push({
          file: relativePath(abs),
          line: imp.line,
          importText: imp.raw,
          importPath: impPath,
          checkedPaths: checked,
        });
      }
    }
  }

  if (missing.length === 0) {
    console.log('Keine fehlenden relativen Imports gefunden.');
    process.exit(0);
  }

  console.log(`Gefundene fehlende relative Imports: ${missing.length}`);
  for (const m of missing) {
    console.log('---');
    console.log(`${m.file}:${m.line}`);
    console.log(`  import: ${m.importText}`);
    console.log(`  path: ${m.importPath}`);
    console.log('  geprüfte Kandidaten:');
    for (const c of m.checkedPaths) {
      console.log(`    - ${c}`);
    }
  }

  console.log('\nHinweis: Häufige Lösungen:');
  console.log('- Datei unter src/ anlegen (korrekter Pfad).');
  console.log('- Importpfad anpassen (z.B. ../config statt ../config/defaults.ts) oder Dateiendung ergänzen.');
  console.log('- Wenn du Aliase (tsconfig paths / vite alias) nutzt, prüfe tsconfig/vite config.');
  process.exit(2);
}

run();