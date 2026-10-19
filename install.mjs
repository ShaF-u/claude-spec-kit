#!/usr/bin/env node
// Installs the kit into user scope so every project can use it:
//   .claude/skills/speckit-* (+ skills they call) -> ~/.claude/skills/
//   .specify scaffold (no project constitution)   -> ~/.claude/speckit/specify/
// speckit-specify / speckit-constitution copy the scaffold into a project
// that has no .specify/ yet. Re-run after editing the kit here.
//
// Usage: node install.mjs
import { cpSync, existsSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const userClaude = path.join(os.homedir(), '.claude');
const srcSkills = path.join(root, '.claude', 'skills');
const dstSkills = path.join(userClaude, 'skills');

// speckit-implement uses these two.
const deps = ['test-driven-development', 'verification-before-completion'];
const skills = [...readdirSync(srcSkills).filter((d) => d.startsWith('speckit-')), ...deps];

mkdirSync(dstSkills, { recursive: true });
for (const name of skills) {
  const dst = path.join(dstSkills, name);
  rmSync(dst, { recursive: true, force: true }); // drop files removed from the kit
  cpSync(path.join(srcSkills, name), dst, { recursive: true });
}

const scaffold = path.join(userClaude, 'speckit', 'specify');
rmSync(scaffold, { recursive: true, force: true });
for (const item of ['.gitignore', 'init-options.json', 'templates', 'scripts']) {
  const src = path.join(root, '.specify', item);
  if (existsSync(src)) cpSync(src, path.join(scaffold, item), { recursive: true });
}

console.log(`skills   -> ${dstSkills}\n  ${skills.join('\n  ')}`);
console.log(`scaffold -> ${scaffold}`);
