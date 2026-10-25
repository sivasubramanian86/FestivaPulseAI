# FestivaPulseAI Engineering Contract & Global Directives

## 1. Always-on Principles
- **Zero Arithmetic Hallucination**: LLMs never compute money, portion formulas, food waste ratios, or timeline DAGs. Pure deterministic Python models execute all calculations.
- **Tenant & Memory Isolation**: Each celebration is sandbox-isolated in storage and telemetry.
- **Human-in-the-Loop (HITL)**: Rescue Studio comparative alternatives require explicit coordinator approval before updating state or blueprints.
- **Strict Size Gate**: Total repository footprint must remain strictly < 10 MB. Exclude node_modules, .venv, coverage, caches from git.

---

# CONTEXT BUDGET & SESSION ROTATION PROTOCOL

## 1. Context Health Thresholds
- Aim to keep working session context under ~60,000 tokens (or ~20-25 conversational turns).
- If this thread exceeds ~20 substantive multi-turn exchanges or includes multiple long code diffs, append this notification to the end of your response:
  > ⚠️ **Context Budget Notice**: This conversation history is becoming dense. To preserve maximum reasoning precision, type `/compact` to generate a fresh checkpoint, or switch to a new session.

## 2. In-Chat Control Commands
- When the user sends `/compact` or `/compact [focus area]`:
  1. Halt coding.
  2. Synthesize all architectural decisions, locked schemas, modified file paths, and current blocking tasks into a concise Markdown summary.
  3. Emit the summary inside a `### RESUME SNAPSHOT` block.
  4. Prompt the user: "You can now open a fresh chat, paste this block, and continue with 0% token bloat."

- When the user sends `/clear`:
  1. Acknowledge the wipe.
  2. Discard previous debugging assumptions and await the new task.

---

## 3. MANDATORY POST-PUSH GITHUB CI/CD PROTOCOL
After EVERY `git push` to GitHub:
1. Run `gh run list --limit 3` immediately to capture the newly triggered workflow run IDs.
2. Monitor execution with `gh run watch <run_id>`.
3. If any failure occurs, run `gh run view <run_id> --log-failed`, isolate the failure root cause, apply surgical fixes, verify locally, push, and monitor until every job reports `completed success`.
4. Never conclude a turn without confirming green status across all GitHub Actions workflows.
