---
name: agent-handoff-mesh
description: "Autonomous Agent-to-Agent Handoff, Session Checkpointing, and State Resumption protocol for Gemini Antigravity IDE and multi-agent vibe-coding workflows. Use whenever switching roles (Architect -> Coder -> Tester -> Reviewer), saving task progress before context limits, or resuming previous sessions from .agent_state/."
---

# Agent-to-Agent Handoff & Session Checkpoint Mesh (Antigravity Spec)

## Goal
Enable seamless role delegation, context preservation, and state resumption across specialized subagents (System Architect, Polyglot TDD Engineer, Security Auditor, QA/Evaluator) without losing context or hallucinating prior decisions.

---

## 1. Directory & State Standard
All project state checkpoints and agent handoffs MUST be stored in the root under `.agent_state/`:

```
.agent_state/
├── CURRENT_SESSION.json          # Active session metadata, active agent role, and lock
├── handoffs/
│   ├── Handoff_001_Architect_to_Engineer.md
│   ├── Handoff_002_Engineer_to_Tester.md
│   └── ...
└── checkpoints/
    ├── snapshot_latest.json      # Working file diffs, test state, pending commands
    └── resume_context.md         # Compressed state for instant cold-start restore
```

---

## 2. Dynamic Commands & Triggers

### A. SAVE & HANDOFF (`/handoff:save` or "Hand off to [Role]")
When triggered, the currently active agent MUST:
1. Stop modifying code immediately.
2. Compile a structured markdown file under `.agent_state/handoffs/Handoff_<SEQ>_<FromRole>_to_<ToRole>.md` using this exact template:

```markdown
# AGENT HANDOFF PACKET: [From Role] -> [To Role]
- Timestamp: [ISO-8601 UTC]
- Git Branch/Commit: [Active git status/commit hash]
- Status: [SUCCESS | BLOCKED | REQUIRES_VERIFICATION]

## 1. Intent & Context Delta
- What was just accomplished:
  * [Key task 1 with file paths]
  * [Key task 2 with file paths]
- Non-negotiable architectural decisions made:
  * [Design constraint or schema locked]

## 2. Live Artifacts & File Surface
- Modified Files: `[path1]`, `[path2]`
- Created Schemas/APIs: `[path3]`
- State of Test Suite: [e.g., 14/14 pytest passing | 2 failing on boundary conditions]

## 3. Explicit Directives for the Receiving Agent
- Exact next atomic task: [Immediate next step]
- Known Gotchas / Traps to Avoid: [What NOT to break or touch]
- Verification Command to Run First: `[e.g., pytest tests/test_api.py -v]`
```

3. Update `.agent_state/CURRENT_SESSION.json`:

```json
{
  "active_agent": "[To Role]",
  "last_handoff": ".agent_state/handoffs/Handoff_<SEQ>_<FromRole>_to_<ToRole>.md",
  "pending_tasks": ["task 1", "task 2"],
  "updated_at": "[ISO-8601 UTC]"
}
```

---

### B. RESUME SESSION (`/handoff:resume` or "Resume from earlier / Pick up state")

When triggered or when starting a new session in an existing repository:

1. **Discovery Step:** Scan `.agent_state/CURRENT_SESSION.json` and read the latest handoff file in `.agent_state/handoffs/`.
2. **Context Hydration:**
   - Run `git status -s` to verify actual disk state against the handoff report.
   - Run the specified verification command (e.g., `pytest` or `npm test`).
3. **Acknowledgment Output:** State directly to the user:
   - "Resumed session as **[To Role]** from `[Handoff File]`."
   - "Verified disk state: [Clean / X files uncommitted]."
   - "Executing next atomic directive: [Task]."

---

### C. CONTEXT COMPACT & FLUSH (`/compact` or `/clear`)
1. `/compact`:
   - Summarize goals, constraints, key decisions, active file surface, and discarded paths.
   - Emit `### CONTEXT COMPACTED` checkpoint block and update `.agent_state/checkpoints/resume_context.md`.
2. `/clear`:
   - Reset active working scratchpad, hydrate clean slate from `.agent_state/CURRENT_SESSION.json`.

---

## 3. Simulated Antigravity Lifecycle Hooks

Enforce these three interceptor hooks before and after tool usage:

1. **`PreToolUse` (Guardrail Hook):**
   - Before editing any shared configuration, core schema, or running dangerous shell commands (`rm -rf`, `DROP TABLE`, uncommitted git reset), verify against the active handoff's `Known Gotchas`.
   - Never write outside the project sandbox.
2. **`PostToolUse` (Verification Hook):**
   - After writing or editing any code file, immediately run syntax/type checks (`ruff check`, `mypy`, or `tsc --noEmit`).
   - If tests break, do not hand off; revert or fix within the current agent scope.
3. **`HandoffVerification` (Handshake Hook):**
   - A handoff is only valid if both the markdown file exists in `.agent_state/handoffs/` and the last recorded test command passes with exit code `0`.
