# E2E Run Artifacts

Immutable transcripts from `npm run record:phaseN` and `npm run record:staging`.

Each file is supplementary material for the lab notebook (`docs/LAB_NOTEBOOK.md` RUN-NNN entries).

## Naming

```
<phase>-<UTC-timestamp>-<git-short-sha>.log
staging-<UTC-timestamp>-<git-short-sha>.log
```

## Contents (header block)

- UTC timestamp, phase, exit code
- `git` branch, full SHA, dirty/clean
- Node version, OS
- Sanitized env (secrets redacted)
- Full stdout/stderr of verify script

## Reproduce a recorded run

```bash
cd backend
git checkout <sha-from-log-header>
npm run verify:phase2   # or phase from filename
```

Compare your terminal output to the committed `.log` file.
