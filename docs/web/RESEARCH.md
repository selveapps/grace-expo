# How agent-first teams start a greenfield app

Collected before any Grace web code. The job of this file is the map: what each source argues, and which rule we kept. It is not a second methodology.

## Sources

| Source | What they actually do | Rule we kept |
|---|---|---|
| [OpenAI, Harness engineering](https://openai.com/index/harness-engineering/) (11 Feb 2026) | An empty repo, agents write the code, humans design the environment. `AGENTS.md` is a table of contents of about 100 lines. The system of record is a versioned `docs/` tree: design docs, exec plans, product specs, quality notes. Custom linters enforce doc shape. Mechanical feedback (tests, types, CI) beats a longer prompt. | Plan lives in `docs/web/PLAN.md`. `web/AGENTS.md` only points at commands and that plan. Tests and `tsc` are the gate. |
| [OpenAI, AGENTS.md](https://github.com/openai/agents.md/) | A README for agents: goal, commands, testing, boundaries. | `web/AGENTS.md` lists `npm test`, `npm run typecheck`, and `npm run build`, and says the web app must not fork the API. |
| [OpenAI cookbook, iterating workflows with Codex](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex) | Start with `AGENTS.md`, then a `PLANS.md` with acceptance criteria. Smaller build files beat one giant plan. | This web slice has one plan with acceptance criteria tied to existing SEL tickets, not a new product. |
| [Martin Fowler, Harness engineering](https://martinfowler.com/articles/harness-engineering.html) | Agent = model + harness. The user's harness is tests, linters, and legible app structure. | Vitest covers the domain rules (greeting, fallback verse, book slugs, onboarding). Next.js build covers the routes. |
| [Anthropic, CLAUDE.md](https://code.claude.com/docs/en/claude-md) | Persistent instructions under about 200 lines. Add a rule only after a repeated mistake. Concrete commands, not style essays. | Root `AGENTS.md` stays a router. Web-only commands live in `web/AGENTS.md`. |
| [Anthropic, large codebases](https://code.claude.com/docs/en/large-codebases) | Layered context: root for the map, subdirectory for local commands. Ignore generated trees. Scope test commands to the directory you changed. | `cd web && npm test` is the web gate. Do not run the Expo or backend suites to prove a web change. |
| [Anthropic, using CLAUDE.md](https://claude.com/resources/articles/using-claude-md-files) | Explore, plan, then code. Ask how the change will be tested before editing. | Plan and ticket map landed before `web/` application code. |
| [Anthropic, best practices](https://code.claude.com/docs/en/best-practices) | Every line of an always-loaded file spends attention on every task. | No restatement of ESLint, and no copy of `BACKEND.md` inside the web instructions. |
| Grace `docs/AGENTIC_CODING_METHODOLOGY.md` | Same layered model, plus the [configuration smells](https://agentpatterns.ai/anti-patterns/configuration-smells-agents-md/) catalog (arxiv 2606.15828): context bloat, skill leakage, lint leakage, conflicting instructions, init fossilization, blind references. | One source of truth per concern. API shapes stay in `backend/`. Tickets stay in `docs/LINEAR_ISSUES.md` and `docs/web/TICKETS.md`. |

## What we did not copy

OpenAI's experiment forbids humans from typing application code. This repo already has a hand-built Expo app and API. The web client is a new surface on that system, not a second product and not a rewrite of `backend/`.
