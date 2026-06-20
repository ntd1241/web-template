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

## Approximate Token Footprint

Estimated with `ceil(chars / 4)` for known files.

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

Previous retest known instruction/docs estimate was about 31.7k tokens. The fast path reduced known
instruction load by roughly 64%, before counting source code, command output, and hidden system context.

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

## Hidden Issues To Check Later

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
- A Vite dev server process was present during retest, but it existed before subagent completion and no
  browser preview was reported. Do not assume future workers will avoid starting dev servers unless the
  prompt/policy remains explicit.
- `brainstorming` still loaded because of global superpowers rules. If quota remains high, consider a
  higher-priority project instruction that simple builder-fast-path UI tasks do not need brainstorming
  unless requirements are unclear.

## Follow-Up Options

- Keep the subagent implementation as a test fixture and harden the issues above.
- Replace local-state create behavior with API/React Query hooks if the example should model real CRUD.
- Add a builder regression test that checks agents/docs only need workflow + registry + matching guide
  for ordinary generated UI tasks.
- Consider compressing or disabling globally broad process skills for this repo if they keep loading in
  routine builder tasks.
