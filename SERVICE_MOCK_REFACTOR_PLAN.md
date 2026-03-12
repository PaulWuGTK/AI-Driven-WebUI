# Service Mock Refactor Plan

## Purpose

This document tracks the service-layer mock cleanup plan.

Goal:
- keep `src/services/api/*` focused on API behavior and response mapping
- centralize mock payload/state in `src/services/mockData/*`
- remove mixed patterns where mock state is defined inside API files

Out of scope:
- UI logic changes
- backend API contract changes

## Current Inventory

### Group A: API files with inline mock payload/state (highest priority)

These files currently define `const mock...` (or mutable mock state) inside `src/services/api/*`.

- `src/services/api/ipFiltering.ts`
- `src/services/api/generalMacFiltering.ts`
- `src/services/api/macFiltering.ts`
- `src/services/api/extender.ts`
- `src/services/api/lcmMonitor.ts`
- `src/services/api/lcmExecEnv.ts`
- `src/services/api/lcmExecutionUnit.ts`
- `src/services/api/lcmDeploymentUnit.ts`
- `src/services/api/serviceControl.ts`
- `src/services/api/thread.ts`
- `src/services/api/tr471.ts` (inline mock result generation path)

### Group B: API files still using legacy `mockApi.ts` aggregator (high priority)

- `src/services/api/operationMode.ts`
- `src/services/api/mesh.ts`
- `src/services/api/staticRoute.ts`

Legacy dependency:
- `src/services/mockApi.ts`

### Group C: API files already importing from `mockData` (baseline OK, review only)

Representative files:
- `src/services/api/basicWanCht.ts`
- `src/services/api/basicBridgeLan.ts`
- `src/services/api/cellular.ts`
- `src/services/api/device.ts`
- `src/services/api/diagnostics.ts`
- `src/services/api/log.ts`
- `src/services/api/portForwarding.ts`
- `src/services/api/ssh.ts`
- `src/services/api/statusBridgeLan.ts`
- `src/services/api/statusWanCht.ts`
- `src/services/api/tr369.ts`
- `src/services/api/wanManagement.ts`
- `src/services/api/wanSetup.ts`
- `src/services/api/wireless.ts`
- `src/services/api/wizard.ts`

## Batch Execution Order

### Batch 1 (safe + high impact)

Target:
- `ipFiltering.ts`
- `generalMacFiltering.ts`
- `macFiltering.ts`
- `serviceControl.ts`

Action:
- move inline mock payload and mutable state into `src/services/mockData/*`
- keep API method signatures unchanged
- keep current UI behavior unchanged

Exit criteria:
- no inline `const mock...` remains in these 4 API files
- build passes
- existing save/apply flows unchanged

Status:
- [x] completed
- extracted mock modules:
  - `src/services/mockData/ipFilteringMockData.ts`
  - `src/services/mockData/generalMacFilteringMockData.ts`
  - `src/services/mockData/macFilteringMockData.ts`
  - `src/services/mockData/serviceControlMockData.ts`
- updated API files:
  - `src/services/api/ipFiltering.ts`
  - `src/services/api/generalMacFiltering.ts`
  - `src/services/api/macFiltering.ts`
  - `src/services/api/serviceControl.ts`

### Batch 2 (feature modules with mutable mock state)

Target:
- `extender.ts`
- `lcmMonitor.ts`
- `lcmExecEnv.ts`
- `lcmExecutionUnit.ts`
- `lcmDeploymentUnit.ts`

Action:
- extract mock state/store helpers into dedicated `mockData` modules
- reduce mutation logic inside API files to data access calls

Exit criteria:
- API files only orchestrate requests + mapping
- mock state transitions remain functionally identical

Status:
- [x] completed
- extracted mock modules:
  - `src/services/mockData/extenderMockData.ts`
  - `src/services/mockData/lcmMonitorMockData.ts`
  - `src/services/mockData/lcmExecEnvMockData.ts`
  - `src/services/mockData/lcmExecutionUnitMockData.ts`
  - `src/services/mockData/lcmDeploymentUnitMockData.ts`
- updated API files:
  - `src/services/api/extender.ts`
  - `src/services/api/lcmMonitor.ts`
  - `src/services/api/lcmExecEnv.ts`
  - `src/services/api/lcmExecutionUnit.ts`
  - `src/services/api/lcmDeploymentUnit.ts`

### Batch 3 (complex domain)

Target:
- `thread.ts`
- `tr471.ts`

Action:
- extract large inline mock structures and generators
- keep scenario behavior unchanged

Exit criteria:
- thread/tr471 API files no longer contain large inline mock payload blocks

Status:
- [x] completed
- extracted mock modules:
  - `src/services/mockData/threadMockData.ts`
  - `src/services/mockData/tr471MockData.ts`
- updated API files:
  - `src/services/api/thread.ts`
  - `src/services/api/tr471.ts`

### Batch 4 (legacy aggregator removal)

Target:
- `operationMode.ts`
- `mesh.ts`
- `staticRoute.ts`
- `mockApi.ts`

Action:
- migrate remaining `mockApi.ts` consumers to direct `mockData` modules
- remove `mockApi.ts` when no longer referenced

Exit criteria:
- no imports from `../mockApi`
- `mockApi.ts` can be safely removed

Status:
- [x] completed
- extracted/updated mock modules:
  - `src/services/mockData/operationModeMockData.ts`
  - `src/services/mockData/staticRouteMockData.ts`
  - `src/services/mockData/meshMockData.ts`
- updated API files:
  - `src/services/api/operationMode.ts`
  - `src/services/api/mesh.ts`
  - `src/services/api/staticRoute.ts`
- removed legacy aggregator:
  - `src/services/mockApi.ts`

## Verification Checklist (run every batch)

- [ ] `npm run build` passes
- [ ] no public API function signature changes
- [ ] no behavior regressions in affected pages
- [ ] no new circular import between `api` and `mockData`
- [ ] no inline `mock` payload blocks in completed target files

## Tracking Notes

Recommended command for spotting remaining inline mocks:

```powershell
rg -n "\bconst\s+mock|\blet\s+mock|mock[A-Za-z0-9_]*Data" src/services/api
```

Recommended command for spotting legacy aggregator usage:

```powershell
rg -n "from '../mockApi'|from \"../mockApi\"" src/services/api src/services
```
