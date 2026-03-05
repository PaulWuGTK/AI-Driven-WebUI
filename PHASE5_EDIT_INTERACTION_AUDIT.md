# Phase 5-1: Edit Interaction Consistency Audit

## Purpose

This document tracks the Phase 5-1 audit and implementation order for edit interaction consistency.

Goal:
- reduce inconsistent add/edit interaction patterns
- define when to use `modal` vs `replace`
- provide a single checklist so future work does not drift halfway

Scope:
- table-driven CRUD pages
- add / edit interaction only
- do not change business logic unless required by the UI mode change

Out of scope:
- section shell refactor
- form field refactor
- table refactor
- complex workflow redesign

## Decision Rules

Use `modal` when:
- the page is a rule list or table-driven CRUD
- add/edit is single-record focused
- the form is short to medium length
- the user benefits from keeping the list visible behind the editor
- no separate detail/back flow is required

Use `replace` when:
- the form is multi-section or long
- conditional fields are dense
- the page has `list -> edit -> detail/back` style flow
- the form needs more vertical space or full-page context
- the page behaves more like a configuration screen than a lightweight CRUD dialog

Do not force a page to switch mode just for uniformity.
The target is consistent rules, not one single UI pattern everywhere.

## Current Audit Result

### Keep As Modal

- [x] `StaticRouteTab`
  - file: `src/views/network/routing/StaticRouteTab.vue`
  - reason: standard table CRUD, modal already fits

- [x] `ExecEnvTab`
  - file: `src/views/advanced/lcm/ExecEnvTab.vue`
  - reason: list stays visible, form complexity still modal-safe

- [x] `DeploymentUnitTab`
  - file: `src/views/advanced/lcm/DeploymentUnitTab.vue`
  - reason: current pattern already uses overlay edit flow and is internally consistent within LCM

- [x] `ServiceControl`
  - file: `src/views/advanced/ServiceControl.vue`
  - reason: rule-based CRUD with dedicated modal component

- [x] `QosRuleTab`
  - file: `src/views/network/qos/QosRuleTab.vue`
  - reason: standard add/edit dialog, good modal candidate

### Keep As Replace

- [x] `BasicWanCht`
  - file: `src/views/network/wan/BasicWanCht.vue`
  - reason: edit form is a separate configuration view with multiple protocol forms

- [x] `WanModeManagement`
  - file: `src/views/network/wan/WanModeManagement.vue`
  - reason: edit and detail are separate flows, replace is more suitable

- [x] `TR369Config`
  - file: `src/views/system/device/TR369Config.vue`
  - reason: add/edit/detail is a three-state flow, better kept as page replacement

- [x] `SshServerManagement`
  - file: `src/views/advanced/ssh/SshServerManagement.vue`
  - reason: edit form is multi-section with conditional fields, modal would be cramped

### Priority To Convert To Modal

- [x] `DdnsConfig`
  - file: `src/views/advanced/DdnsConfig.vue`
  - current mode: `modal`
  - target mode: `modal`
  - reason: converted in Step 2, table now remains visible while editing

- [x] `PortForwardingTab`
  - file: `src/views/advanced/nat/PortForwardingTab.vue`
  - current mode: `modal`
  - target mode: `modal`
  - reason: converted in Step 3, rule list now stays visible during add/edit

### Excluded For Now

- [x] `IPv4Config`
  - file: `src/views/network/lan/IPv4Config.vue`
  - reason: mixed page with core config plus reservation editing, not a clean Phase 5-1 target

- [x] `SshPublicKeyManagement`
  - file: `src/views/advanced/ssh/SshPublicKeyManagement.vue`
  - reason: this is not a normal add/edit CRUD flow, mostly view/delete plus inline add section

## Implementation Order

### Step 1: Baseline Rule Freeze

- [x] Confirm the project rule set for `modal` vs `replace`
- [x] Freeze the initial classification in this document
- [ ] If a page is discovered later, append it here before implementation starts

Exit criteria:
- future Phase 5 work references this file first

### Step 2: Convert `DdnsConfig` To Modal

- [x] Reuse existing `DdnsForm` where possible
- [x] Wrap add/edit with `BaseModal`
- [x] Keep existing API behavior unchanged
- [x] Preserve `data-testid`
- [x] Preserve success/error handling
- [x] Preserve mobile behavior
- [x] Remove obsolete `management-view` / `edit-view` page switch logic if no longer needed

Exit criteria:
- add/edit no longer hides the table
- table remains visible while editing
- save/cancel behavior matches other modal CRUD pages

### Step 3: Convert `PortForwardingTab` To Modal

- [x] Reuse `PortForwardingForm` if possible
- [x] Replace `isEditing` page swap with modal state
- [x] Keep delete confirmation unchanged
- [x] Preserve existing validation and API payloads
- [x] Preserve `data-testid`
- [x] Verify desktop and mobile views

Exit criteria:
- add/edit uses modal
- rule list remains visible behind editor
- no regression in create, edit, delete, cancel flow

### Step 4: Cross-Page Consistency Check

- [x] Compare header actions across modal CRUD pages
- [x] Compare cancel/save wording across modal CRUD pages
- [x] Compare close behavior
- [x] Compare dirty-state handling if present
- [x] Compare loading / error feedback pattern

Target pages:
- `StaticRouteTab`
- `ExecEnvTab`
- `DeploymentUnitTab`
- `ServiceControl`
- `QosRuleTab`
- `DdnsConfig`
- `PortForwardingTab`

Exit criteria:
- modal CRUD pages follow the same mental model
- differences are intentional and documented

Result:
- audit completed
- consistency is improved, but not fully aligned yet
- follow-up normalization work is still recommended

### Step 5: `QosRuleTab` Consistency Normalization

- [x] Replace blocking `alert(...)` validation with inline modal banner
- [x] Replace save/load/apply `alert(...)` feedback with `BaseToast`
- [x] Align modal button order to `Cancel` left, primary action right
- [x] Align header add button to shared button component usage
- [x] Move section shell to `SectionCard`
- [x] Keep drag-drop behavior unchanged and verify no regression
- [x] Keep immediate `post` apply flow unchanged and verify no regression

Exit criteria:
- `QosRuleTab` no longer uses blocking `alert(...)`
- header, modal footer, and page actions follow the current shared pattern
- drag ordering and apply timing remain unchanged

### Step 6: Modal Form Spacing Normalization

- [x] First batch aligned
  - `DdnsForm`
  - `PortForwardingForm`
  - `StaticRouteForm`
  - `ServiceControlModal`
- [x] Second batch aligned
  - `ExecEnvTab`
  - `DeploymentUnitTab`
- [x] Excluded from this step
  - `SshServerEditForm` because it belongs to `replace`, not modal CRUD
- [ ] Remaining modal forms to evaluate case-by-case if they are outside Phase 5 CRUD scope

Exit criteria:
- modal CRUD forms follow the same spacing rhythm
- spacing changes do not alter form logic or API behavior
- no global `forms.css` change is required to achieve alignment

### Modal Form Spacing Rules

These rules are now the default for modal CRUD forms in Phase 5 work.

Do:
- use a compact modal form wrapper to control top-level vertical rhythm
- use `gap: 16px` for the main vertical flow between field blocks or sections
- use `label -> control` spacing around `6px`
- keep action area separation around `16px`
- when a parent form controls the vertical rhythm, clear nested `.form-group` bottom margin
- keep subsection blocks internally consistent with `12px` to `16px` rhythm

Do not:
- change global `src/styles/components/forms.css` just to fix one modal
- let nested `BaseInput` / `BaseSelect` / `BaseTextarea` add a second vertical rhythm layer
- mix loose page-form spacing and compact modal-form spacing in the same editor

Implementation note:
- prefer local scoped alignment first
- if a future third batch repeats the exact same rules again, extract a shared modal spacing helper class

### Table Action Alignment Rules

For modal CRUD list pages, the desktop table action column should follow one visual rule:

- keep the last `Action` column at a fixed width around `112px`
- center-align the action header and cell content
- keep the icon group centered inside the cell
- keep the action group minimum width stable so rows do not shift visually

Applied pages:
- `DdnsConfig`
- `PortForwardingTab`
- `StaticRouteTab`
- `ServiceControl`
- `QosRuleTab`
- `ExecEnvTab`
- `DeploymentUnitTab`

### Row Header Height Rule

For pages using `header-row` or `SectionCard` with `header-mode="row"`:

- keep a shared minimum header height of `83px`
- this avoids headers without action buttons collapsing shorter than headers with buttons
- implement this in shared layout rules, not page-local overrides

Source of truth:
- `src/styles/layouts/page.css`

### BaseMobileActionRow Whitelist

This whitelist is only for pages that:
- do not use `BaseTable` mobile cards
- already converged to the same mobile action-row mental model
- behave like CRUD list cards, not pure status cards or special workflow cards

Shared target pattern:
- left side: `Action` label
- right side: action group
- action group uses horizontal `inline-flex + nowrap`
- no extra divider above the action row unless the card structure explicitly requires it

Safe whitelist:
- `DdnsConfig`
  - file: `src/views/advanced/DdnsConfig.vue`
  - action type: `edit + delete`
- `PortForwardingTab`
  - file: `src/views/advanced/nat/PortForwardingTab.vue`
  - action type: `edit + delete`
- `ServiceControl`
  - file: `src/views/advanced/ServiceControl.vue`
  - action type: `edit + delete`
- `ExecEnvTab`
  - file: `src/views/advanced/lcm/ExecEnvTab.vue`
  - action type: `edit + delete + enable toggle`
- `DeploymentUnitTab`
  - file: `src/views/advanced/lcm/DeploymentUnitTab.vue`
  - action type: `edit + delete`
- `ExecutionUnitTab`
  - file: `src/views/advanced/lcm/ExecutionUnitTab.vue`
  - action type: `start/stop + optional secondary action`
- `SshServerManagement`
  - file: `src/views/advanced/ssh/SshServerManagement.vue`
  - action type: `edit + delete`
- `TR369Config`
  - file: `src/views/system/device/TR369Config.vue`
  - action type: `edit + delete`

Do not include in this whitelist yet:
- `SshPublicKeyManagement`
  - reason: mobile card contains `Public Key` view action plus delete, not a normal CRUD action row
- `BasicWanCht`
  - reason: protocol cards are configuration entry cards, not CRUD list cards
- `UpnpConfig`
  - reason: interaction shape still needs separate review
- `ThreadCommissioner`
  - reason: mixed operational/status card patterns
- `MacFilterBand`
  - reason: mobile card shape is not yet normalized with the CRUD set
- `LanStatusCht`
  - reason: status page, not CRUD
- `WanStatusCht`
  - reason: status page, not CRUD
- `FirmwareUpgrade`
  - reason: operational workflow card, not CRUD
- `FirmwareUpdate`
  - reason: operational workflow card, not CRUD
- `ExtenderConfig`
  - reason: mixed configuration and scan result cards
- `MeshClientTable`
  - reason: component-level table/card hybrid, needs separate review

## Phase 5-2: Sidebar User Role Visibility Control

Background:
- `PRPL CPE WebUI.csv` has role-based visibility requirements (`super user` / `normal user`)
- backend plans to append role info in `SidebarMenu` API payload (example: `user: "normal"`)
- current frontend visibility only considers `menuKey + NetLayoutType + operationMode + features`

Goal:
- add role-based visibility without breaking existing menu rules
- keep one source of truth for visibility across sidebar and route access
- prevent hidden-menu pages from being directly accessed by URL

### Planned Data Contract

Target `SidebarMenu` payload extension:
- `SidebarMenu.user: "super" | "normal"` (backend may temporarily return unknown variants)

Frontend normalization rule:
- unknown / missing role value falls back to `normal` (secure default)

### Implementation Checklist

Step A: Sidebar API Type + Normalization
- [x] update `src/services/api/sidebarMenu.ts`
- [x] add `UserRole` type (`super | normal`)
- [x] add `normalizeUserRole(value)` helper
- [x] include normalized `user` in `normalizeSidebarMenuResponse(...)`
- [x] keep existing `NetLayoutType` normalization unchanged

Step B: Visibility Rule Engine Extension
- [x] update `src/types/menuVisibility.ts`
- [x] extend `MenuVisibilityRule` with role dimension
- [x] update `isMenuVisible(...)` signature to accept `userRole`
- [x] keep existing behavior equivalent for pages that do not define role-specific difference
- [x] define explicit allow matrix for role-restricted items from csv

Step C: Sidebar Rendering Integration
- [x] update `src/components/Sidebar.vue`
- [x] read `response.SidebarMenu.user` into local reactive state
- [x] pass `userRole` into all `isMenuVisible(...)` calls
- [x] preserve current language/mode/netlayout/features behavior

Step D: Route Guard Protection
- [x] update `src/router/index.ts`
- [x] add route-level deny check using same visibility rule source
- [x] block direct URL access to menu-hidden pages
- [x] define fallback route when denied (recommend `/dashboard`)

Step E: Auth Session Hygiene
- [x] update `src/services/auth.ts`
- [x] clear role-related cache value on logout/session clear
- [x] ensure no stale role remains after user switch

Step F: QA and Regression
- [x] verify `super` login can access all intended pages
- [x] verify `normal` login hides restricted menu items
- [x] verify direct URL to restricted route is blocked
- [x] verify role fallback works when backend returns unknown role
- [x] verify existing mode/netlayout/features visibility is unchanged

Step F execution notes:
- automated rule check executed via `npx tsx` against `menuRoleVisibilityRules`
  - restricted key count: `18`
  - failed key count: `0`
- route guard coverage gap found and fixed during Step F
  - added `/basic/nat` and `/basic/security` prefixes in `routeVisibilityRules`
- static fallback validation confirmed
  - unknown role path is normalized to `normal` in `normalizeUserRole(...)`
- type/build regression check passed
  - `npm run build` passed after all Step F updates

Manual smoke still recommended:
- one browser pass with backend returning `user=super`
- one browser pass with backend returning `user=normal`

### Acceptance Criteria

- same menu item visibility result is used by sidebar and router
- no route is reachable by URL when hidden due to role restriction
- unknown backend role does not crash UI and defaults to `normal`
- existing `PRPL/GENIX/CHT + mode + features` behavior has no regression

### Risks and Mitigation

Risk:
- backend role naming may differ during integration (`super user`, `admin`, `normal user`, etc.)

Mitigation:
- implement robust role normalization map in sidebar API layer
- keep raw value logging in development for quick mapping adjustment

Risk:
- duplicated visibility logic between sidebar and router

Mitigation:
- route guard must call same shared visibility function/rule table used by sidebar

Extraction rule:
- only extract `BaseMobileActionRow` after at least two more whitelist pages need the exact same markup
- do not force special pages into this component just to increase reuse count

## Post-Phase UI Audit

This section records follow-up issues found after the main Phase 5 work was completed.
The goal is to keep the remaining cleanup visible and prioritized, instead of letting it drift into chat history.

### Priority A: Bundle / Load Performance

- [x] Add bundle splitting strategy in `vite.config.ts`
  - file: `vite.config.ts`
  - current state: added `manualChunks` for `vue` core, chart libraries, `d3`, and remaining vendor packages
  - result: main `index` chunk dropped below the previous warning threshold
  - impact: initial load size and cache efficiency

### Priority B: Dead Or Legacy UI Shells

- [x] Review `DdnsTable.vue` for removal or formal deprecation
  - file: `src/components/ddns/DdnsTable.vue`
  - current state: no active import was found during project scan
  - result: removed as dead component
  - impact: maintenance noise and future regression risk if someone revives it unintentionally

- [x] Review `DdnsForm.vue` non-embedded mode shell
  - file: `src/components/ddns/DdnsForm.vue`
  - current state: embedded mode is aligned for modal usage, and standalone mode now uses shared surface/radius/shadow tokens
  - result: old hardcoded white/4px/rgba shell styling removed
  - impact: future reuse may accidentally reintroduce old styling

### Priority C: Token / Visual Consistency

- [x] Normalize `Dashboard.vue` card shell to shared visual tokens without changing layout structure
  - file: `src/views/Dashboard.vue`
  - current state: page layout remains intentionally special, but card shell and retry button now use shared visual tokens instead of hardcoded values
  - note: this page is intentionally kept structurally special and should not be forced into `SectionCard`
  - result: token drift removed without changing dashboard layout structure

### Priority D: Remaining Legacy Section Shell Pages

- [x] Review `ExecutionUnitTab.vue` as a remaining legacy LCM shell
  - file: `src/views/advanced/lcm/ExecutionUnitTab.vue`
  - current state: migrated to `SectionCard`
  - result: raw `.panel-section + .header-row + .section-title-sp` shell removed
  - impact: higher chance of future mobile/header regressions

- [x] Review `MonitorTab.vue` as a remaining legacy LCM shell
  - file: `src/views/advanced/lcm/MonitorTab.vue`
  - current state: migrated to `SectionCard`
  - result: raw `.panel-section + .header-row + .section-title-sp` shell removed
  - impact: higher chance of future mobile/header regressions

### Notes

- `npm run build` passed during this audit round
- no new TypeScript or build blockers were found
- remaining items are mostly cleanup, consistency, and performance tasks rather than broken core functionality

### Step 4 Findings

#### A. Modal Container Is Still Split Into Two Families

Family 1: uses `BaseModal`
- `QosRuleTab`
- `DdnsConfig`
- `PortForwardingTab`

Family 2: uses custom overlay modal
- `StaticRouteTab` via `StaticRouteForm`
- `ExecEnvTab`
- `DeploymentUnitTab`
- `ServiceControl` via `ServiceControlModal`

Impact:
- overlay close behavior is not guaranteed to match
- `Esc` close behavior is only guaranteed on `BaseModal`
- close button placement and header layout vary by page

Action:
- treat this as a later normalization pass, not a blocker for Phase 5-1 closure

#### B. Save / Confirm Wording Is Not Unified

Observed button wording:
- `Add / Cancel` in `QosRuleTab`
- `Save / Cancel` in `DdnsConfig`
- default `Apply / Cancel` semantics in `PortForwardingForm`
- `Confirm / Cancel` in `StaticRouteForm` and `ServiceControlModal`
- `Add` or `Save` in `ExecEnvTab`
- `Add` or `Update` in `DeploymentUnitTab`

Assessment:
- `Save` for edit and `Add` for create is the clearest pattern
- `Confirm` is too generic for CRUD forms
- `Apply` is better reserved for page-level configuration, not modal CRUD

Recommended target rule:
- create: `Add`
- edit: `Save`
- dismiss: `Cancel`

#### C. Feedback Pattern Is Not Unified

Current patterns:
- `DdnsConfig` and `ServiceControl` use `BaseToast`
- `StaticRouteTab`, `ExecEnvTab`, `DeploymentUnitTab` use inline success banners
- `PortForwardingTab` uses inline error banner and no success toast
- `QosRuleTab` feedback was normalized in Step 5 and no longer uses blocking `alert(...)`

Assessment:
- `QosRuleTab` was the main outlier and has been normalized in Step 5
- `PortForwardingTab` is acceptable short-term but should eventually align
- `BaseToast` is the most reusable and least disruptive long-term pattern

Recommended target rule:
- load failure: page-level error state
- save/delete failure: toast or inline banner, but choose one pattern across modal CRUD pages
- save/delete success: toast preferred

#### D. Dirty-State Handling Is Effectively Unmanaged Across All Pages

Current status:
- none of the audited pages implement unsaved-change confirmation on modal close
- closing the modal discards local edits immediately

Assessment:
- consistent, but only because the feature does not exist anywhere
- acceptable to defer unless product explicitly requires dirty-state protection

Decision:
- document as intentionally deferred

#### E. Header Action Pattern Is Mostly Consistent

Shared pattern already present:
- table/list remains visible
- add action sits in the section header
- row actions stay in the table/card action column

Notable outlier:
- resolved in Step 5: `QosRuleTab` now uses `SectionCard`

Assessment:
- this is structural, not interaction-critical
- do not expand scope here

## Step G: Tab-Level Permission Audit

Purpose:
- identify tab container pages that should enforce menu visibility at tab level
- prevent hidden submenu items from still appearing via in-page tabs

Current status:

### Already role-aware at tab level

- [x] `src/views/network/wireless/WirelessConfig.vue`
  - tab keys mapped to:
    - `basicSetup.wlan.basicConfig`
    - `basicSetup.wlan.advancedConfig`
    - `basicSetup.wlan.wpsConfig`
    - `basicSetup.wlan.meshNetwork`
    - `basicSetup.wlan.wifiZones`
- [x] `src/views/advanced/nat/NatConfig.vue`
  - tab keys mapped to:
    - `basicSetup.nat.portForwarding`
    - `basicSetup.nat.dmzHost`
    - `basicSetup.nat.alg`
- [x] `src/views/advanced/SecurityConfig.vue`
  - tab keys mapped to:
    - `basicSetup.security.ipFiltering`
    - `basicSetup.security.macFiltering`

### Pending: should add tab-level visibility (high value)

- [x] `src/views/network/lan/LanConfig.vue`
  - suggested tab keys:
    - `ipv4` -> `basicSetup.lan.ipv4`
    - `devices` -> `basicSetup.lan.deviceConnected`
  - reason: these two submenu keys already exist and can differ by mode/layout
  - status: implemented with `useMenuVisibilityContext`, plus active-tab fallback after filtering

### Pending: optional/future-proof

- [x] `src/views/system/settings/SettingsManagement.vue`
  - suggested tab keys:
    - `reset` -> `management.settings.resetToDefault`
    - `backup` -> `management.settings.backupRestore`
    - `update` -> `management.settings.updateSoftware`
  - reason: currently same visibility, but mapping now prevents future drift
  - status: implemented with `useMenuVisibilityContext`, query-tab sync, and filtered-tab fallback

- [x] `src/views/system/diagnostics/DiagnosticsTools.vue`
  - suggested tab keys:
    - `ping` -> `management.tools.pingDiagnosis`
    - `traceroute` -> `management.tools.traceRoute`
    - `dnslookup` -> `management.tools.dnsDiagnosis`
  - reason: currently same visibility, but mapping now prevents future drift
  - status: implemented with `useMenuVisibilityContext`, query-tab sync, and filtered-tab fallback

### Not required now (single-bucket tabs)

- `src/views/network/wan/WanConfig.vue`
- `src/views/network/routing/RoutingConfig.vue`
- `src/views/network/qos/QosConfig.vue`
- `src/views/advanced/SshConfig.vue`
- `src/views/advanced/LcmConfig.vue`
- `src/views/system/device/DeviceManagement.vue`
- `src/views/network/wireless/GuestNetwork.vue`
- `src/views/iot/thread/ThreadLayout.vue`
- `src/views/network/wireless/MacFiltering.vue`
- `src/views/advanced/security/MacFilteringTab.vue`

These tabs are feature/content partitions inside one permission bucket, not sidebar submenu-level permission splits.

### Step G execution order

1. `LanConfig` tab-level gating (required) - done
2. `SettingsManagement` tab-level gating (optional) - done
3. `DiagnosticsTools` tab-level gating (optional) - done
4. extend route-level guard mapping only if direct URL bypass is found in validation - done

Step G-4 execution notes:
- `src/router/index.ts` route visibility mapping extended for:
  - `Lan` container/sub-routes
  - `Wireless` container/sub-routes
  - `SettingsManagement` container/sub-routes
  - `DiagnosticsTools` container/sub-routes (including `tr471`)
- `resolveMenuKeyFromRoute(...)` switched to longest-prefix match to avoid generic prefix overriding specific route keys

## Related Refactor Docs

- Service/mock cleanup batching plan:
  - `SERVICE_MOCK_REFACTOR_PLAN.md`

## Verification Checklist

Run after each page conversion:

- [ ] add opens the correct editor
- [ ] edit loads the correct record
- [ ] cancel closes without unintended mutation
- [ ] save updates the list correctly
- [ ] delete flow still works
- [ ] loading state still displays correctly
- [ ] API `NOK` / failure path still displays correctly
- [ ] desktop layout is stable
- [ ] mobile layout is stable
- [ ] `data-testid` remains available for QA

## Completion Definition

Phase 5-1 is complete when:
- `DdnsConfig` is converted to modal
- `PortForwardingTab` is converted to modal
- all pages in this document are explicitly classified
- verification checklist passes for converted pages
- this document is updated to reflect final status

## Notes

- This phase is about interaction consistency, not visual redesign.
- Do not expand scope into unrelated refactors while converting pages.
- If a target page reveals large structural issues, stop and record it here before continuing.

