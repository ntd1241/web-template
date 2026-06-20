# Builder Agent Retest Report

Date: 2026-06-19  
Repo: `C:\Users\PC\Desktop\web-template`  
Subagent: `019ee0ae-a716-7842-a54c-68e6e8c57951` (`reasoning_effort: low`)

## Purpose

Retest whether a fresh worker can implement a standard UI-builder task without burning quota on broad
docs, broad design skills, browser preview, or codebase graph exploration.

Task prompt: implement the create-material dialog on the existing material management page, without
committing, and report skills/docs/commands used.

## Setup Changes Before Retest

- Removed global `impeccable` skill from `C:\Users\PC\.agents\skills\impeccable`.
- Added builder fast-path language to:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.codex/skills/use-builder/SKILL.md`
  - `.claude/skills/use-builder/SKILL.md`
  - `docs/workflows/implement-ui.md`
- Reverted the previous subagent material-dialog attempt before retesting.

## Confidence

Two runs, `reasoning_effort: low`. Both selected the fast path; still not a statistical guarantee.
Real end-to-end token usage was unavailable (see line in Observed result), so all savings figures below
are an **instruction-load proxy**, not measured spend. Treat the headline as directional until the
scripted regression check under Follow-Up exists.

### Run 2 — gate confirmation (2026-06-20, Codex worktree `codex/retest-edit`)

Task: implement the edit-material dialog reusing the existing material form builder. The prompt did NOT
tell the worker to skip any skill — it only asked for an end-of-run audit, so any skip is attributable to
the AGENTS.md gate, not the prompt.

- Skills activated: `using-superpowers`, `use-builder`, `verification-before-completion`.
- `brainstorming`: **not activated** — worker cited the AGENTS.md builder fast-path gate + explicit requirements.
- `test-driven-development`: **not activated** — same reason; extended the existing focused test instead.
- Docs read: `AGENTS.md`, `docs/workflows/implement-ui.md`, `src/builders/README.md`,
  `docs/builders/form-dialog.md`, plus feature code (model, mock, page, test, generated form/table fixtures).
- Builders run: `gen:form` and `gen:table` to scratch paths (added a per-row "Sửa" action column).
- Verification: Codex's own `npm run test:run` / `npm run build` failed with `spawn EPERM` (workspace-write
  sandbox blocks esbuild from spawning a child — same class as the Flutter/Dart caveat). Re-run outside the
  sandbox by the supervisor passed: focused test **4 passed**, `npm run build` green.

Conclusion: the gate measurably removed the two heaviest process skills (`brainstorming` 2,650 +
`test-driven-development` 2,465 ≈ 45% of known instruction load) on this run. One confirming data point,
not yet a guarantee.

## Retest Result

The worker selected the intended fast path.

Skills reported by worker:

- `using-superpowers`
- `use-builder`
- `test-driven-development`
- `verification-before-completion`
- `brainstorming`

Project docs reported by worker:

- `docs/workflows/implement-ui.md`
- `src/builders/README.md`
- `docs/builders/form-dialog.md`

Not used:

- `graphify`
- `impeccable`
- broad design docs
- `docs/components/*`
- browser/live preview

Builder command:

```bash
npm run gen:form -- src/examples/material/form/material.form.fixture.ts src/examples/material/form/material-form-dialog.generated.tsx
```

Verification rerun by main agent:

```bash
npm run test:run -- src/examples/material/pages/materials-management-page.test.tsx
npm run build
git diff --check
```

Observed result:

- Focused test passed: 1 file, 3 tests.
- Build passed: `tsc && vite build`.
- `git diff --check` had no whitespace errors; only CRLF warnings.
- Token usage was unavailable from subagent tooling.

## Approximate Instruction-Load Footprint (Proxy)

Estimated with `ceil(chars / 4)` for known instruction/doc files only. This **excludes** source reads,
command output, and hidden system context — i.e. it omits the largest real costs. Use it to compare
instruction load between runs, not as an end-to-end token figure.

| Input | Approx tokens |
| --- | ---: |
| `AGENTS.md` | 1,204 |
| `.codex/skills/use-builder/SKILL.md` | 464 |
| `docs/workflows/implement-ui.md` | 868 |
| `src/builders/README.md` | 688 |
| `docs/builders/form-dialog.md` | 642 |
| `using-superpowers` | 1,352 |
| `test-driven-development` | 2,465 |
| `verification-before-completion` | 1,038 |
| `brainstorming` | 2,650 |
| **Known total** | **11,371** |

Previous retest known instruction/docs estimate was about 31.7k tokens (baseline breakdown not captured
here — not independently auditable; recapture per-file before citing the percentage again). On this proxy
the fast path cut known instruction load by roughly 64%.

The two biggest remaining items are global process skills, not project docs:
`brainstorming` (2,650) + `test-driven-development` (2,465) = ~45% of the known total. Further savings on
routine builder tasks come from gating these (see Follow-Up), not from trimming docs further.

## Implementation Produced By Worker

Files changed/created:

- `src/examples/material/pages/materials-management-page.tsx`
- `src/examples/material/form/material-form-dialog.generated.tsx`
- `src/examples/material/form/material-form.schema.ts`
- `src/examples/material/form/material.form.fixture.ts`
- `src/examples/material/pages/materials-management-page.test.tsx`

Behavior:

- Adds `Thêm vật tư` button.
- Opens generated create dialog.
- Validates required code, name, and group.
- Adds the new material to local page state.
- Shows success toast.
- Keeps dialog open and preserves values on duplicate material code.

## Fixture Implementation Follow-Ups

These concern the produced material-dialog fixture, not the retest methodology. Harden before reusing it
as a reference example.

- The implementation uses local page state only. Decide whether this example should instead use the
  project API/React Query mutation pattern.
- `material-form.schema.ts` validates `group` as plain string, not `MaterialGroup` enum values.
- Generated dialog hardcodes group options after generation. If labels change in `MATERIAL_GROUP_LABELS`,
  the form spec must be regenerated.
- Tags are entered as a comma-separated string, then mapped to `string[]` in the page. Confirm whether
  the future form builder should support a real tags/multiselect field here.
- Duplicate-code handling throws an error after showing a toast; the dialog catches it silently to stay
  open. This is acceptable for the test, but a future API-backed mutation should normalize errors in one
  place.
- `crypto.randomUUID()` is used directly in UI code. Confirm target browser/test support or centralize ID
  creation in mock/API code.

## Methodology Caveats

These limit how far the retest result generalizes.

- A Vite dev server process was present during retest, but it existed before subagent completion and no
  browser preview was reported. Do not assume future workers will avoid starting dev servers unless the
  prompt/policy remains explicit.
- `brainstorming` and `test-driven-development` loaded from global superpowers rules in run 1 and together
  are ~45% of known instruction load. The project now gates them for ordinary builder fast-path tasks
  (AGENTS.md builder fast path); run 2 (see Confidence) confirmed both were skipped on a fresh Codex worker.

## Follow-Up Options

- Keep the subagent implementation as a test fixture and harden the issues above.
- Replace local-state create behavior with API/React Query hooks if the example should model real CRUD.
- **Open / required to upgrade conclusion past anecdotal:** add a builder regression check that a fresh
  worker loads only workflow + registry + matching guide for ordinary generated UI tasks. This is an
  agent-behavior probe (run a fixed prompt, assert reported skills/docs), not a unit test — script it as
  a repeatable retest harness, not a `*.test.tsx`.
- **Done this round:** gate `brainstorming` / `test-driven-development` for builder fast-path tasks via
  AGENTS.md. Verify the next run honors it before claiming the ~45% overhead is recovered.
