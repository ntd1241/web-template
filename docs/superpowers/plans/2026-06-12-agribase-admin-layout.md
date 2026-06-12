# AgriBase Admin Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new AgriBase-inspired admin layout and a sample data-table page that matches `docs/04-specific-design-system.md`.

**Architecture:** Keep existing Metronic layouts untouched. Copy the closest current shell, `layout-20`, into a new isolated layout and restyle it with AgriBase tokens. Add one sample employee table page so the design language can be reviewed in-browser before deeper template migration.

**Tech Stack:** Vite, React 19, TypeScript, React Router 7 packages, Tailwind CSS 4 `@theme`, Lucide icons.

---

## Progress Checklist

- [x] Update agent guidance to reference `docs/04-specific-design-system.md`.
- [x] Add AgriBase design tokens and font setup to global styles.
- [x] Create the new AgriBase admin layout by copying `layout-20`.
- [x] Restyle the AgriBase sidebar, icon rail, topbar, and shell.
- [x] Build a sample employee data-table page.
- [x] Register the new route in app routing.
- [x] Run build verification.
- [x] Run browser visual QA at desktop sizes.

---

## Task 1: Documentation Guidance

**Files:**
- Modify: `AGENTS.md`

- [x] Add `docs/04-specific-design-system.md` as the highest-priority UI reference.
- [x] Clarify that `docs/02-design-system.md` remains the general Vietnamese admin guideline.
- [x] Mention that AgriBase shell work should use `layout-20` as the closest Metronic base.

## Task 2: Design Tokens And Font Foundation

**Files:**
- Modify: `src/styles/globals.css`

- [x] Import Be Vietnam Pro and Inter from Google Fonts.
- [x] Add AgriBase CSS variables under `:root`.
- [x] Map the existing shadcn/Metronic semantic variables to AgriBase defaults without breaking component names.
- [x] Extend Tailwind 4 `@theme inline` with AgriBase color, radius, font, and layout tokens.
- [x] Set the base body font and page colors through existing global layers.

## Task 3: New Layout Shell

**Files:**
- Create: `src/components/layouts/layout-40/index.tsx`
- Create: `src/components/layouts/layout-40/components/context.tsx`
- Create: `src/components/layouts/layout-40/components/wrapper.tsx`
- Create: `src/components/layouts/layout-40/components/sidebar.tsx`
- Create: `src/components/layouts/layout-40/components/sidebar-primary.tsx`
- Create: `src/components/layouts/layout-40/components/sidebar-secondary.tsx`
- Create: `src/components/layouts/layout-40/components/sidebar-header.tsx`
- Create: `src/components/layouts/layout-40/components/header.tsx`

- [x] Copy the structural pattern from `layout-20`.
- [x] Use a 56px dark icon rail, a 224-240px light sidebar, and a 64px topbar.
- [x] Use AgriBase menu groups: Tổng quan, Quản trị, Vùng sản xuất.
- [x] Keep layout state isolated inside the new layout folder.
- [x] Avoid changing any existing `layout-*` behavior.

## Task 4: Sample Employee Table Page

**Files:**
- Create: `src/pages/layout-40/page.tsx`

- [x] Build a full-height page with page title, breadcrumb, and user chip in the topbar.
- [x] Add a data card with toolbar: title, subtitle, search, filter/refresh, and primary action.
- [x] Add a sticky-header table with employee entity cells, role badges, status badges, and action buttons.
- [x] Add fixed pagination footer with page-size control, result count, and prev/current/next controls.
- [x] Use static mock data only, no backend/API integration.

## Task 5: Routing Integration

**Files:**
- Modify: `src/routing/app-routing-setup.tsx`

- [x] Import `Layout40` and `Layout40Page`.
- [x] Register `/layout-40` as the AgriBase admin sample route.
- [x] Keep the existing fallback route unchanged.

## Task 6: Verification

**Commands:**
- `npm run build`

- [x] Run TypeScript/Vite production build.
- [x] Start the dev server.
- [x] Inspect `/layout-40` at 1366px desktop.
- [x] Inspect `/layout-40` at 1920px desktop.
- [x] Fix visual overflow, bad spacing, or broken table scroll discovered during QA.
