---
name: webui-generator
description: "Generate complete WebUI pages from Lua backend files and/or API response JSON. Produces all required files: TypeScript types, mock data, API service, Vue view, router, sidebar, i18n (7 languages), and menu visibility rules."
---

# WebUI Page Generator — Lua + API Driven

Generate a **complete, production-ready** WebUI page from a Lua backend file and/or API response JSON. The generator produces every file needed to integrate the page into the project.

This skill is designed to work **with or without an existing codebase**. When no existing code is available, it relies on `reference/` documentation to ensure the generated pages match the project's design system exactly.

---

## Prerequisites — reference

The `reference/` folder contains the project's design specifications. **Before generating any code**, read these files to understand the project conventions:

| File | Read When | What It Provides |
|---|---|---|
| `reference/05-ui-components.md` | **Always** | BaseTable, BaseModal, BaseSelect props, slots, events — needed to use components correctly |
| `reference/06-style-guide.md` | **Always** | CSS variables (`--color-primary`, `--shadow-sm`, etc.), spacing, typography, global CSS classes |
| `reference/03-page-structure.md` | **Always** | Application chrome (Sidebar/Header/Login), page layout hierarchy (`.page-container` → `.page-title` → `.page-content` → `.panel-section`), loading/error states, dashboard gauge/port patterns |
| `reference/07-i18n-guide.md` | **Always** | i18n namespace naming rules, locale file structure, translation conventions for 7 languages |
| `reference/01-api-specification.md` | When checking existing API patterns | API endpoint URL format, request/response conventions |
| `reference/02-data-models.md` | When verifying type naming | TypeScript interface naming conventions, PascalCase rules |
| `reference/04-routing-permissions.md` | When adding routes | Route path patterns, redirect conventions, visibility rule format |

**Action**: At the start of generation, read `05-ui-components.md`, `06-style-guide.md`, `03-page-structure.md`, and `07-i18n-guide.md` in full. Reference the others as needed.

---

## Application Chrome — Visual Identity

When generating a **complete web application** (not just a single page), the following application-chrome components must be generated to match the Gemtek router WebUI visual identity. Refer to `03-page-structure.md` §0 and `06-style-guide.md` §9.1 for full specifications.

### App.vue Layout Pattern

```vue
<template>
  <div class="app-container">
    <template v-if="showChrome">
      <Sidebar />
      <div class="main-content">
        <Header />
        <div class="page-wrapper">
          <router-view />
        </div>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>
```

- `showChrome` = `route.path !== '/login' && !route.path.startsWith('/wizard')`
- `.app-container` = `display: flex; width: 100vw; height: 100vh; overflow: hidden;`

### Sidebar Visual Spec

| Property | Value |
|----------|-------|
| Width | `var(--sidebar-width)` = 265px |
| Background | `linear-gradient(to bottom, #006BC4 8%, #45B1E4 100%)` |
| Logo | "Gemtek" white text, 60px height, `#006BC4` solid bg |
| Text | White (`rgba(255,255,255,0.9)`) |
| Active item | `background-color: #409FD5; font-weight: 700` (bold) |
| Hover | `rgba(255,255,255,0.1)` |
| Arrow | White `▶`, rotates 90° on expand |
| Mobile | Hidden below 768px; hamburger button triggers overlay |

### Header Visual Spec

| Property | Value |
|----------|-------|
| Height | `var(--header-height)` = 50px |
| Background | `#FFFFFF` |
| Border | `border-bottom: 1px solid #e0e0e0` |
| Layout | `flex`, all items right-aligned |
| Language | `<select>` dropdown, 7 languages |
| Username | From `sessionStorage.getItem('username')` |
| Logout | Red text (`#dc3545`), clears session → `/login` |
| Icons | Material Icons Unicode chars (no font file needed) |

### Login Visual Spec

| Property | Value |
|----------|-------|
| Background | Same gradient as Sidebar (`#006BC4 → #45B1E4`) |
| Card | White, `max-width: 400px`, `border-radius: 12px` |
| Logo | "Gemtek", `color: #0c78be`, `font-size: 2rem`, bold |
| Captcha | SVG math captcha in dev mode, API image in prod |
| Captcha expiry | 60-second auto-refresh with countdown |
| Button | Full-width, `background: #0070BB` |

### Page Title Convention

All authenticated pages use `.page-title` with **blue text** (not black):
```css
.page-title {
  font-size: 2rem;
  color: var(--color-primary);  /* #0070BB — blue, not default black */
  padding: 1rem 0 1rem 2rem;
  margin: 0;
}
```

### Info Display Layout Patterns

Two standard patterns exist for label-value data display. See `06-style-guide.md` §9.3 for full CSS.

**Pattern A: `.info-grid` + `.info-item`** (multi-column grid)
- Labels stacked above values, auto-fills multiple columns
- Use for: compact overview cards with short values

**Pattern B: `.info-list` + `.info-row`** (vertical list) — **default choice**
- One label-value pair per row: label left (200px), value **right-aligned** (`text-align: right`)
- Rows separated by light border-bottom
- Use for: Status pages (WAN, LAN, etc.), interface details, any page showing many fields
- Template:
```html
<div class="info-list">
  <div class="info-row">
    <span class="info-label">{{ t('feature.field') }}</span>
    <span class="info-value">{{ data?.Field }}</span>
  </div>
</div>
```

**Rule**: For `status-readonly` pages, always use `.info-list` + `.info-row` for key-value sections. Only use `.info-grid` + `.info-item` for compact dashboard card interiors where space is constrained.

### Dashboard Grid Layout

**All 6 dashboard sections** live in a single `.dashboard-grid` — System, CPU, Memory, WAN, WiFi, Ethernet. They are NOT split into a top grid + separate panel sections.

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}
@media (min-width: 1200px) {
  .dashboard-grid { grid-template-columns: repeat(3, 1fr); }
}
```

This creates two rows of three equal-width cards on desktop.

Each section uses `.dashboard-item` (padding: 1.5rem, white bg, rounded corners, shadow) with an inline `<h2 class="card-title">` — NOT the `.dashboard-card` / `.dashboard-card-header` / `.dashboard-card-body` pattern.

The content wrapper uses `status-content` (not `page-content`), since the grid handles its own padding.

### Dashboard Page Structure

Dashboard page title is "Home" (not "Dashboard") — i18n key `dashboard.title` = "Home" / "首頁" / "ホーム" etc., matching the sidebar "Home" menu item.

**All 6 sections in one `.dashboard-grid`** (3 columns, 2 rows on desktop):
- Row 1: System | CPU | Memory
- Row 2: WAN Status | WiFi Status | Ethernet

**Guest WiFi is NOT shown** on the Dashboard. Guest data (`Dashboard.Guest`) is optional and is not rendered.

### Dashboard Card Patterns

**Card header naming** — Short, concise titles: "System", "CPU", "Memory" (not "System Information", "CPU Usage"). Keep i18n keys short.

**Card inner layout** — Each `.dashboard-item` uses scoped `.info-grid` + `.info-item` with flex layout (`justify-content: space-between`), label left, value right. This is different from the global `.info-list`/`.info-row` used on status pages — dashboard cards use a more compact scoped style:

```css
.info-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; max-width: 100%; }
.info-item { display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 0.5rem; }
.info-label { color: #666; font-size: inherit; font-weight: normal; }
.info-val { color: #333; font-weight: 500; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

**Critical overrides** — The global `.info-grid` sets `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` and global `.info-item` sets `flex-direction: column`. Dashboard scoped styles MUST explicitly override these with `grid-template-columns: 1fr` and `flex-direction: row` to get the side-by-side label-left/value-right layout. Without these overrides, labels and values will stack vertically.

**Important**: Labels use `font-weight: normal` (400) and values use `font-weight: 500` — this creates a subtle visual distinction where values appear slightly bolder than labels. The scoped `.info-label` must override the global class which sets `font-weight: 500`.

**Donut gauge** — SVG circle gauge with dynamic threshold colors:
- `< 40%` → `#0070BB` (blue/normal)
- `40–79%` → `#FFA500` (orange/warning)
- `≥ 80%` → `#D32F2F` (red/danger)
- **Percentage text color matches gauge ring** — use `:style="{ color: gaugeColor }"` on `.gauge-value`, not static black

**System card** — `.info-grid` + `.info-item` label-value rows. Fields: Model, Serial Number, SoftwareVersion, HardwareVersion.

**Memory card** — Gauge centered, followed by `.info-grid` + `.info-item` rows (Used, Total, Free).

### Dashboard WiFi Section

WiFi section shows **only enabled bands** (filter by `Enable === 1`). Each enabled band is a compact `.wifi-network` card:

```html
<div class="wifi-network">
  <div class="network-row">
    <span class="row-label">SSID</span>
    <span class="row-value text-truncate">{{ band.data.SSID }}</span>
  </div>
  <div class="network-row">
    <span class="row-label">Band</span>
    <span class="row-value">{{ band.label }}</span>
  </div>
  <div class="network-row">
    <span class="row-label">Password</span>
    <span class="row-value password text-truncate">{{ band.data.Password }}</span>
  </div>
</div>
```

Scoped styles: `.row-label` 80px width, `.row-value` flex-end alignment, `.wifi-network` has `#f8f8f8` bg.

### Dashboard Ethernet Section

Ethernet ports sorted alphabetically, displayed as `.ports-grid` vertical list:

```html
<div class="port-item">
  <div class="port-icon" :class="{ active: port.Status === 'Up' }">
    <span class="port-icon-symbol">⇄</span>
  </div>
  <div class="port-info">
    <span class="port-name">{{ port.Port }}</span>
    <span class="port-role">{{ port.Role.toUpperCase() }}</span>
    <span class="port-speed">{{ port.Speed }} Mbps</span>
  </div>
</div>
```

Port icon (48px circle) with bidirectional arrow `⇄`:
- Inactive: `background: #f5f5f5; color: #666`
- Active: `background: #4caf50; color: white`

Port info: name (bold) + role badge (blue `rgba(0,112,187,0.1)` bg) + speed badge (gray bg)

---

## Input Requirements

The user must provide **at least one** of the following:

| Input | Purpose | Example |
|---|---|---|
| **Lua backend file** | Extract API endpoint, response structure, GET/POST support | `referfolder/webui-generic/prpl/Statistics.lua` |
| **API response JSON** | Exact response payload to derive TypeScript types | `{ "Statistics": { "Ethernet": [...] } }` |
| **Page name & location** | Where the page lives in the UI (sidebar section) | "Statistics under Status section" |

If only Lua is given, infer the JSON structure from the Lua code. If only JSON is given, infer the API endpoint from the JSON wrapper key.

---

## Step 1 — Analyze Lua Backend

Read the Lua file and extract:

### 1a. API Endpoint
- The Lua filename maps to the API list parameter: `Statistics.lua` → `/API/info?list=Statistics`
- Check if `post_func` returns real data or `method_not_allowed` → determines if POST is supported

### 1b. Response Structure
Trace `get_func()` to find:
- The top-level wrapper key (e.g., `result.Statistics = statistics`)
- Sub-objects and arrays (e.g., `statistics.Ethernet = {}`, `statistics.Wlan = {}`)
- Fields added to each entry (e.g., `tmp.Port`, `tmp.Role`, `tmp.RxBytes`)
- Field types: Lua `tostring()` → TypeScript `string`; Lua `tonumber()` → TypeScript `number`; Lua boolean → TypeScript `boolean`
- Optional fields: fields only added conditionally → TypeScript `fieldName?: type`

### 1c. POST Request Structure (if applicable)
Trace `post_func(arg)` to find:
- Expected input fields from `arg`
- Validation logic
- Response format (OK/NOK pattern)

---

## Step 2 — Read Design Specifications

**Before generating any code**, read these reference files to understand the design system:

1. **Read `reference/05-ui-components.md`** — understand all available components:
   - BaseTable: `columns` prop format, `row-key`, `initial-sort-key`, `#cell-{Key}` slot, `sortFn`, `headerDataTestid`
   - BaseModal: `modelValue`, `title`, `size`, `@update:modelValue`
   - BaseSelect: `options`, `modelValue`, `label`
   - Other reusable components and their props/slots/events

2. **Read `reference/06-style-guide.md`** — get exact CSS variables and classes:
   - Color variables: `--color-primary`, `--color-secondary`, `--color-danger`, etc.
   - Shadow variables: `--shadow-sm`, `--shadow-md`
   - Application chrome styles: Sidebar gradient, Header bar, Login page, page title blue color
   - Global layout classes: `.page-container`, `.page-title`, `.page-content`
   - Card classes: `.panel-section`, `.section-title`, `.card-content`
   - Form classes: `.form-group`, `.form-control`, `.form-actions`, `.btn`, `.btn-primary`
   - State classes: `.loading-state`, `.loading-spinner`, `.error-state`

3. **Read `reference/03-page-structure.md`** — understand page layout:
   - Page hierarchy and nesting rules
   - How tables, forms, and tabs are structured
   - Loading and error state patterns

4. **Read `reference/07-i18n-guide.md`** — understand translation rules:
   - Namespace naming (feature name as key)
   - How to structure keys for table columns, form labels, section titles
   - Translation quality expectations for each language

This step ensures the generated code matches the project's design system **even without an existing codebase to reference**.

---

## Step 3 — Ask the User

If not already specified, ask:

1. **Page name** — display name and i18n namespace (e.g., "Statistics" → namespace `statistics`)
2. **Sidebar location** — which section (Status, Basic Setup, Advanced, etc.) and position
3. **Page type** — one of:
   - `status-readonly` — GET only, display data in tables/cards (like Statistics, WAN Status)
   - `config-form` — GET + POST, form-based editing (like LAN Config, NTP)
   - `config-table` — GET + POST, table with add/edit/delete (like Port Forwarding, IP Filtering)
   - `config-tabs` — container with multiple tab sub-pages (like NAT, Security)
4. **Menu visibility** — which netLayoutTypes, operationModes, and roles should see this page

---

## Step 4 — Generate Files

Generate ALL of the following files. Use the patterns from reference and the templates below.

### 4a. TypeScript Types — `src/types/{feature}.ts`

```typescript
// Naming: {Feature}Entry for array items, {Feature}Response for top-level
// All backend fields use PascalCase
// String numeric values from Lua tostring() stay as `string` in TypeScript
// Optional fields use `?`

export interface {Feature}Entry {
  FieldName: string;
  OptionalField?: string;
}

export interface {Feature}Response {
  {WrapperKey}: {
    SubKey: {Feature}Entry[];
  }
}

// If POST is supported, add:
export interface {Feature}UpdateRequest {
  {WrapperKey}: {
    // POST payload fields
  }
}

export interface {Feature}ApiResponse {
  {WrapperKey}: {
    OK?: string;
    NOK?: string;
  }
}
```

Then update `src/types/index.ts` — add `export * from './{feature}';`

### 4b. Mock Data — `src/services/mockData/{feature}MockData.ts`

```typescript
import type { {Feature}Response } from '../../types/{feature}';

export const {feature}MockData: {Feature}Response = {
  // Realistic mock data matching the Lua output structure
  // Use realistic values, not all zeros
  // Include 2-4 entries per array
};
```

### 4c. API Service

**For simple GET-only pages**, add to `src/services/api.ts`:

```typescript
// Add import at top:
import type { {Feature}Response } from '../types';
import { {feature}MockData } from './mockData/{feature}MockData';

// Add function:
export async function get{Feature}(): Promise<{Feature}Response> {
  if (isDevelopment) {
    return {feature}MockData;
  }
  return callApi<{Feature}Response>(`${API_BASE_URL}/info?list={ApiListName}`);
}
```

**For GET+POST pages**, create `src/services/api/{feature}.ts`:

```typescript
import apiClient from '../apiClient';
import type { {Feature}Response, {Feature}UpdateRequest, {Feature}ApiResponse } from '../../types/{feature}';
import { {feature}MockData } from '../mockData/{feature}MockData';

const isDevelopment = import.meta.env.DEV;

export const {feature}Api = {
  async getConfig(): Promise<{Feature}Response> {
    if (isDevelopment) {
      return Promise.resolve({feature}MockData);
    }
    return apiClient.get<{Feature}Response>('/API/info?list={ApiListName}');
  },

  async updateConfig(data: {Feature}UpdateRequest): Promise<{Feature}ApiResponse> {
    if (isDevelopment) {
      // Update mock data in-place for dev mode
      return Promise.resolve({ {WrapperKey}: { OK: 'Success' } });
    }
    return apiClient.post<{Feature}ApiResponse>('/API/info?list={ApiListName}', data);
  }
};
```

### 4d. Vue View — `src/views/{section}/{Feature}.vue`

Follow the pattern based on page type:

#### status-readonly (like Statistics.vue)

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { {Feature}Response } from '../../types/{feature}';
import { get{Feature} } from '../../services/api';
import { BaseTable } from '../../components/common';
import { useQA } from '../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const data = ref<{Feature}Response | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Computed rows from response
const rows = computed(() => data.value?.{WrapperKey}.{SubKey} ?? []);

// Column definitions with i18n labels and sort functions
const columns = computed(() => [
  {
    key: 'FieldName',
    label: t('{namespace}.fieldName'),
    sortable: true,
    headerDataTestid: qa('{feature}-header-fieldname'),
  },
  // ... more columns
]);

const getRowTestId = (_row: any, index: number, mobile: boolean) =>
  qa(mobile ? `{feature}-card-${index}` : `{feature}-row-${index}`) ?? '';

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    data.value = await get{Feature}();
  } catch (err) {
    console.error('Error fetching {feature}:', err);
    error.value = 'Failed to fetch {feature}';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('{feature}-title')">{{ t('{namespace}.title') }}</h1>

    <div class="page-content" :data-testid="qa('{feature}-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('{feature}-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('{feature}-error')">
        {{ error }}
      </div>

      <template v-else-if="data">
        <div class="panel-section" :data-testid="qa('{feature}-section')">
          <div class="section-title" :data-testid="qa('{feature}-section-title')">
            {{ t('{namespace}.sectionTitle') }}
          </div>
          <div class="card-content">
            <BaseTable
              :columns="columns"
              :data="rows"
              row-key="UniqueKey"
              :table-data-testid="qa('{feature}-table')"
              :mobile-data-testid="qa('{feature}-mobile')"
              initial-sort-key="DefaultSortKey"
              initial-sort-order="asc"
              :row-data-testid="getRowTestId"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

.error-state {
  padding: 2rem;
  text-align: center;
  color: #dc3545;
  background-color: white;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}
</style>
```

#### config-form (like LAN Config)

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { {Feature}Response } from '../../types/{feature}';
import { {feature}Api } from '../../services/api/{feature}';
import { useQA } from '../../utils/qa';

const { qa } = useQA();
const { t } = useI18n();

const data = ref<{Feature}Response | null>(null);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

// Form fields as individual refs
const fieldName = ref('');

const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    data.value = await {feature}Api.getConfig();
    // Populate form fields from response
    fieldName.value = data.value.{WrapperKey}.FieldName ?? '';
  } catch (err) {
    console.error('Error loading {feature}:', err);
    error.value = 'Failed to load {feature}';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  saving.value = true;
  try {
    const result = await {feature}Api.updateConfig({
      {WrapperKey}: {
        FieldName: fieldName.value,
      }
    });
    if (result.{WrapperKey}.NOK) {
      error.value = result.{WrapperKey}.NOK;
    } else {
      await loadData(); // Refresh
    }
  } catch (err) {
    console.error('Error saving {feature}:', err);
    error.value = 'Failed to save {feature}';
  } finally {
    saving.value = false;
  }
};

onMounted(loadData);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('{feature}-title')">{{ t('{namespace}.title') }}</h1>

    <div class="page-content" :data-testid="qa('{feature}-content')">
      <div v-if="loading" class="loading-state" :data-testid="qa('{feature}-loading')">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>

      <div v-else-if="error" class="error-state" :data-testid="qa('{feature}-error')">
        {{ error }}
      </div>

      <template v-else-if="data">
        <div class="panel-section" :data-testid="qa('{feature}-section')">
          <div class="section-title">{{ t('{namespace}.sectionTitle') }}</div>
          <div class="card-content">
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label>{{ t('{namespace}.fieldName') }}</label>
                <input v-model="fieldName" type="text" class="form-control" />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? t('common.saving') : t('common.apply') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
```

#### config-table (like Port Forwarding)

Uses BaseTable + BaseModal for CRUD operations. Refer to `reference/05-ui-components.md` for:
- **BaseTable** props: `columns`, `data`, `row-key`, slots for custom cells and action buttons
- **BaseModal** props: `modelValue`, `title`, `size`, close event handling

Structure:
- Table displays entries with columns including an "Actions" column (Edit/Delete buttons)
- "Add" button above the table opens a BaseModal with a form
- Edit button opens same modal pre-filled with row data
- Delete button shows confirmation dialog
- Enable/Disable toggle per row (using `0 | 1` flag pattern with `toFlag01`)
- Form validation before submit
- POST API call on save, then refresh data

```vue
<script setup lang="ts">
// Same imports as status-readonly, plus:
import { BaseModal } from '../../components/common';
import { {feature}Api } from '../../services/api/{feature}';

// Additional state for CRUD:
const showModal = ref(false);
const editingIndex = ref<number | null>(null);
// Form fields...

const handleAdd = () => { editingIndex.value = null; showModal.value = true; };
const handleEdit = (index: number) => { editingIndex.value = index; /* populate fields */; showModal.value = true; };
const handleDelete = async (index: number) => { /* confirm then call API */ };
const handleSubmit = async () => { /* validate, call API, refresh */ };
</script>
```

#### config-tabs (like NAT Config)

Container page with tab navigation. Refer to `reference/03-page-structure.md` for tab layout and `reference/04-routing-permissions.md` for visibility.

Structure:
- Import `useMenuVisibilityContext` from composables
- Define tabs array with `id`, `label`, `menuKey` — filter by `canShowMenu()`
- Sync active tab with URL query parameter (`route.query.tab`)
- Each tab renders a separate child component (lazy with `v-if`)
- Use `.tab-navigation`, `.tab-button`, `.tab-button.active`, `.tab-content` CSS classes

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMenuVisibilityContext } from '../../../composables/useMenuVisibilityContext';
import { useQA } from '../../../utils/qa';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { qa } = useQA();
const { fetchMenuContext, canShowMenu } = useMenuVisibilityContext('super');

const tabs = computed(() =>
  [
    { id: 'tab1', label: t('{namespace}.tab1'), menuKey: '{menuKey}.tab1' },
    { id: 'tab2', label: t('{namespace}.tab2'), menuKey: '{menuKey}.tab2' },
  ].filter(tab => canShowMenu(tab.menuKey))
);

const activeTab = ref('tab1');

const ensureActiveTab = () => {
  const tabFromQuery = typeof route.query.tab === 'string' ? route.query.tab : '';
  const exists = tabFromQuery && tabs.value.some(t => t.id === tabFromQuery);
  const nextTab = exists ? tabFromQuery : (tabs.value[0]?.id || 'tab1');
  if (activeTab.value !== nextTab) activeTab.value = nextTab;
  if (!exists) router.replace({ path: route.path, query: { ...route.query, tab: nextTab } });
};

watch([() => route.query.tab, tabs], ensureActiveTab, { immediate: true });

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
  router.replace({ path: route.path, query: { ...route.query, tab: tabId } });
};

onMounted(async () => { await fetchMenuContext(); });
</script>

<template>
  <div class="page-container">
    <h1 class="page-title" :data-testid="qa('{feature}-title')">{{ t('{namespace}.title') }}</h1>
    <div class="page-content">
      <div class="panel-section">
        <div class="tab-navigation" :data-testid="qa('{feature}-tabs')">
          <button v-for="tab in tabs" :key="tab.id"
            class="tab-button" :class="{ active: activeTab === tab.id }"
            :data-testid="qa(`{feature}-tab-${tab.id}`)"
            @click="handleTabChange(tab.id)">
            {{ tab.label }}
          </button>
        </div>
        <div class="tab-content">
          <Tab1Component v-if="activeTab === 'tab1'" />
          <Tab2Component v-if="activeTab === 'tab2'" />
        </div>
      </div>
    </div>
  </div>
</template>
```

### 4e. Router — `src/router/index.ts`

Add three things:

```typescript
// 1. Route visibility rule (if page has visibility restrictions)
// Add to routeVisibilityRules array:
{ pathPrefix: '/{section}/{feature}', menuKey: '{visibilityMenuKey}' },

// 2. Actual route (inside the authenticated routes children array)
{
  path: '/{section}/{feature}',
  component: () => import('../views/{section}/{Feature}.vue'),
  beforeEnter: requireAuth,
},

// 3. Redirect from sidebar path (if sidebar path differs from actual route)
{
  path: '/{sidebarSection}/{feature}',
  redirect: '/{section}/{feature}',
},
```

### 4f. Sidebar — `src/components/Sidebar.vue`

Add menu entry to the appropriate section in `baseMenuItems`:

```typescript
{
  name: '{Display Name}',
  path: '/{sidebarSection}/{feature}',
  translationKey: 'menu.{featureMenuKey}',
  menuKey: '{visibilityMenuKey}',
}
```

If it belongs as a child of a sub-menu (e.g., under LAN → children), add to the `children` array.

### 4g. Menu Visibility — `src/types/menuVisibility.ts`

Add a rule if the page should be conditionally visible:

```typescript
// In menuVisibilityRules:
'{visibilityMenuKey}': {
  netLayoutTypes: { prpl: true, genix: true, cht: true },
  operationModes: { Init: false, Gateway: true, Bridge: true, Extender: true },
},

// In menuRoleVisibilityRules (if role-restricted):
'{visibilityMenuKey}': { super: true, normal: false },
```

### 4h. i18n — All 7 locale files

Add namespace translations to ALL locale files in `src/i18n/locales/`:

| File | Language |
|---|---|
| `en.ts` | English (primary — define all keys here first) |
| `zh-TW.ts` | Traditional Chinese 繁體中文 |
| `zh-CN.ts` | Simplified Chinese 简体中文 |
| `ja.ts` | Japanese 日本語 |
| `ko.ts` | Korean 한국어 |
| `fr.ts` | French Français |
| `de.ts` | German Deutsch |

Pattern:

```typescript
// In each locale file, add a new namespace section:
{namespace}: {
  title: '{Page Title}',
  // One key per field/label shown in the UI
  fieldName: '{Field Label}',
  sectionTitle: '{Section Title}',
  // Table column headers
  columnName: '{Column Header}',
},
```

Also add menu entry translation to the `menu` section:

```typescript
menu: {
  // ... existing entries
  {featureMenuKey}: '{Menu Display Name}',
},
```

**Translation quality rules:**
- `zh-TW`: Use Taiwan Traditional Chinese terminology (e.g., 網路, 埠, 位址)
- `zh-CN`: Use Mainland Simplified Chinese (e.g., 网络, 端口, 地址)
- `ja`: Use standard Japanese with katakana for technical terms (e.g., ポート, アドレス)
- `ko`: Use standard Korean (e.g., 포트, 주소)
- `fr` / `de`: Use standard European technical terminology

---

## Step 5 — Validation Checklist

Before delivering, verify every item:

- [ ] **reference read** — `05-ui-components.md`, `06-style-guide.md`, `03-page-structure.md`, `07-i18n-guide.md` were consulted
- [ ] **Application chrome consistent** — Sidebar uses blue gradient (#006BC4→#45B1E4), Header has white bg with right-aligned controls, Login uses matching gradient, page titles are blue (`var(--color-primary)`)
- [ ] **Types match Lua output** — every field from Lua's `get_func()` has a corresponding TypeScript field
- [ ] **PascalCase preserved** — backend field names are kept exactly as-is (Port, RxBytes, not port, rxBytes)
- [ ] **Mock data is realistic** — values are plausible, not all zeros or placeholder text
- [ ] **API endpoint correct** — `/API/info?list={ApiListName}` matches the Lua filename
- [ ] **Dev mode works** — `isDevelopment` check returns mock data
- [ ] **Components used correctly** — BaseTable/BaseModal/BaseSelect props match `05-ui-components.md`
- [ ] **CSS classes match style guide** — only use classes/variables from `06-style-guide.md`
- [ ] **No hardcoded strings** — all UI text uses `t('{namespace}.key')` format
- [ ] **data-testid present** — all interactive/important elements use `:data-testid="qa('...')"`
- [ ] **All 7 locales updated** — translations added to en, zh-TW, zh-CN, ja, ko, fr, de
- [ ] **Router entry added** — route, redirect, and visibility rule all present
- [ ] **Sidebar entry added** — menu item in correct section with correct menuKey
- [ ] **Menu visibility rule added** — if page needs conditional visibility
- [ ] **Types barrel export updated** — `src/types/index.ts` includes new type file
- [ ] **Build passes** — `npm run build` has no TypeScript errors

---

## Step 6 — Output Summary

After generating all files, provide a summary table:

| # | File | Action | Description |
|---|---|---|---|
| 1 | `src/types/{feature}.ts` | **CREATE** | TypeScript interfaces |
| 2 | `src/types/index.ts` | **EDIT** | Add barrel export |
| 3 | `src/services/mockData/{feature}MockData.ts` | **CREATE** | Mock data for dev mode |
| 4 | `src/services/api.ts` or `src/services/api/{feature}.ts` | **EDIT/CREATE** | API service function |
| 5 | `src/views/{section}/{Feature}.vue` | **CREATE** | Vue page component |
| 6 | `src/router/index.ts` | **EDIT** | Route + redirect + visibility |
| 7 | `src/components/Sidebar.vue` | **EDIT** | Menu entry |
| 8 | `src/types/menuVisibility.ts` | **EDIT** | Visibility rule |
| 9-15 | `src/i18n/locales/*.ts` (x7) | **EDIT** | Translations for all languages |

Then run `npm run build` to verify no errors.

---

## Lua Analysis Cheat Sheet

Common Lua patterns and their TypeScript mappings:

| Lua Pattern | Meaning | TypeScript |
|---|---|---|
| `tostring(value)` | Numeric value serialized as string | `field: string` |
| `tonumber(value)` | Actual numeric value | `field: number` |
| `value or false` | Boolean with default | `field: boolean` |
| `value or ""` | Optional string | `field: string` |
| `table.insert(list, item)` | Array of items | `field: Type[]` |
| `result.Key = {}` then `table.insert` | Wrapper object with array | `{ Key: Entry[] }` |
| `tmp.Field = value` (always set) | Required field | `Field: type` |
| `tmp.Field = value` (conditionally set) | Optional field | `Field?: type` |
| `common.json.encode({ Key = ret })` | Response wrapper | `{ Key: ... }` |
| `post_func(_) return {}` or `method_not_allowed` | No POST support | GET-only page |
| `post_func(arg)` with real logic | POST supported | GET + POST page |

---

## Important Rules

1. **ALWAYS read reference first** — `05-ui-components.md`, `06-style-guide.md`, `03-page-structure.md`, `07-i18n-guide.md` must be read before generating any code
2. **NEVER guess field names** — extract them exactly from the Lua source code
3. **NEVER skip any locale** — all 7 languages must be updated
4. **NEVER create new UI components** — use existing ones documented in `reference/05-ui-components.md`
5. **ALWAYS use documented CSS classes** — only use classes and variables from `reference/06-style-guide.md`
6. **ALWAYS add QA test IDs** — use `qa()` helper with descriptive kebab-case names
7. **ALWAYS follow existing file naming** — types: camelCase, mock: camelCase + MockData, views: PascalCase
8. **NEVER hardcode styles** — use CSS variables (`var(--color-primary)`, `var(--shadow-sm)`) from the style guide
9. **ALWAYS match the Application Chrome visual identity** — Sidebar blue gradient (#006BC4→#45B1E4), Header white with right-aligned controls, Login with matching gradient, "Gemtek" branding, blue page titles. See `03-page-structure.md` §0 and `06-style-guide.md` §9.1
10. **Use `.page-content` for regular pages** — exception: Dashboard uses `.status-content` because its `.dashboard-grid` handles its own padding
11. **ALWAYS use `.info-list` + `.info-row` for status pages** — for label-value displays on `status-readonly` pages, use the vertical `.info-list` + `.info-row` pattern (label left 200px, value right). Dashboard cards use scoped `.info-grid` + `.info-item` with flex layout instead. See `06-style-guide.md` §9.3
12. **Dashboard is a single grid** — ALL 6 dashboard sections (System, CPU, Memory, WAN, WiFi, Ethernet) go in one `.dashboard-grid` with `repeat(3, 1fr)` on desktop. Do NOT separate sections into `.panel-section` blocks. Guest WiFi is NOT shown on Dashboard
