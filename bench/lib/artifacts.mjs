// Structural checks for the artifacts the speckit skills generate
// (spec.md / plan.md / tasks.md / checklists/requirements.md).
// Pure functions: each takes file contents and returns
// { errors: string[], warnings: string[] }. validate.mjs does the I/O.
//
// These catch a compressed skill dropping a step (missing section, wrong
// task format, template placeholder left behind). They do not judge
// whether the content is good.

const NEEDS = /\[NEEDS CLARIFICATION[^\]]*\]/g;

// Bracketed placeholders in a template, e.g. "[FEATURE NAME]", "[DATE]".
// NEEDS CLARIFICATION examples are excluded (checked separately).
export function templatePlaceholders(template) {
  const out = new Set();
  for (const m of (template ?? '').matchAll(/\[[^\]\n]+\]/g)) {
    if (!m[0].startsWith('[NEEDS CLARIFICATION')) out.add(m[0]);
  }
  return [...out];
}

function leftoverPlaceholders(text, template) {
  return templatePlaceholders(template).filter((p) => text.includes(p));
}

function ids(text, prefix) {
  return [...text.matchAll(new RegExp(`\\*\\*${prefix}-(\\d{3})\\*\\*`, 'g'))].map((m) => Number(m[1]));
}

function checkIds(list, prefix, errors, warnings) {
  if (list.length === 0) {
    errors.push(`${prefix}-### が1つも無い`);
    return;
  }
  const dup = list.filter((n, i) => list.indexOf(n) !== i);
  if (dup.length) errors.push(`${prefix} ID が重複: ${[...new Set(dup)].map((n) => `${prefix}-${String(n).padStart(3, '0')}`).join(', ')}`);
  const sorted = [...new Set(list)].sort((a, b) => a - b);
  if (sorted.some((n, i) => n !== i + 1)) warnings.push(`${prefix} ID が 001 からの連番になっていない（削除した要件なら Change log にあるか確認）`);
}

export function userStories(specText) {
  return [...specText.matchAll(/^###\s+User Story (\d+)\s+-\s+.+\(Priority:\s*P\d+\)/gm)].map((m) => Number(m[1]));
}

export function checkSpec(text, template) {
  const errors = [];
  const warnings = [];
  for (const h of ['User Scenarios & Testing', 'Requirements', 'Success Criteria']) {
    if (!new RegExp(`^##\\s+${h.replace(/[&]/g, '\\$&')}`, 'm').test(text)) errors.push(`必須セクション「## ${h}」が無い`);
  }
  if (userStories(text).length === 0) errors.push('「### User Story N - タイトル (Priority: Pn)」が無い');
  checkIds(ids(text, 'FR'), 'FR', errors, warnings);
  checkIds(ids(text, 'SC'), 'SC', errors, warnings);
  const needs = text.match(NEEDS) ?? [];
  if (needs.length > 3) errors.push(`NEEDS CLARIFICATION が ${needs.length} 個（上限 3）`);
  const left = leftoverPlaceholders(text, template);
  if (left.length) errors.push(`テンプレートのプレースホルダが残っている: ${left.join(', ')}`);
  return { errors, warnings, needsClarification: needs.length };
}

export function checkChecklist(text, template) {
  const errors = [];
  const warnings = [];
  const left = leftoverPlaceholders(text, template);
  if (left.length) errors.push(`プレースホルダが残っている: ${left.join(', ')}`);
  const unchecked = (text.match(/^- \[ \]/gm) ?? []).length;
  const checked = (text.match(/^- \[[xX]\]/gm) ?? []).length;
  if (checked + unchecked === 0) errors.push('チェック項目が無い');
  else if (unchecked) warnings.push(`未チェック ${unchecked} 件（implement で確認を求められる）`);
  return { errors, warnings };
}

export function checkPlan(text, template) {
  const errors = [];
  const warnings = [];
  for (const h of ['Summary', 'Technical Context', 'Constitution Check', 'Project Structure']) {
    if (!new RegExp(`^##\\s+${h}`, 'm').test(text)) errors.push(`セクション「## ${h}」が無い`);
  }
  const needs = text.match(/NEEDS CLARIFICATION/g) ?? [];
  if (needs.length) errors.push(`NEEDS CLARIFICATION が ${needs.length} 個残っている（Phase 0 で解消するはず）`);
  const left = leftoverPlaceholders(text, template);
  if (left.length) errors.push(`テンプレートのプレースホルダが残っている: ${left.join(', ')}`);
  return { errors, warnings };
}

const TASK = /^- \[( |x|X)\] (T(\d{3}))( \[P\])?( \[US(\d+)\])? (.+)$/;
const PATHISH = /[\w.-]+\/[\w./-]+|\b[\w-]+\.[a-z]{1,5}\b/;

// storyNumbers: user stories from spec.md (every one should get a phase).
export function checkTasks(text, storyNumbers = []) {
  const errors = [];
  const warnings = [];
  let phase = null; // { title, story: number|null }
  const seen = [];
  const phasesForStory = new Set();
  const noPath = [];
  for (const [i, line] of text.split(/\r?\n/).entries()) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      const isPhase = /^Phase\s+\S+:/.test(h[1]);
      const us = h[1].match(/User Story (\d+)/);
      phase = isPhase ? { title: h[1], story: us ? Number(us[1]) : null } : null;
      if (phase?.story) phasesForStory.add(phase.story);
      continue;
    }
    if (!/^\s*- \[[ xX]\]/.test(line) || !phase) continue;
    const where = `${i + 1}行目`;
    const m = line.match(TASK);
    if (!m) {
      errors.push(`${where}: タスク形式が不正（\`- [ ] T001 [P] [US1] 説明\`）: ${line.trim().slice(0, 60)}`);
      continue;
    }
    seen.push(Number(m[3]));
    const us = m[6] ? Number(m[6]) : null;
    if (phase.story && us === null) errors.push(`${where}: ${m[2]} はストーリーフェーズなのに [US${phase.story}] が無い`);
    if (phase.story && us !== null && us !== phase.story) errors.push(`${where}: ${m[2]} の [US${us}] がフェーズ（User Story ${phase.story}）と一致しない`);
    if (!phase.story && us !== null) errors.push(`${where}: ${m[2]} は Setup/Foundational/Polish なのに [US${us}] が付いている`);
    if (!PATHISH.test(m[7])) noPath.push(m[2]);
  }
  if (seen.length === 0) errors.push('Phase 見出しの下にタスクが1つも無い');
  const gap = seen.findIndex((n, i) => n !== i + 1);
  if (gap >= 0) errors.push(`タスク ID が連番でない: ${gap + 1} 番目が T${String(seen[gap]).padStart(3, '0')}`);
  const missing = storyNumbers.filter((n) => !phasesForStory.has(n));
  if (missing.length) errors.push(`spec のユーザーストーリーにフェーズが無い: ${missing.map((n) => `US${n}`).join(', ')}`);
  if (noPath.length) warnings.push(`ファイルパスが見当たらないタスク: ${noPath.join(', ')}`);
  return { errors, warnings, taskCount: seen.length };
}
