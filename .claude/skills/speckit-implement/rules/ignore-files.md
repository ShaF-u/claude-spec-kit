# Ignore files (create or verify during project setup)

Detect, then create the file with the full pattern set if missing, or append only the missing critical patterns if it exists:

| Detect | File |
|---|---|
| `git rev-parse --git-dir` succeeds | `.gitignore` |
| `Dockerfile*` or Docker in plan.md | `.dockerignore` |
| `.eslintrc*` | `.eslintignore` (for `eslint.config.*`, ensure its `ignores` covers the patterns instead) |
| `.prettierrc*` | `.prettierignore` |
| `.npmrc` / `package.json` and the package is published | `.npmignore` |
| `*.tf` | `.terraformignore` |
| helm charts | `.helmignore` |

## Patterns by technology (from plan.md tech stack)
- Node/JS/TS: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
- Python: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
- Java: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
- C#/.NET: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
- Go: `*.exe`, `*.test`, `vendor/`, `*.out`
- Ruby: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
- PHP: `vendor/`, `*.log`, `*.cache`, `*.env`
- Rust: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
- Kotlin: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
- C++: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
- C: as C++ plus `autom4te.cache/`, `config.status`, `config.log`
- Swift: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
- R: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
- Universal: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

## Tool-specific
- Docker: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
- ESLint: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
- Prettier: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- Terraform: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
- Kubernetes: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`
