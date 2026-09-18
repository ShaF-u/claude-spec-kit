import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareResults, renderComparison, pickLatestPair } from './compare.mjs';

const base = () => ({
  label: 'x',
  alwaysOn: { claudeMd: 100, skillListing: 200, commandListing: 30, agentListing: 0, mcpTools: 500, total: 830 },
  mcp: [{ name: 'core', tokens: 500 }],
  skills: [{ name: 's1', bodyTokens: 10, readsTokens: 5 }],
  commands: [{ name: '/c1', bodyTokens: 7, readsTokens: 0 }],
  workflows: [{ name: 'w1', tokens: 22 }],
});

const find = (rows, key) => rows.find((r) => r.key === key);

test('identical inputs give zero deltas', () => {
  const r = compareResults(base(), base());
  for (const rows of Object.values(r)) for (const row of rows) assert.equal(row.delta, 0);
  assert.equal(find(r.alwaysOn, 'TOTAL').delta, 0);
  assert.deepEqual(r.alwaysOn.map((x) => x.key), ['CLAUDE.md', 'skills listing', 'commands listing', 'agents listing', 'mcp:core', 'TOTAL']);
  assert.deepEqual(r.invocables.map((x) => x.key), ['s1', '/c1']);
});

test('skill only in B has empty before and delta = after', () => {
  const b = base();
  b.skills.push({ name: 's2', bodyTokens: 40, readsTokens: 2 });
  const r = compareResults(base(), b);
  const row = find(r.invocables, 's2');
  assert.deepEqual(row, { key: 's2', before: null, after: 42, delta: 42 });
  assert.equal(find(r.invocables, 's1').before, 15);
});

test('workflow only in A has empty after and negative delta', () => {
  const a = base();
  a.workflows.push({ name: 'w2', tokens: 9 });
  const r = compareResults(a, base());
  assert.deepEqual(find(r.workflows, 'w2'), { key: 'w2', before: 9, after: null, delta: -9 });
});

test('mcp server without tokens on one side is empty there', () => {
  const b = base();
  b.mcp = [{ name: 'core', tools: null, note: 'not built' }];
  const r = compareResults(base(), b);
  assert.deepEqual(find(r.alwaysOn, 'mcp:core'), { key: 'mcp:core', before: 500, after: null, delta: -500 });
});

test('renderComparison formats signed deltas and empty cells', () => {
  const b = base();
  b.skills.push({ name: 's2', bodyTokens: 40, readsTokens: 2 });
  b.alwaysOn.claudeMd = 90;
  const out = renderComparison(compareResults(base(), b), 'A', 'B');
  assert.match(out, /^# 前: A → 後: B\n/);
  assert.match(out, /項目 +\| +前 \| +後 \| +差分/);
  assert.match(out, /CLAUDE\.md +\| +100 \| +90 \| +-10/);
  assert.match(out, /s2 +\| +\| +42 \| +\+42/);
  assert.match(out, /w1 +\| +22 \| +22 \| +0/);
});

test('pickLatestPair returns the last two by name order regardless of input order', () => {
  const names = [
    '2026-09-18T09-48-59-332Z_main_ec91c41.json',
    '2026-09-18T09-10-27-934Z_main_83638b4.json',
    '2026-09-18T09-41-23-370Z_main_d9eb096.json',
  ];
  assert.deepEqual(pickLatestPair(names), [
    '2026-09-18T09-41-23-370Z_main_d9eb096.json',
    '2026-09-18T09-48-59-332Z_main_ec91c41.json',
  ]);
});

test('pickLatestPair excludes _kit- results', () => {
  const names = [
    '2026-09-18T09-10-27-934Z_main_83638b4.json',
    '2026-09-18T09-16-45-560Z_kit-cc-sdd.json',
    '2026-09-18T09-41-23-370Z_main_d9eb096.json',
    '2026-09-18T09-50-00-000Z_kit-bmad.json',
  ];
  assert.deepEqual(pickLatestPair(names), [
    '2026-09-18T09-10-27-934Z_main_83638b4.json',
    '2026-09-18T09-41-23-370Z_main_d9eb096.json',
  ]);
});

test('pickLatestPair returns null with fewer than two candidates', () => {
  assert.equal(pickLatestPair([]), null);
  assert.equal(pickLatestPair(['2026-09-18T09-10-27-934Z_main_83638b4.json']), null);
  assert.equal(
    pickLatestPair(['2026-09-18T09-10-27-934Z_main_83638b4.json', '2026-09-18T09-16-45-560Z_kit-cc-sdd.json']),
    null
  );
});
