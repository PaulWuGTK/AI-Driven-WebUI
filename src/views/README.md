# Views Structure Guide

This file is the source of truth for `src/views` placement rules.

## Current Buckets

Top-level route pages should stay under these menu-aligned buckets:

- `src/views/status/*`
- `src/views/network/*`
- `src/views/advanced/*`
- `src/views/application/*`
- `src/views/iot/*`
- `src/views/system/*`
- `src/views/wizard/*`

Special root pages:

- `src/views/Login.vue`
- `src/views/Dashboard.vue`
- `src/views/InProgress.vue`

## Placement Rules

1. Route entry pages live in the bucket root, for example:
   - `src/views/network/wan/WanConfig.vue`
   - `src/views/advanced/SshConfig.vue`
2. Tab-only or child-only views live in a bucket subfolder (`tabs`, feature folder, or domain folder), for example:
   - `src/views/advanced/lcm/ExecEnvTab.vue`
   - `src/views/advanced/ssh/SshPublicKeyManagementTab.vue`
3. Do not place new route pages under legacy folders like `src/views/settings/*`.
4. If a file is shared only as a building block and is not a page, prefer `src/components/*` instead of `src/views/*`.

Legacy cleanup note:
- `src/views/settings/*` has been drained from active tree and archived under `archive/views-legacy/batch3-2026-03-05/`.

## Naming Rules

- Route page: `*Config.vue`, `*Management.vue`, `*Status.vue`, or a clear feature name.
- Tab page: `*Tab.vue`.
- Modal-only view shell: `*Modal.vue`.
- Avoid generic names like `Settings.vue` for new files.

## Usage Audit Command

Run this command before moving or deleting files:

```bash
npm run check:view-usage
```

The script reports:

- route views
- embedded-only views
- orphan views (not referenced by router or any imports)

## Current Orphan Candidates

As of the latest audit after Batch 1:

- none

Archived from Batch 1:

- `src/views/Settings.vue`
- `src/views/network/wireless/MacFiltering.vue`
- `src/views/network/wireless/basic/WirelessBandConfig.vue`
- `src/views/settings/wireless/WirelessExtenderTab.vue`

Archive location:

- `archive/views-orphans/batch1-2026-03-05/`

## Reorg Workflow

When adjusting `src/views`:

1. run `npm run check:view-usage`
2. move files in one small batch
3. update imports/routes
4. run `npm run build`
5. run `npm run check:view-usage` again and confirm orphan count trend

For the current execution order, see:

- `VIEWS_REORG_PLAN.md`
