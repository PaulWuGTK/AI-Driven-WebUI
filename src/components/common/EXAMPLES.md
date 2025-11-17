# Component Usage Examples

This document provides practical examples of using the common components in real-world scenarios.

## Example 1: User Registration Form

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  BaseCard,
  BaseInput,
  BaseSelect,
  BaseCheckbox,
  BaseButton
} from '@/components/common';

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  country: '',
  agreeToTerms: false
});

const errors = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const countries = [
  { label: 'United States', value: 'us' },
  { label: 'Canada', value: 'ca' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Australia', value: 'au' }
];

const isValid = computed(() => {
  return formData.value.username &&
         formData.value.email &&
         formData.value.password &&
         formData.value.password === formData.value.confirmPassword &&
         formData.value.agreeToTerms;
});

const loading = ref(false);

const validatePassword = () => {
  if (formData.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters';
  } else {
    errors.value.password = '';
  }
};

const validateConfirmPassword = () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match';
  } else {
    errors.value.confirmPassword = '';
  }
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    // API call here
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Form submitted:', formData.value);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container" style="max-width: 600px; margin: 2rem auto;">
    <BaseCard title="Create Account" subtitle="Join our community today">
      <form @submit.prevent="handleSubmit">
        <BaseInput
          v-model="formData.username"
          label="Username"
          placeholder="Choose a username"
          required
          :error-message="errors.username"
        />

        <BaseInput
          v-model="formData.email"
          label="Email"
          type="email"
          placeholder="your.email@example.com"
          required
          :error-message="errors.email"
          help-text="We'll never share your email with anyone"
        />

        <BaseInput
          v-model="formData.password"
          label="Password"
          type="password"
          placeholder="Create a strong password"
          required
          :error-message="errors.password"
          @blur="validatePassword"
        />

        <BaseInput
          v-model="formData.confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          required
          :error-message="errors.confirmPassword"
          @blur="validateConfirmPassword"
        />

        <BaseSelect
          v-model="formData.country"
          :options="countries"
          label="Country"
          placeholder="Select your country"
        />

        <BaseCheckbox v-model="formData.agreeToTerms" required>
          I agree to the <a href="/terms">Terms of Service</a> and
          <a href="/privacy">Privacy Policy</a>
        </BaseCheckbox>
      </form>

      <template #footer>
        <BaseButton
          variant="primary"
          type="submit"
          :disabled="!isValid"
          :loading="loading"
          block
          @click="handleSubmit"
        >
          Create Account
        </BaseButton>
        <BaseButton variant="ghost" block>
          Already have an account? Sign in
        </BaseButton>
      </template>
    </BaseCard>
  </div>
</template>
```

## Example 2: Data Table with Actions

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  BaseCard,
  BaseTable,
  BaseButton,
  BaseBadge,
  BaseModal,
  BaseInput
} from '@/components/common';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
}

const users = ref<User[]>([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2025-11-14 10:30'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2025-11-13 15:45'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'inactive',
    lastLogin: '2025-11-10 09:15'
  }
]);

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'lastLogin', label: 'Last Login', sortable: true },
  { key: 'actions', label: 'Actions', align: 'right' }
];

const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedUser = ref<User | null>(null);

const editUser = (user: User) => {
  selectedUser.value = { ...user };
  showEditModal.value = true;
};

const deleteUser = (user: User) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const confirmDelete = () => {
  if (selectedUser.value) {
    users.value = users.value.filter(u => u.id !== selectedUser.value!.id);
    showDeleteModal.value = false;
  }
};

const saveUser = () => {
  if (selectedUser.value) {
    const index = users.value.findIndex(u => u.id === selectedUser.value!.id);
    if (index !== -1) {
      users.value[index] = selectedUser.value;
    }
    showEditModal.value = false;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'neutral';
    case 'pending': return 'warning';
    default: return 'neutral';
  }
};
</script>

<template>
  <div class="page-content">
    <BaseCard>
      <BaseTable
        :columns="columns"
        :data="users"
        title="User Management"
        hover
        striped
      >
        <template #header-actions>
          <BaseButton variant="primary" size="sm">
            Add User
          </BaseButton>
        </template>

        <template #cell-status="{ row }">
          <BaseBadge :variant="getStatusVariant(row.status)">
            {{ row.status }}
          </BaseBadge>
        </template>

        <template #cell-actions="{ row }">
          <div class="action-buttons">
            <BaseButton
              size="sm"
              variant="outline"
              @click="editUser(row)"
            >
              Edit
            </BaseButton>
            <BaseButton
              size="sm"
              variant="danger"
              @click="deleteUser(row)"
            >
              Delete
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- Edit Modal -->
    <BaseModal
      v-model="showEditModal"
      title="Edit User"
      size="md"
    >
      <div v-if="selectedUser">
        <BaseInput
          v-model="selectedUser.name"
          label="Name"
          required
        />
        <BaseInput
          v-model="selectedUser.email"
          label="Email"
          type="email"
          required
        />
        <BaseSelect
          v-model="selectedUser.role"
          :options="['Admin', 'User', 'Manager']"
          label="Role"
        />
      </div>

      <template #footer>
        <BaseButton variant="primary" @click="saveUser">
          Save Changes
        </BaseButton>
        <BaseButton variant="secondary" @click="showEditModal = false">
          Cancel
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      v-model="showDeleteModal"
      title="Confirm Delete"
      size="sm"
    >
      <p>Are you sure you want to delete user <strong>{{ selectedUser?.name }}</strong>?</p>
      <p class="text-secondary text-sm">This action cannot be undone.</p>

      <template #footer>
        <BaseButton variant="danger" @click="confirmDelete">
          Delete
        </BaseButton>
        <BaseButton variant="secondary" @click="showDeleteModal = false">
          Cancel
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
```

## Example 3: Settings Page with Tabs

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  BaseCard,
  BaseTabs,
  BaseInput,
  BaseSelect,
  BaseCheckbox,
  BaseButton,
  BaseSpinner
} from '@/components/common';

const activeTab = ref(0);
const loading = ref(false);
const saved = ref(false);

const tabs = [
  { label: 'Profile', icon: 'icon-user' },
  { label: 'Security', icon: 'icon-lock' },
  { label: 'Notifications', icon: 'icon-bell', badge: '3' },
  { label: 'Preferences', icon: 'icon-settings' }
];

const profile = ref({
  name: 'John Doe',
  email: 'john@example.com',
  language: 'en',
  timezone: 'UTC'
});

const security = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const notifications = ref({
  emailNotifications: true,
  pushNotifications: false,
  weeklyDigest: true
});

const saveSettings = async () => {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    saved.value = true;
    setTimeout(() => saved.value = false, 3000);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page-content">
    <BaseCard title="Settings">
      <BaseTabs v-model="activeTab" :tabs="tabs">
        <!-- Profile Tab -->
        <template #tab-0>
          <BaseInput
            v-model="profile.name"
            label="Full Name"
            placeholder="Enter your name"
          />
          <BaseInput
            v-model="profile.email"
            label="Email"
            type="email"
            placeholder="your.email@example.com"
          />
          <BaseSelect
            v-model="profile.language"
            :options="[
              { label: 'English', value: 'en' },
              { label: '中文', value: 'zh' },
              { label: '日本語', value: 'ja' }
            ]"
            label="Language"
          />
          <BaseSelect
            v-model="profile.timezone"
            :options="['UTC', 'PST', 'EST', 'GMT']"
            label="Timezone"
          />
        </template>

        <!-- Security Tab -->
        <template #tab-1>
          <BaseInput
            v-model="security.currentPassword"
            label="Current Password"
            type="password"
          />
          <BaseInput
            v-model="security.newPassword"
            label="New Password"
            type="password"
            help-text="Must be at least 8 characters"
          />
          <BaseInput
            v-model="security.confirmPassword"
            label="Confirm New Password"
            type="password"
          />
        </template>

        <!-- Notifications Tab -->
        <template #tab-2>
          <BaseCheckbox
            v-model="notifications.emailNotifications"
            label="Email Notifications"
          />
          <BaseCheckbox
            v-model="notifications.pushNotifications"
            label="Push Notifications"
          />
          <BaseCheckbox
            v-model="notifications.weeklyDigest"
            label="Weekly Digest"
          />
        </template>

        <!-- Preferences Tab -->
        <template #tab-3>
          <p class="text-secondary">Preferences coming soon...</p>
        </template>
      </BaseTabs>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <p v-if="saved" class="text-success text-sm">
            Settings saved successfully!
          </p>
          <div class="ml-auto flex gap-3">
            <BaseButton variant="secondary">
              Reset
            </BaseButton>
            <BaseButton
              variant="primary"
              :loading="loading"
              @click="saveSettings"
            >
              Save Changes
            </BaseButton>
          </div>
        </div>
      </template>
    </BaseCard>
  </div>
</template>
```

## Example 4: Loading States

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BaseCard, BaseSpinner, BaseTable } from '@/components/common';

const loading = ref(true);
const data = ref([]);

onMounted(async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  data.value = [/* ... data ... */];
  loading.value = false;
});
</script>

<template>
  <div class="page-content">
    <BaseCard title="Dashboard">
      <BaseSpinner v-if="loading" centered text="Loading data..." />
      <BaseTable v-else :columns="columns" :data="data" />
    </BaseCard>
  </div>
</template>
```

## Example 5: Form with Complex Validation

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { BaseCard, BaseInput, BaseButton } from '@/components/common';

const email = ref('');
const emailError = ref('');
const emailTouched = ref(false);

const validateEmail = () => {
  emailTouched.value = true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.value) {
    emailError.value = 'Email is required';
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address';
  } else {
    emailError.value = '';
  }
};

const isValid = computed(() => {
  return email.value && !emailError.value;
});
</script>

<template>
  <BaseCard title="Newsletter Subscription">
    <BaseInput
      v-model="email"
      label="Email Address"
      type="email"
      placeholder="Enter your email"
      :error-message="emailTouched ? emailError : ''"
      @blur="validateEmail"
    />

    <template #footer>
      <BaseButton
        variant="primary"
        :disabled="!isValid"
        block
      >
        Subscribe
      </BaseButton>
    </template>
  </BaseCard>
</template>
```

---

These examples demonstrate real-world usage patterns for the component library. For more details on individual components, see the main README.md file.
