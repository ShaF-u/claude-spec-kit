import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSpec, checkPlan, checkTasks, checkChecklist, templatePlaceholders, userStories } from './artifacts.mjs';

const spec = `# Feature Specification: X
## User Scenarios & Testing *(mandatory)*
### User Story 1 - A (Priority: P1)
### User Story 2 - B (Priority: P2)
## Requirements *(mandatory)*
- **FR-001**: a
- **FR-002**: b
## Success Criteria *(mandatory)*
- **SC-001**: c
`;

test('checkSpec: 正しい spec はエラー無し', () => {
  const r = checkSpec(spec, '# Feature Specification: [FEATURE NAME]');
  assert.deepEqual(r.errors, []);
  assert.deepEqual(userStories(spec), [1, 2]);
});

test('checkSpec: 必須セクション欠落・ID重複・プレースホルダ残り・NEEDS 過多', () => {
  const bad = spec
    .replace('## Success Criteria *(mandatory)*\n- **SC-001**: c\n', '')
    .replace('FR-002', 'FR-001')
    .replace('# Feature Specification: X', '# Feature Specification: [FEATURE NAME]')
    + '[NEEDS CLARIFICATION: a] [NEEDS CLARIFICATION: b] [NEEDS CLARIFICATION: c] [NEEDS CLARIFICATION: d]';
  const e = checkSpec(bad, '# Feature Specification: [FEATURE NAME]').errors.join('\n');
  assert.match(e, /Success Criteria/);
  assert.match(e, /SC-### が1つも無い/);
  assert.match(e, /FR ID が重複/);
  assert.match(e, /\[FEATURE NAME\]/);
  assert.match(e, /NEEDS CLARIFICATION が 4 個/);
});

test('templatePlaceholders: NEEDS CLARIFICATION は除く', () => {
  assert.deepEqual(templatePlaceholders('[A] [NEEDS CLARIFICATION: x] [A]'), ['[A]']);
});

test('checkChecklist: 未チェックは警告', () => {
  const r = checkChecklist('- [x] a\n- [ ] b\n', '');
  assert.deepEqual(r.errors, []);
  assert.equal(r.warnings.length, 1);
});

test('checkPlan: セクション欠落と NEEDS CLARIFICATION 残り', () => {
  const e = checkPlan('## Summary\n## Technical Context\nNEEDS CLARIFICATION\n', '').errors.join('\n');
  assert.match(e, /Constitution Check/);
  assert.match(e, /NEEDS CLARIFICATION が 1 個/);
});

const tasks = `## Phase 1: Setup
- [ ] T001 Create src/app.js
## Phase 2: User Story 1 - A (Priority: P1)
- [ ] T002 [P] [US1] Add src/a.js
- [X] T003 [US1] Wire src/b.js
## Phase 3: Polish
- [ ] T004 Update README.md
## Notes
- [ ] not a task
`;

test('checkTasks: 正しい tasks はエラー無し', () => {
  const r = checkTasks(tasks, [1]);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
  assert.equal(r.taskCount, 4);
});

test('checkTasks: 形式不正・ラベル誤り・連番抜け・ストーリー欠落', () => {
  const bad = tasks
    .replace('T001 Create', 'T001 [US1] Create')
    .replace('T002 [P] [US1]', 'T002 [P]')
    .replace('T003 [US1]', 'T005 [US2]')
    .replace('- [ ] T004 Update README.md', '- [ ] Update everything');
  const e = checkTasks(bad, [1, 2]).errors.join('\n');
  assert.match(e, /T001 は Setup\/Foundational\/Polish なのに \[US1\]/);
  assert.match(e, /T002 はストーリーフェーズなのに \[US1\] が無い/);
  assert.match(e, /\[US2\] がフェーズ（User Story 1）と一致しない/);
  assert.match(e, /タスク形式が不正/);
  assert.match(e, /連番でない: 3 番目が T005/);
  assert.match(e, /フェーズが無い: US2/);
});
