import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const row = (key, before, after) => ({
  key,
  before,
  after,
  delta: (after ?? 0) - (before ?? 0),
});

function joinByName(listA, listB, value) {
  const a = new Map(listA.map((x) => [x.name, value(x)]));
  const b = new Map(listB.map((x) => [x.name, value(x)]));
  const names = [...a.keys(), ...listB.map((x) => x.name).filter((n) => !a.has(n))];
  return names.map((n) => row(n, a.get(n) ?? null, b.get(n) ?? null));
}

export function compareResults(a, b) {
  const fixed = [
    ['CLAUDE.md', 'claudeMd'],
    ['skills listing', 'skillListing'],
    ['commands listing', 'commandListing'],
    ['agents listing', 'agentListing'],
  ];
  const mcpValue = (m) => (typeof m.tokens === 'number' ? m.tokens : null);
  const mcpRows = joinByName(a.mcp ?? [], b.mcp ?? [], mcpValue).map((r) => ({ ...r, key: `mcp:${r.key}` }));
  const alwaysOn = [
    ...fixed.map(([key, prop]) => row(key, a.alwaysOn[prop], b.alwaysOn[prop])),
    ...mcpRows,
    row('TOTAL', a.alwaysOn.total, b.alwaysOn.total),
  ];
  const invValue = (i) => i.bodyTokens + i.readsTokens;
  const invocables = joinByName(
    [...(a.skills ?? []), ...(a.commands ?? [])],
    [...(b.skills ?? []), ...(b.commands ?? [])],
    invValue
  );
  const workflows = joinByName(a.workflows ?? [], b.workflows ?? [], (w) => w.tokens);
  return { alwaysOn, invocables, workflows };
}

const fmtDelta = (d) => (d > 0 ? `+${d}` : String(d));
const cell = (v) => (v === null ? '' : String(v));

// CJK characters occupy two columns in a monospaced terminal.
const width = (s) => [...s].reduce((n, ch) => n + (ch.charCodeAt(0) < 128 ? 1 : 2), 0);
const pad = (s, n, left) => (left ? ' '.repeat(n - width(s)) + s : s + ' '.repeat(n - width(s)));

function renderTable(rows) {
  const lines = rows.map((r) => [r.key, cell(r.before), cell(r.after), fmtDelta(r.delta)]);
  const header = ['項目', '前', '後', '差分'];
  const widths = header.map((h, i) => Math.max(width(h), ...lines.map((l) => width(l[i]))));
  const fmt = (cols) => cols.map((c, i) => pad(c, widths[i], i !== 0)).join(' | ');
  return [fmt(header), widths.map((w) => '-'.repeat(w)).join('-|-'), ...lines.map(fmt)].join('\n');
}

export function renderComparison(result, labelA, labelB) {
  return [
    `# 前: ${labelA} → 後: ${labelB}`,
    '',
    '## always-on',
    renderTable(result.alwaysOn),
    '',
    '## skills / commands',
    renderTable(result.invocables),
    '',
    '## workflows',
    renderTable(result.workflows),
    '',
  ].join('\n');
}

function load(file) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    throw new Error(`ファイルを読めません: ${file}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`JSON として解析できません: ${file}`);
  }
}

// ISO 日時が先頭なので辞書順 = 時系列。--root で測った外部キット（_kit-）は除く。
export function pickLatestPair(fileNames) {
  const own = fileNames.filter((f) => f.endsWith('.json') && !f.includes('_kit-')).sort();
  return own.length < 2 ? null : own.slice(-2);
}

export async function runCompare(argv, benchDir) {
  let files = argv;
  if (argv.length === 0) {
    const dir = path.join(benchDir, 'results');
    let names = [];
    try {
      names = readdirSync(dir);
    } catch {}
    const pair = pickLatestPair(names);
    if (!pair) {
      console.error('比較できる結果が2件未満です');
      return 1;
    }
    console.error(`最新2件を比較: ${pair[0]} → ${pair[1]}`);
    files = pair.map((f) => path.join(dir, f));
  } else if (argv.length < 2) {
    console.error('比較するファイルを2つ指定してください');
    return 1;
  }
  let a;
  let b;
  try {
    a = load(files[0]);
    b = load(files[1]);
  } catch (e) {
    console.error(e.message);
    return 1;
  }
  console.log(renderComparison(compareResults(a, b), a.label ?? files[0], b.label ?? files[1]));
  return 0;
}
