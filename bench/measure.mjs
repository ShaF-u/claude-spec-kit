#!/usr/bin/env node
// Measures how much context a Claude Code project setup costs, in two
// buckets that behave very differently:
//   always-on : enters EVERY session at startup (CLAUDE.md + its @imports,
//               the name/description listing of skills, commands and
//               agents, and connected MCP servers' tool definitions)
//   on-invoke : paid only when a skill/command is actually used (its body
//               plus the files it tells the model to read)
// Then sums on-invoke per workflow from bench/workflows.json.
//
// Usage: node bench/measure.mjs [--root DIR] [--label NAME] [--json]
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { estimateTokens } from './lib/tokens.mjs';
import { splitFrontmatter } from './lib/frontmatter.mjs';
import { listMcpTools } from './lib/mcp-tools.mjs';

const benchDir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const root = path.resolve(argValue('--root') ?? path.join(benchDir, '..'));
const label = argValue('--label') ?? gitLabel(root);
const jsonOnly = args.includes('--json');

function gitLabel(dir) {
  try {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
    const sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();
    return `${branch}@${sha}`;
  } catch {
    return path.basename(dir);
  }
}

const read = (p) => readFileSync(p, 'utf8');
const rel = (p) => path.relative(root, p).replace(/\\/g, '/');

// ---- CLAUDE.md and @imports ----------------------------------------------
function claudeMdChain(file, seen = new Set(), depth = 0) {
  const out = [];
  if (!existsSync(file) || seen.has(file) || depth > 5) return out;
  seen.add(file);
  const text = read(file);
  out.push({ file: rel(file), tokens: estimateTokens(text) });
  for (const m of text.matchAll(/(^|\s)@([\w./~-][^\s]*)/g)) {
    const target = m[2].startsWith('~') ? m[2] : path.resolve(path.dirname(file), m[2]);
    out.push(...claudeMdChain(target, seen, depth + 1));
  }
  return out;
}

// ---- skills / commands / agents --------------------------------------------
function listMarkdownRecursive(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...listMarkdownRecursive(p));
    else if (entry.endsWith('.md')) out.push(p);
  }
  return out;
}

function skills() {
  const dir = path.join(root, '.claude', 'skills');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((d) => existsSync(path.join(dir, d, 'SKILL.md')))
    .sort()
    .map((d) => describeInvocable(d, path.join(dir, d, 'SKILL.md')));
}

function commands() {
  const dir = path.join(root, '.claude', 'commands');
  return listMarkdownRecursive(dir)
    .sort()
    .map((f) => describeInvocable('/' + rel(f).replace(/^\.claude\/commands\//, '').replace(/\.md$/, '').replace(/\//g, ':'), f));
}

function agents() {
  const dir = path.join(root, '.claude', 'agents');
  return listMarkdownRecursive(dir)
    .sort()
    .map((f) => describeInvocable(path.basename(f, '.md'), f));
}

// The listing line is what the model sees at startup; the body only when
// invoked. `reads` are files the body tells the model to read: any
// file-looking token (.md/.json/.yaml/...) that resolves relative to the
// skill's own directory or to the project root -- an approximation of
// the extra context one invocation pulls in, layout-agnostic so kits
// with different conventions (spec-kit's .specify/, cc-sdd's rules/,
// BMAD's workflows/) measure the same way. Scripts are excluded: the
// model runs them and only their output enters context, which a static
// pass can't size.
function describeInvocable(name, file) {
  const { frontmatter, body } = splitFrontmatter(read(file));
  const description = frontmatter.description ?? '';
  const listing = `- ${name}: ${description}`;
  const readsSeen = new Set();
  const reads = [];
  const skillDir = path.dirname(file);
  // A reference is "conditional" when the line that mentions it is itself
  // conditional (if/when/unsure/remain/only ...) -- e.g. a rules file the
  // skill reads only when clarification markers remain. Those are
  // reported separately and excluded from the workflow sums, which
  // therefore measure the common path, not the worst case.
  for (const line of body.split('\n')) {
    // "if it exists" is an existence check, not a branch in the workflow:
    // in a real project the file exists, so the read always happens.
    const conditional =
      /\b(if|when|unsure|remain|only|optional|case)\b/i.test(line.replace(/\bif\s+(it\s+)?exists\b/gi, '').replace(/\bIF EXISTS\b/g, ''));
    for (const m of line.matchAll(/[\w$@{}./-]+\.(?:md|json|ya?ml|txt|xml|csv)\b/g)) {
      const p = m[0]
        .replace('${CLAUDE_PLUGIN_ROOT}', '.claude')
        .replace(/\{\{KIRO_DIR\}\}/g, '.kiro')
        .replace(/^@/, '')
        .replace(/^\.\//, '');
      if (readsSeen.has(p) || /(^|\/)scripts?\//.test(p) || p === path.basename(file)) continue;
      readsSeen.add(p);
      const candidates = [path.join(skillDir, p), path.join(root, p)];
      const abs = candidates.find((c) => existsSync(c) && statSync(c).isFile());
      if (abs) reads.push({ file: rel(abs), tokens: estimateTokens(read(abs)), conditional });
    }
  }
  return {
    name,
    file: rel(file),
    listingTokens: estimateTokens(listing),
    bodyTokens: estimateTokens(body),
    reads,
    readsTokens: reads.filter((r) => !r.conditional).reduce((a, r) => a + r.tokens, 0),
    conditionalReadsTokens: reads.filter((r) => r.conditional).reduce((a, r) => a + r.tokens, 0),
  };
}

// ---- MCP -------------------------------------------------------------------
async function mcpServers() {
  const file = path.join(root, '.mcp.json');
  if (!existsSync(file)) return [];
  const config = JSON.parse(read(file));
  const out = [];
  for (const [name, server] of Object.entries(config.mcpServers ?? {})) {
    if ((server.type ?? 'stdio') !== 'stdio') {
      out.push({ name, tools: null, note: `type ${server.type} not measured` });
      continue;
    }
    const tools = await listMcpTools(server, root);
    out.push(
      tools === null
        ? { name, tools: null, note: 'server not available (not built?)' }
        : { name, toolCount: tools.length, tokens: estimateTokens(JSON.stringify(tools)), tools: tools.map((t) => ({ name: t.name, tokens: estimateTokens(JSON.stringify(t)) })) }
    );
  }
  return out;
}

// ---- workflows -------------------------------------------------------------
function workflows(invocables) {
  const file = path.join(benchDir, 'workflows.json');
  if (!existsSync(file)) return [];
  const byName = new Map(invocables.map((i) => [i.name, i]));
  return Object.entries(JSON.parse(read(file))).map(([name, steps]) => {
    const resolved = steps.map((s) => {
      const inv = byName.get(s);
      return inv ? { step: s, tokens: inv.bodyTokens + inv.readsTokens } : { step: s, tokens: 0, missing: true };
    });
    return { name, steps: resolved, tokens: resolved.reduce((a, s) => a + s.tokens, 0) };
  });
}

// ---- run -------------------------------------------------------------------
const claudeMd = claudeMdChain(path.join(root, 'CLAUDE.md'));
const skillList = skills();
const commandList = commands();
const agentList = agents();
const mcp = await mcpServers();
const invocables = [...skillList, ...commandList];
const flows = workflows(invocables);

const sum = (xs, f) => xs.reduce((a, x) => a + f(x), 0);
const alwaysOn = {
  claudeMd: sum(claudeMd, (c) => c.tokens),
  skillListing: sum(skillList, (s) => s.listingTokens),
  commandListing: sum(commandList, (c) => c.listingTokens),
  agentListing: sum(agentList, (a) => a.listingTokens),
  mcpTools: sum(mcp, (m) => m.tokens ?? 0),
};
alwaysOn.total = Object.values(alwaysOn).reduce((a, b) => a + b, 0);

const result = { label, root, measuredAt: new Date().toISOString(), alwaysOn, claudeMd, skills: skillList, commands: commandList, agents: agentList, mcp, workflows: flows };

const outDir = path.join(benchDir, 'results');
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${new Date().toISOString().replace(/[:.]/g, '-')}_${label.replace(/[^\w.-]/g, '_')}.json`);
writeFileSync(outFile, JSON.stringify(result, null, 2));

if (jsonOnly) {
  console.log(JSON.stringify(result, null, 2));
} else {
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`# ${label}\n`);
  console.log('## always-on (every session)');
  console.log(`  CLAUDE.md (+imports) ${pad(alwaysOn.claudeMd, 7)} ${claudeMd.map((c) => c.file).join(', ') || '(none)'}`);
  console.log(`  skills listing       ${pad(alwaysOn.skillListing, 7)} ${skillList.length} skills`);
  console.log(`  commands listing     ${pad(alwaysOn.commandListing, 7)} ${commandList.length} commands`);
  console.log(`  agents listing       ${pad(alwaysOn.agentListing, 7)} ${agentList.length} agents`);
  for (const m of mcp) console.log(`  mcp ${pad(m.name, 16)} ${pad(m.tokens ?? '-', 7)} ${m.note ?? `${m.toolCount} tools`}`);
  console.log(`  TOTAL                ${alwaysOn.total}\n`);

  console.log('## on-invoke (per skill/command)');
  console.log(`  ${pad('name', 26)} ${pad('listing', 8)} ${pad('body', 7)} ${pad('reads', 7)} ${pad('(cond.)', 8)} reads  [conditional in brackets]`);
  for (const i of invocables) {
    const readList = i.reads.map((r) => (r.conditional ? `[${r.file.split('/').pop()}]` : r.file.replace(/^\.specify\//, ''))).join(' ');
    console.log(`  ${pad(i.name, 26)} ${pad(i.listingTokens, 8)} ${pad(i.bodyTokens, 7)} ${pad(i.readsTokens, 7)} ${pad(i.conditionalReadsTokens, 8)} ${readList}`);
  }
  console.log('');
  console.log('## workflows (sum of body + unconditional reads per step)');
  for (const f of flows) {
    console.log(`  ${pad(f.name, 12)} ${pad(f.tokens, 7)} ${f.steps.map((s) => `${s.step}${s.missing ? '(missing)' : ''}=${s.tokens}`).join(' + ')}`);
  }
  console.log(`\nsaved: ${rel(outFile)}`);
}
