# Common UI Components Library

This directory contains reusable Vue 3 components built with TypeScript and Composition API. These components are designed to be consistent, accessible, and easy to use throughout the application.

## Installation

Import components from the common module:

```typescript
import { BaseButton, BaseInput, BaseCard, BaseSwitch, ActionButtons } from '@/components/common';
```

## Components

### BaseButton

A versatile button component with multiple variants and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `type`: 'button' | 'submit' | 'reset' (default: 'button')
- `disabled`: boolean (default: false)
- `loading`: boolean (default: false)
- `block`: boolean (default: false) - Full width button
- `icon`: boolean (default: false) - Icon-only button

**Events:**
- `@click`: Emitted when button is clicked

**Slots:**
- `default`: Button text content
- `icon-left`: Icon before text
- `icon-right`: Icon after text

**Example:**
```vue
<template>
  <BaseButton variant="primary" @click="handleClick">
    Click Me
  </BaseButton>

  <BaseButton variant="danger" loading>
    Processing...
  </BaseButton>

  <BaseButton variant="outline" size="sm">
    Small Button
  </BaseButton>
</template>
```

---

### BaseInput

A text input component with validation support.

**Props:**
- `modelValue`: string | number (required)
- `label`: string - Field label
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' (default: 'text')
- `placeholder`: string
- `disabled`: boolean (default: false)
- `readonly`: boolean (default: false)
- `required`: boolean (default: false)
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `error`: boolean (default: false)
- `errorMessage`: string - Error message to display
- `helpText`: string - Help text below input
- `id`: string - Custom ID

**Events:**
- `@update:modelValue`: Emitted when value changes
- `@blur`: Emitted when input loses focus
- `@focus`: Emitted when input gains focus

**Slots:**
- `prepend`: Content before input
- `append`: Content after input

**Exposed Methods:**
- `focus()`: Focus the input
- `blur()`: Blur the input

**Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue';

const username = ref('');
const email = ref('');
const emailError = ref('');
</script>

<template>
  <BaseInput
    v-model="username"
    label="Username"
    placeholder="Enter username"
    required
  />

  <BaseInput
    v-model="email"
    label="Email"
    type="email"
    :error-message="emailError"
    help-text="We'll never share your email"
  />
</template>
```

---

### BaseSelect

A dropdown select component.

**Props:**
- `modelValue`: string | number (required)
- `options`: Array<string | number | {label: string, value: string | number}> (required)
- `label`: string
- `placeholder`: string
- `disabled`: boolean (default: false)
- `required`: boolean (default: false)
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `error`: boolean (default: false)
- `errorMessage`: string
- `helpText`: string
- `id`: string

**Events:**
- `@update:modelValue`: Emitted when selection changes
- `@change`: Emitted when selection changes

**Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue';

const country = ref('');
const countries = [
  { label: 'United States', value: 'us' },
  { label: 'Canada', value: 'ca' },
  { label: 'United Kingdom', value: 'uk' }
];
</script>

<template>
  <BaseSelect
    v-model="country"
    :options="countries"
    label="Country"
    placeholder="Select a country"
  />
</template>
```

---

### BaseTextarea

A multi-line text input component.

**Props:**
- `modelValue`: string (required)
- `label`: string
- `placeholder`: string
- `disabled`: boolean (default: false)
- `readonly`: boolean (default: false)
- `required`: boolean (default: false)
- `rows`: number (default: 4)
- `error`: boolean (default: false)
- `errorMessage`: string
- `helpText`: string
- `id`: string

**Events:**
- `@update:modelValue`: Emitted when value changes
- `@blur`: Emitted when textarea loses focus
- `@focus`: Emitted when textarea gains focus

**Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue';

const description = ref('');
</script>

<template>
  <BaseTextarea
    v-model="description"
    label="Description"
    placeholder="Enter description"
    :rows="6"
  />
</template>
```

---

### BaseCheckbox

A checkbox input component.

**Props:**
- `modelValue`: boolean (required)
- `label`: string
- `disabled`: boolean (default: false)
- `required`: boolean (default: false)
- `id`: string

**Events:**
- `@update:modelValue`: Emitted when checked state changes
- `@change`: Emitted when checked state changes

**Slots:**
- `default`: Checkbox label (alternative to `label` prop)

**Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue';

const agreed = ref(false);
</script>

<template>
  <BaseCheckbox v-model="agreed" label="I agree to terms and conditions" />

  <BaseCheckbox v-model="agreed">
    I agree to <a href="/terms">terms and conditions</a>
  </BaseCheckbox>
</template>
```

---

### BaseSwitch

A reusable switch/toggle component using the global `.switch/.slider` styles.

**Props:**
- `modelValue`: string | number | boolean (required)
- `trueValue`: string | number | boolean (default: true)
- `falseValue`: string | number | boolean (default: false)
- `label`: string
- `disabled`: boolean (default: false)
- `required`: boolean (default: false)
- `id`: string
- `name`: string
- `dataTestid`: string - test id for input
- `sliderDataTestid`: string - test id for slider
- `labelDataTestid`: string - test id for label text

**Events:**
- `@update:modelValue`: Emitted when switch state changes
- `@change`: Emitted when switch state changes

**Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue';
import { BaseSwitch } from '@/components/common';

const enabled = ref<number>(1);
</script>

<template>
  <BaseSwitch
    v-model="enabled"
    :true-value="1"
    :false-value="0"
    label="Enable service"
  />
</template>
```

---

### ActionButtons

A standard Cancel + Apply/Save action row built with `BaseButton`.

**Props:**
- `showCancel`: boolean (default: true)
- `showApply`: boolean (default: true)
- `cancelText`: string (default: `t('common.cancel')`)
- `applyText`: string (default: `t('common.apply')`)
- `cancelType`: 'button' | 'submit' | 'reset' (default: 'button')
- `applyType`: 'button' | 'submit' | 'reset' (default: 'button')
- `cancelVariant`: BaseButton variant (default: 'secondary')
- `applyVariant`: BaseButton variant (default: 'primary')
- `cancelDisabled`: boolean (default: false)
- `applyDisabled`: boolean (default: false)
- `applyLoading`: boolean (default: false)
- `dataTestid`: string
- `cancelDataTestid`: string
- `applyDataTestid`: string

**Events:**
- `@cancel`: Emitted when cancel button is clicked
- `@apply`: Emitted when apply button is clicked

**Example:**
```vue
<script setup lang="ts">
import { ActionButtons } from '@/components/common';

const onCancel = () => {
  // cancel logic
};

const onApply = () => {
  // apply logic
};
</script>

<template>
  <ActionButtons
    :apply-loading="false"
    cancel-data-testid="settings-cancel-button"
    apply-data-testid="settings-apply-button"
    @cancel="onCancel"
    @apply="onApply"
  />
</template>
```

---

### BaseCard

A container component with header, body, and footer sections.

**Props:**
- `title`: string - Card title
- `subtitle`: string - Card subtitle
- `variant`: 'default' | 'flat' | 'elevated' (default: 'default')
- `hover`: boolean (default: false) - Add hover effect
- `compact`: boolean (default: false) - Reduce padding

**Slots:**
- `header`: Custom header content (overrides title/subtitle)
- `default`: Card body content
- `footer`: Card footer content

**Example:**
```vue
<template>
  <BaseCard title="User Profile" subtitle="Manage your account">
    <p>Card content goes here</p>

    <template #footer>
      <BaseButton variant="primary">Save</BaseButton>
      <BaseButton variant="secondary">Cancel</BaseButton>
    </template>
  </BaseCard>

  <BaseCard variant="elevated" hover>
    <h3>Custom Header</h3>
    <p>Custom content</p>
  </BaseCard>
</template>
```

---

### BaseTable

A responsive table component with sorting support.

**Props:**
- `columns`: Array<Column> (required) - Column definitions
- `data`: Array<any> (required) - Table data
- `title`: string - Table title
- `hover`: boolean (default: false) - Row hover effect
- `striped`: boolean (default: false) - Striped rows
- `bordered`: boolean (default: false) - Table borders
- `compact`: boolean (default: false) - Compact spacing
- `responsive`: boolean (default: true) - Mobile card view
- `emptyText`: string (default: 'No data available')
- `rowKey`: string (default: 'id') - Unique row identifier

**Column Interface:**
```typescript
interface Column {
  key: string;           // Data key
  label: string;         // Column header
  sortable?: boolean;    // Enable sorting
  align?: 'left' | 'center' | 'right';
  width?: string;        // Column width
}
```

**Slots:**
- `header`: Custom table header
- `header-actions`: Actions in header
- `empty`: Custom empty state
- `cell-{key}`: Custom cell content (per column)

**`actions` Column Rule:**
- Use `key: 'actions'` for row action columns
- In `#cell-actions`, return a single `.action-buttons` wrapper
- `BaseTable` will automatically normalize the mobile card layout for the `actions` column
- Do not add page-local mobile `inline-flex / nowrap / card-actions-inline` hacks unless the page is not using `BaseTable`

**Recommended `#cell-actions` pattern:**
```vue
<template #cell-actions="{ row, index, mobile }">
  <div class="action-buttons" :data-testid="mobile ? `row-card-actions-${index}` : `row-actions-${index}`">
    <button class="btn-action" @click="handleEdit(row)" title="Edit">
      <span class="material-icons">edit</span>
    </button>
    <button class="btn-action" @click="handleDelete(row)" title="Delete">
      <span class="material-icons">delete</span>
    </button>
  </div>
</template>
```

**Mobile behavior:**
- `BaseTable` renders the `actions` column as a dedicated mobile card row
- Label stays on the left
- `.action-buttons` stays on the right with `inline-flex + nowrap`
- This avoids icon wrapping and invalid `span > div` layouts

**Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', align: 'right' }
];

const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' }
]);
</script>

<template>
  <BaseTable
    :columns="columns"
    :data="users"
    title="User Management"
    hover
    striped
  >
    <template #cell-status="{ row }">
      <BaseBadge :variant="row.status === 'Active' ? 'success' : 'neutral'">
        {{ row.status }}
      </BaseBadge>
    </template>

    <template #cell-actions="{ row }">
      <div class="action-buttons">
        <button class="btn-action" @click="editUser(row)" title="Edit">
          <span class="material-icons">edit</span>
        </button>
        <button class="btn-action" @click="deleteUser(row)" title="Delete">
          <span class="material-icons">delete</span>
        </button>
      </div>
    </template>
  </BaseTable>
</template>
```

---

### BaseTabs

A tab navigation component.

**Props:**
- `tabs`: Array<Tab> (required) - Tab definitions
- `modelValue`: number (default: 0) - Active tab index
- `variant`: 'default' | 'pills' | 'boxed' (default: 'default')
- `vertical`: boolean (default: false) - Vertical layout

**Tab Interface:**
```typescript
interface Tab {
  key?: string;          // Unique key
  label: string;         // Tab label
  icon?: string;         // Icon class
  badge?: string | number; // Badge content
  disabled?: boolean;    // Disable tab
}
```

**Events:**
- `@update:modelValue`: Emitted when active tab changes
- `@tab-change`: Emitted with (index, tab) when tab changes

**Slots:**
- `tab-{index}`: Content for each tab

**Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref(0);
const tabs = [
  { label: 'Profile', icon: 'icon-user' },
  { label: 'Settings', icon: 'icon-settings', badge: '3' },
  { label: 'Notifications', disabled: true }
];
</script>

<template>
  <BaseTabs v-model="activeTab" :tabs="tabs">
    <template #tab-0>
      <p>Profile content</p>
    </template>

    <template #tab-1>
      <p>Settings content</p>
    </template>

    <template #tab-2>
      <p>Notifications content</p>
    </template>
  </BaseTabs>
</template>
```

---

### BaseModal

A modal dialog component with overlay.

**Props:**
- `modelValue`: boolean (required) - Show/hide modal
- `title`: string - Modal title
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
- `closable`: boolean (default: true) - Show close button
- `closeOnOverlay`: boolean (default: true) - Close on overlay click
- `closeOnEscape`: boolean (default: true) - Close on Escape key

**Events:**
- `@update:modelValue`: Emitted when modal state changes
- `@close`: Emitted when modal is closed

**Slots:**
- `header`: Custom header content
- `default`: Modal body content
- `footer`: Modal footer content

**Example:**
```vue
<script setup lang="ts">
import { ref } from 'vue';

const showModal = ref(false);

const handleSave = () => {
  // Save logic
  showModal.value = false;
};
</script>

<template>
  <BaseButton @click="showModal = true">Open Modal</BaseButton>

  <BaseModal v-model="showModal" title="Edit User" size="lg">
    <p>Modal content goes here</p>

    <template #footer>
      <BaseButton variant="primary" @click="handleSave">Save</BaseButton>
      <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
    </template>
  </BaseModal>
</template>
```

---

### BaseSpinner

A loading spinner component.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `variant`: 'primary' | 'secondary' | 'white' (default: 'primary')
- `text`: string - Loading text
- `centered`: boolean (default: false) - Center in container
- `fullPage`: boolean (default: false) - Full page overlay

**Example:**
```vue
<template>
  <!-- Inline spinner -->
  <BaseSpinner size="sm" />

  <!-- Centered spinner with text -->
  <BaseSpinner centered text="Loading..." />

  <!-- Full page loading -->
  <BaseSpinner full-page text="Please wait..." />
</template>
```

---

### BaseBadge

A badge component for status indicators.

**Props:**
- `variant`: 'success' | 'warning' | 'error' | 'info' | 'neutral' (default: 'neutral')
- `size`: 'sm' | 'md' (default: 'md')

**Slots:**
- `default`: Badge content

**Example:**
```vue
<template>
  <BaseBadge variant="success">Active</BaseBadge>
  <BaseBadge variant="warning">Pending</BaseBadge>
  <BaseBadge variant="error">Error</BaseBadge>
  <BaseBadge variant="info" size="sm">New</BaseBadge>
</template>
```

---

## Best Practices

1. **Consistent Usage**: Always import from `@/components/common` for consistency
2. **v-model**: Use `v-model` for two-way binding on form components
3. **Validation**: Handle validation in parent components, pass error states to inputs
4. **Accessibility**: All components include proper ARIA attributes
5. **Responsive**: Table and Modal components are mobile-responsive by default
6. **TypeScript**: All components are fully typed with TypeScript

## Component Composition

Components can be composed together:

```vue
<template>
  <BaseCard title="User Form">
    <BaseInput v-model="user.name" label="Name" required />
    <BaseInput v-model="user.email" label="Email" type="email" required />
    <BaseSelect v-model="user.role" :options="roles" label="Role" />
    <BaseTextarea v-model="user.bio" label="Bio" />
    <BaseCheckbox v-model="user.newsletter" label="Subscribe to newsletter" />

    <template #footer>
      <BaseButton variant="primary" :loading="saving" @click="saveUser">
        Save
      </BaseButton>
      <BaseButton variant="secondary" @click="cancel">
        Cancel
      </BaseButton>
    </template>
  </BaseCard>
</template>
```

---

**Version:** 1.0.0
**Last Updated:** 2025-11-14
