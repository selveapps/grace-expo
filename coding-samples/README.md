# Coding-task sample pack

This is the shape a lab uses to train or grade a coding agent. One task is one directory. The same rows are also in `instances.jsonl` for a table load.

The layout matches SWE-bench Pro v2 (Scale’s Harbor task). The columns in the JSONL match SWE-bench: `base_commit`, `problem_statement`, `patch`, `test_patch`, `FAIL_TO_PASS`, `PASS_TO_PASS`.

## What a buyer runs

```
tasks/<instance_id>/
  instruction.md                 # the only text the agent sees
  task.toml                      # timeouts; the agent has no network
  environment/Dockerfile         # the machine the agent and the grader share
  environment/setup_repo.sh      # checkout base_commit, then delete history
  solution/gold_patch.diff       # reference fix, hidden from the agent
  solution/solve.sh
  tests/test_patch.patch         # hidden tests, applied before grading
  tests/test.sh                  # apply tests, run them, exit 0 only on a pass
  tests/run_script.sh            # the project’s test command
  tests/parser.py                # TAP or JSON into {tests:[{name,status}]}
  tests/config.json              # fail_to_pass and pass_to_pass names
```

`holdout/` has the same environment and instruction for two WeddingGPT tickets that do not have a patch yet. Those two are not in `instances.jsonl` because a row without tests cannot be graded.

## Environment

The image is part of the task, not a separate download.

1. Start from Node 22.
2. Fetch only `base_commit`.
3. Delete `.git` and make one commit, so the fix is not reachable with `git log`.
4. Install dependencies in the image. The agent’s phase has `network_mode = "no-network"`, so a later `npm install` would fail on purpose.
5. The repo is at `/app`.

Build one image:

```bash
docker build \
  -f tasks/selveapps__grace-expo-83/environment/Dockerfile \
  tasks/selveapps__grace-expo-83/environment
```

Images were not built in the environment that produced this pack. Docker was not installed there. Five tasks were graded on a checkout of `base_commit` instead, which is the same apply-and-test sequence the container runs.

## Grade sequence

1. Container is at `base_commit`.
2. Apply `tests/test_patch.patch`.
3. An empty agent patch must fail.
4. Apply a candidate diff.
5. `fail_to_pass` must pass. `pass_to_pass` must still pass.

`pass_to_pass` is an empty list in this sample. The new tests were collected. A before/after run of the rest of each suite was not. A buyer will ask for that list before they pay for an eval set.

## What was graded here

| Instance | Empty patch | Gold patch |
|---|---|---|
| `selveapps__grace-expo-83` | fails | 6/6 node tests pass |
| `selveapps__grace-expo-84` | fails to load | 2/2 vitest pass |
| `selveapps__grace-expo-82` | fails to load | 3/3 vitest pass |
| `selveapps__WeddingGPT-32` | fails | 12/12 node tests pass |
| `selveapps__WeddingGPT-20` | fails | 25/25 node tests pass |

`selveapps__WeddingGPT-25` (Jest) and `selveapps__grace-expo-47` (Playwright) have Dockerfiles and patches. Those two images were not executed here.

Details are in `grade_report.json`.

## Rights

Grace has no GitHub-detected license. WeddingGPT is proprietary. This directory is a sample for the owner to show a buyer. It is not a license to train.
