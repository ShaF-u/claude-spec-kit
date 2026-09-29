#!/usr/bin/env node
// Checks the structure of generated feature artifacts (see lib/artifacts.mjs).
// Usage: node bench/validate.mjs [--root DIR] [specs/NNN-name ...]
//        no feature dirs → every directory under specs/
// Exit 1 if any error. Warnings are printed but do not fail.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSpec, checkPlan, checkTasks, checkChecklist, userStories } from './lib/artifacts.mjs';

const args = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const root = path.resolve(rootIdx >= 0 ? args.splice(rootIdx, 2)[1] : path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const tpl = (name) => read(path.join(root, '.specify', 'templates', name)) ?? '';

const specsDir = path.join(root, 'specs');
const features = args.length
  ? args.map((a) => path.resolve(root, a))
  : existsSync(specsDir)
    ? readdirSync(specsDir).map((d) => path.join(specsDir, d)).filter((p) => statSync(p).isDirectory())
    : [];
if (features.length === 0) {
  console.error('検査対象の feature ディレクトリが無い');
  process.exit(1);
}

let failed = false;
for (const dir of features) {
  console.log(`# ${path.relative(root, dir).replace(/\\/g, '/')}`);
  const spec = read(path.join(dir, 'spec.md'));
  const plan = read(path.join(dir, 'plan.md'));
  const tasks = read(path.join(dir, 'tasks.md'));
  const checklist = read(path.join(dir, 'checklists', 'requirements.md'));
  const results = [];
  if (spec === null) results.push(['spec.md', { errors: ['spec.md が無い'], warnings: [] }]);
  else {
    const r = checkSpec(spec, tpl('spec-template.md'));
    if (plan !== null && r.needsClarification) r.errors.push('plan.md があるのに NEEDS CLARIFICATION が残っている');
    results.push(['spec.md', r]);
    results.push(['checklists/requirements.md', checklist === null
      ? { errors: ['checklists/requirements.md が無い（specify の品質検証が抜けている）'], warnings: [] }
      : checkChecklist(checklist, tpl('spec-quality-checklist.md'))]);
  }
  if (plan !== null) {
    const r = checkPlan(plan, tpl('plan-template.md'));
    if (!existsSync(path.join(dir, 'research.md'))) r.errors.push('research.md が無い（Phase 0）');
    if (!existsSync(path.join(dir, 'quickstart.md'))) r.errors.push('quickstart.md が無い（Phase 1）');
    results.push(['plan.md', r]);
  }
  if (tasks !== null) {
    if (plan === null) results.push(['tasks.md', { errors: ['plan.md が無いのに tasks.md がある'], warnings: [] }]);
    results.push(['tasks.md', checkTasks(tasks, spec ? userStories(spec) : [])]);
  }
  for (const [file, { errors, warnings }] of results) {
    console.log(`  ${errors.length ? 'NG' : 'OK'}  ${file}`);
    for (const e of errors) console.log(`      ✗ ${e}`);
    for (const w of warnings) console.log(`      ! ${w}`);
    if (errors.length) failed = true;
  }
}
process.exit(failed ? 1 : 0);
