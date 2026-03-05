# Views Reorganization Plan

## Purpose

This plan makes `src/views` easier to navigate by keeping file locations aligned with sidebar/menu domains.

Goals:
- reduce time spent searching for pages
- separate route pages from tab-only child views
- remove or archive truly unused views safely

Out of scope:
- business logic changes
- API contract changes
- style/UI redesign

## Current Audit Snapshot

Source: `npm run check:view-usage`

- total views: 116
- referenced views: 112
- route views: 58
- embedded-only views: 54
- orphan views: 4

Orphan candidates:
- `src/views/Settings.vue`
- `src/views/network/wireless/MacFiltering.vue`
- `src/views/network/wireless/basic/WirelessBandConfig.vue`
- `src/views/settings/wireless/WirelessExtenderTab.vue`

## Canonical Placement Rules

1. Route entry page stays in menu-aligned folder root.
2. Tab/child-only page stays under a subfolder (`tabs`, domain subfolder, or existing feature folder).
3. No new files under legacy path `src/views/settings/*`.
4. Shared building blocks should move to `src/components/*` if they are no longer view pages.

## Menu-to-Folder Mapping

- Status: `src/views/status/*`
- Network: `src/views/network/*`
- Advanced: `src/views/advanced/*`
- Application: `src/views/application/*`
- IoT: `src/views/iot/*`
- System: `src/views/system/*`
- Wizard flow: `src/views/wizard/*`

## Execution Batches

### Batch 1: Orphan Confirmation and Decision

Targets:
- `Settings.vue`
- `network/wireless/MacFiltering.vue`
- `network/wireless/basic/WirelessBandConfig.vue`
- `settings/wireless/WirelessExtenderTab.vue`

Action:
- confirm no route/import usage and no pending feature owner
- decide `delete` or `archive` per file

Exit criteria:
- orphan list reduced to 0, or each remaining orphan has explicit owner note

Status:
- [x] completed
- action taken: archived (safe-first), not hard-deleted
- archive location: `archive/views-orphans/batch1-2026-03-05/`

### Batch 2: Route vs Child Labeling Cleanup

Action:
- for each folder, ensure route page names are clear (`*Config`, `*Management`, etc.)
- keep child pages as `*Tab` where applicable
- add folder-level `README` only where a folder has mixed route+child pages and causes confusion

Exit criteria:
- route pages and child pages are visually distinguishable by name

Status:
- [x] completed
- renamed child tab pages to `*Tab.vue` in:
  - `src/views/advanced/ssh/*`
  - `src/views/iot/thread/*`
  - `src/views/network/wireless/GuestNetworkTab.vue`
- added folder-level guidance:
  - `src/views/advanced/ssh/README.md`
  - `src/views/iot/thread/README.md`
  - `src/views/network/wireless/README.md`

### Batch 3: Legacy Path Drain

Target:
- all `src/views/settings/*` leftovers

Action:
- migrate any valid page to the canonical bucket
- remove empty legacy folders

Exit criteria:
- no active view code remains under `src/views/settings/*`

Status:
- [x] completed
- moved legacy folder out of active tree:
  - from: `src/views/settings/`
  - to: `archive/views-legacy/batch3-2026-03-05/settings/`
- note: used archive move instead of hard-delete for safe rollback

### Batch 4: Components Boundary Pass

Target:
- embedded-only view files that are UI fragments rather than pages

Action:
- move qualified files from `src/views/**` to `src/components/**`
- update imports only, keep behavior unchanged

Exit criteria:
- non-page UI fragments are no longer in `views`
- `check:view-usage` still passes cleanly

Status:
- [x] completed
- moved UI-fragment embedded views into `src/components`:
  - `src/views/advanced/service-control/ServiceControlModal.vue`
    -> `src/components/advanced/service-control/ServiceControlModal.vue`
  - `src/views/network/wireless/macfilter/MacFilterBand.vue`
    -> `src/components/network/wireless/macfilter/MacFilterBand.vue`
  - `src/views/network/wireless/wps/WpsActions.vue`
    -> `src/components/network/wireless/wps/WpsActions.vue`
  - `src/views/network/wireless/wps/WpsVapInfo.vue`
    -> `src/components/network/wireless/wps/WpsVapInfo.vue`
- updated consuming pages:
  - `src/views/advanced/ServiceControl.vue`
  - `src/views/advanced/security/MacFilteringTab.vue`
  - `src/views/network/wireless/WpsConfig.vue`

## Safety Checklist (Each Batch)

- run `npm run check:view-usage`
- run `npm run build`
- verify top-level navigation still opens expected pages
- verify tab containers still render the same child views

## Notes

- Keep each batch small to avoid broken imports.
- If a file might be needed later but is not referenced now, archive first and delete in a later cleanup window.
