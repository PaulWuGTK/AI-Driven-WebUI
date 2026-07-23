# 多語系指南 (i18n Guide)

> 本文件說明系統的多語系（國際化）處理方式，供 Lua + API 重建前端頁面時參考。
> 所有可見文字都必須走多語系系統，不可硬編字串。

---

## 1. 支援的語言 (Supported Languages)

系統支援 **7 種語言**：

| 語言 | 檔案名稱 | 語言代碼 | 地區 |
|------|---------|---------|------|
| 英文 | `en.ts` | `en` | English (Global) |
| 繁體中文 | `zh-TW.ts` | `zh-TW` | 台灣 |
| 簡體中文 | `zh-CN.ts` | `zh-CN` | 中國大陸 |
| 日文 | `ja.ts` | `ja` | 日本 |
| 韓文 | `ko.ts` | `ko` | 韓國 |
| 法文 | `fr.ts` | `fr` | 法國 |
| 德文 | `de.ts` | `de` | 德國 |

**檔案位置：** `src/i18n/locales/`

---

## 2. 翻譯鍵結構 (Translation Key Structure)

### 2.1 命名空間組織

翻譯鍵使用 **點記法（dot notation）** 組織，按功能模組分類：

```typescript
{
  menu: {                    // 選單項目
    status: 'Status',
    wan: 'WAN',
    lan: 'LAN'
  },
  dashboard: {               // Dashboard 頁面
    title: 'Dashboard',
    cpu: 'CPU',
    memory: 'Memory'
  },
  wan: {                     // WAN 功能
    title: 'WAN Status',
    ipAddress: 'IP Address'
  },
  common: {                  // 共用文字
    save: 'Save',
    cancel: 'Cancel',
    ok: 'OK'
  }
}
```

### 2.2 命名空間清單

| 命名空間 | 用途 | 範例鍵 |
|---------|------|--------|
| `menu.*` | 側邊選單項目 | `menu.wan`, `menu.lan` |
| `header.*` | 頂部導航 | `header.account`, `header.logout` |
| `dashboard.*` | Dashboard 頁面 | `dashboard.cpu`, `dashboard.memory` |
| `wan.*` | WAN 功能 | `wan.title`, `wan.ipAddress` |
| `lan.*` | LAN 功能 | `lan.title`, `lan.dhcpEnable` |
| `wlan.*` / `wireless.*` | WLAN 功能 | `wireless.ssid`, `wireless.password` |
| `security.*` | 安全功能 | `security.macFiltering` |
| `nat.*` | NAT 功能 | `nat.portForwarding` |
| `qos.*` | QoS 功能 | `qos.bandwidth`, `qos.priority` |
| `account.*` | 帳號管理 | `account.username`, `account.password` |
| `wizard.*` | 設定精靈 | `wizard.wifiTitle`, `wizard.next` |
| `common.*` | 共用文字 | `common.save`, `common.cancel` |
| `error.*` | 錯誤訊息 | `error.invalidIp`, `error.required` |
| `validation.*` | 驗證訊息 | `validation.required`, `validation.minLength` |

---

## 3. 使用方式 (Usage)

### 3.1 基本用法

**在 Vue 元件中使用 `t()` 函數：**

```vue
<template>
  <h1>{{ t('wan.title') }}</h1>
  <label>{{ t('wan.ipAddress') }}</label>
  <button>{{ t('common.save') }}</button>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
```

**在 Lua/API 實作中：**
```json
{
  "text": "{i18n:wan.title}",
  "label": "{i18n:wan.ipAddress}",
  "buttonText": "{i18n:common.save}"
}
```

---

### 3.2 動態參數 (Dynamic Parameters)

**定義帶參數的翻譯：**

```typescript
// en.ts
{
  wanCht: {
    ipoeTitle: 'IPoE - {protocol}',  // 參數使用 {paramName}
  },
  account: {
    confirmDeleteUser: 'Are you sure you want to delete user "{username}"?'
  },
  wireless: {
    ssidBytesInfo: '{bytes} bytes used'
  }
}
```

**使用參數：**

```vue
<template>
  <!-- 單一參數 -->
  <p>{{ t('wireless.ssidBytesInfo', { bytes: 24 }) }}</p>
  <!-- 結果：24 bytes used -->

  <!-- 多個參數 -->
  <p>{{ t('account.confirmDeleteUser', { username: 'admin' }) }}</p>
  <!-- 結果：Are you sure you want to delete user "admin"? -->
</template>
```

**在 Lua/API 中：**
```json
{
  "text": "{i18n:wireless.ssidBytesInfo}",
  "params": {
    "bytes": 24
  }
}
```

---

## 4. 翻譯鍵命名規則 (Naming Conventions)

### 4.1 一般規則

1. **使用 camelCase**
   - ✅ 好：`ipAddress`, `wifiPassword`, `confirmDelete`
   - ❌ 壞：`ip_address`, `wifi-password`, `Confirm-Delete`

2. **描述性命名**
   - ✅ 好：`confirmDeleteUser`, `invalidEmailFormat`
   - ❌ 壞：`message1`, `text2`, `label`

3. **避免縮寫（除非廣為人知）**
   - ✅ 好：`ipAddress`, `macAddress`, `ssid`
   - ❌ 壞：`ipAddr`, `macAddr`

4. **按功能分組**
   - ✅ 好：`wan.title`, `wan.ipAddress`, `wan.status`
   - ❌ 壞：`wanTitle`, `wanIpAddress`, `wanStatus`

---

### 4.2 特定類型命名

| 類型 | 命名格式 | 範例 |
|------|---------|------|
| 頁面標題 | `{feature}.title` | `wan.title`, `lan.title` |
| 欄位標籤 | 描述性名詞 | `ipAddress`, `subnetMask` |
| 按鈕文字 | 動詞 | `save`, `cancel`, `delete` |
| 確認訊息 | `confirm{Action}` | `confirmDelete`, `confirmReset` |
| 錯誤訊息 | `error.{type}` | `error.invalidIp`, `error.required` |
| 成功訊息 | `success.{action}` | `success.saved`, `success.deleted` |
| 說明文字 | `{field}Help` 或 `{field}Hint` | `passwordHelp`, `ssidHint` |
| 工具提示 | `{field}Tooltip` | `smartConnectTooltip` |

---

## 5. 必須翻譯的文字 (What to Translate)

### 5.1 所有可見文字

✅ **必須翻譯：**
- 頁面標題
- 區塊標題
- 欄位標籤（label）
- 按鈕文字
- 連結文字
- 提示文字（placeholder）
- 說明文字（help text）
- 錯誤訊息
- 成功訊息
- 警告訊息
- 對話框標題和內容
- 表格欄位標題
- 下拉選單選項
- 工具提示（tooltip）

❌ **不翻譯：**
- 技術資料（IP 位址、MAC 位址、數字）
- API endpoint
- 程式碼/變數名稱
- Log 訊息（除非直接顯示給使用者）

---

### 5.2 範例對照

```vue
<!-- ❌ 不好：硬編字串 -->
<template>
  <h1>WAN Status</h1>
  <label>IP Address</label>
  <button>Save</button>
  <p>Please enter a valid IP address</p>
</template>

<!-- ✅ 好：使用 i18n -->
<template>
  <h1>{{ t('wan.title') }}</h1>
  <label>{{ t('wan.ipAddress') }}</label>
  <button>{{ t('common.save') }}</button>
  <p>{{ t('wan.ipAddressHelp') }}</p>
</template>
```

---

## 6. 新增翻譯的步驟 (Adding New Translations)

### 6.1 標準流程

**步驟 1：在英文檔加入翻譯鍵**
```typescript
// src/i18n/locales/en.ts
export default {
  // ...existing translations
  myFeature: {
    title: 'My Feature',
    description: 'This is my new feature',
    saveButton: 'Save Settings'
  }
}
```

**步驟 2：在其他 6 個語言檔加入相同鍵**
```typescript
// zh-TW.ts
myFeature: {
  title: '我的功能',
  description: '這是我的新功能',
  saveButton: '儲存設定'
}

// zh-CN.ts
myFeature: {
  title: '我的功能',
  description: '这是我的新功能',
  saveButton: '保存设置'
}

// ja.ts, ko.ts, fr.ts, de.ts...
// （類似地加入對應語言的翻譯）
```

**步驟 3：在頁面中使用**
```vue
<template>
  <h1>{{ t('myFeature.title') }}</h1>
  <p>{{ t('myFeature.description') }}</p>
  <button>{{ t('myFeature.saveButton') }}</button>
</template>
```

---

### 6.2 檢查清單

新增翻譯時，確保：
- [ ] **7 個語言檔都有相同的鍵**（否則會導致某些語言顯示鍵名而非翻譯）
- [ ] **鍵名符合命名規則**（camelCase, 描述性）
- [ ] **使用正確的命名空間**（不要重用不相關的 namespace）
- [ ] **參數使用 `{paramName}` 格式**
- [ ] **避免重複鍵名**（在同一 namespace 內）

---

## 7. 共用文字 (Common Translations)

### 7.1 常用按鈕

```typescript
common: {
  // 操作按鈕
  save: 'Save',
  cancel: 'Cancel',
  apply: 'Apply',
  ok: 'OK',
  close: 'Close',
  submit: 'Submit',
  reset: 'Reset',

  // CRUD 操作
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  create: 'Create',
  update: 'Update',
  remove: 'Remove',

  // 導航
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  finish: 'Finish',

  // 狀態
  enable: 'Enable',
  disable: 'Disable',
  enabled: 'Enabled',
  disabled: 'Disabled',
  active: 'Active',
  inactive: 'Inactive',
  connected: 'Connected',
  disconnected: 'Disconnected',

  // 其他
  loading: 'Loading...',
  yes: 'Yes',
  no: 'No',
  confirm: 'Confirm',
  search: 'Search',
  refresh: 'Refresh'
}
```

### 7.2 常用欄位

```typescript
common: {
  name: 'Name',
  description: 'Description',
  status: 'Status',
  type: 'Type',
  enabled: 'Enabled',
  disabled: 'Disabled',

  // 網路相關
  ipAddress: 'IP Address',
  subnetMask: 'Subnet Mask',
  gateway: 'Gateway',
  dns: 'DNS',
  macAddress: 'MAC Address',
  ssid: 'SSID',
  password: 'Password',

  // 時間相關
  date: 'Date',
  time: 'Time',
  startTime: 'Start Time',
  endTime: 'End Time'
}
```

---

## 8. 驗證與錯誤訊息 (Validation & Error Messages)

### 8.1 驗證訊息

```typescript
validation: {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidIp: 'Please enter a valid IP address',
  invalidMac: 'Please enter a valid MAC address',
  minLength: 'Minimum length is {min} characters',
  maxLength: 'Maximum length is {max} characters',
  minValue: 'Minimum value is {min}',
  maxValue: 'Maximum value is {max}',
  passwordMismatch: 'Passwords do not match',
  invalidFormat: 'Invalid format'
}
```

**使用範例：**
```vue
<p v-if="error">{{ t('validation.required') }}</p>
<p v-if="error">{{ t('validation.minLength', { min: 8 }) }}</p>
```

---

### 8.2 錯誤訊息

```typescript
error: {
  // 一般錯誤
  general: 'An error occurred',
  networkError: 'Network error, please try again',
  timeout: 'Request timeout',

  // 驗證錯誤
  invalidInput: 'Invalid input',
  invalidIpAddress: 'Please enter a valid IP address',
  invalidMacAddress: 'Please enter a valid MAC address',
  invalidPassword: 'Invalid password format',

  // 操作錯誤
  saveFailed: 'Failed to save',
  deleteFailed: 'Failed to delete',
  updateFailed: 'Failed to update',

  // 認證錯誤
  loginFailed: 'Login failed',
  unauthorized: 'Unauthorized access',
  sessionExpired: 'Session expired, please login again'
}
```

---

### 8.3 成功訊息

```typescript
success: {
  saved: 'Settings saved successfully',
  deleted: 'Deleted successfully',
  updated: 'Updated successfully',
  created: 'Created successfully',
  applied: 'Changes applied successfully',
  uploaded: 'File uploaded successfully',
  reset: 'Reset successfully'
}
```

---

## 9. 特殊情況處理 (Special Cases)

### 9.1 複數形式 (Pluralization)

Vue i18n 支援複數處理：

```typescript
// en.ts
{
  device: 'no devices | one device | {n} devices'
}
```

```vue
<template>
  <p>{{ t('device', deviceCount) }}</p>
  <!-- deviceCount = 0 → "no devices" -->
  <!-- deviceCount = 1 → "one device" -->
  <!-- deviceCount = 5 → "5 devices" -->
</template>
```

---

### 9.2 日期時間格式

不同語言的日期時間格式不同：

```typescript
// en.ts
{
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h'  // 12-hour format
}

// zh-TW.ts
{
  dateFormat: 'YYYY/MM/DD',
  timeFormat: '24h'  // 24-hour format
}
```

---

### 9.3 單位轉換

部分語言可能需要不同單位：

```typescript
// en.ts
{
  storageUnit: 'GB'
}

// ja.ts
{
  storageUnit: 'ギガバイト'
}
```

---

## 10. 翻譯品質指南 (Translation Quality Guidelines)

### 10.1 翻譯原則

1. **準確性** - 確保翻譯意思正確
2. **一致性** - 相同概念使用相同翻譯
3. **簡潔性** - 避免冗長表達
4. **符合語境** - 考慮使用情境
5. **專業術語** - 使用業界標準術語

---

### 10.2 術語一致性

建立術語表，確保專業術語翻譯一致：

| 英文 | 繁中 | 簡中 | 日文 | 韓文 |
|------|------|------|------|------|
| Router | 路由器 | 路由器 | ルーター | 라우터 |
| SSID | SSID | SSID | SSID | SSID |
| Gateway | 閘道 | 网关 | ゲートウェイ | 게이트웨이 |
| Subnet Mask | 子網路遮罩 | 子网掩码 | サブネットマスク | 서브넷 마스크 |
| MAC Address | MAC 位址 | MAC 地址 | MAC アドレス | MAC 주소 |

---

## 11. 檢查與驗證 (Checking & Validation)

### 11.1 完整性檢查

新增功能後，檢查：
```bash
# 檢查所有語言檔是否有相同鍵
grep -r "myFeature.title" src/i18n/locales/

# 應該在 7 個檔案中都找到
```

### 11.2 遺漏翻譯檢測

開發環境會顯示未翻譯的鍵：
```
[i18n] Key "wan.newField" not found in "zh-TW" locale
```

看到此警告時，立即補上遺漏的翻譯。

---

## 12. 最佳實踐 (Best Practices)

### ✅ DO（建議做法）

1. **所有可見文字都用 `t()`**
   ```vue
   <button>{{ t('common.save') }}</button>
   ```

2. **使用描述性鍵名**
   ```typescript
   confirmDeleteUser: 'Are you sure...'  // ✅ 好
   message1: 'Are you sure...'           // ❌ 壞
   ```

3. **動態參數用 `{param}` 格式**
   ```typescript
   greeting: 'Hello, {name}!'
   ```

4. **重複使用 common 命名空間**
   ```vue
   <button>{{ t('common.save') }}</button>  // 不要每個頁面都定義 save
   ```

5. **7 個語言檔同步更新**
   ```bash
   # 新增鍵時，一次更新所有語言檔
   ```

---

### ❌ DON'T（避免做法）

1. **不要硬編字串**
   ```vue
   <button>Save</button>  // ❌ 壞
   ```

2. **不要重用不相關的 key**
   ```vue
   {{ t('qos.confirmDelete') }}  // ❌ 在帳號管理頁面借用 QoS 的 key
   ```

3. **不要在程式碼中拼接文字**
   ```typescript
   // ❌ 壞
   const message = t('hello') + ' ' + username;

   // ✅ 好
   const message = t('greeting', { name: username });
   ```

4. **不要省略語言檔**
   ```typescript
   // ❌ 只在 en.ts 加，其他語言檔忘記加
   ```

---

## 13. 總結

**使用 i18n 的好處：**
1. ✅ **支援多國使用者** - 7 種語言無痛切換
2. ✅ **易於維護** - 所有翻譯集中管理
3. ✅ **避免硬編** - 不會在 HTML 中看到英文字串
4. ✅ **動態參數** - 支援帶變數的訊息
5. ✅ **一致性** - 共用的文字（如 Save, Cancel）統一翻譯

**快速檢查清單：**
- [ ] 所有可見文字都用 `t()` 函數
- [ ] 7 個語言檔都有相同的鍵
- [ ] 鍵名符合 camelCase 命名規則
- [ ] 動態參數使用 `{paramName}` 格式
- [ ] 不重複定義已存在的共用文字

**下一步：**
- 查看 `05-ui-components.md` 了解 UI 元件如何使用 i18n
- 查看 `06-style-guide.md` 了解樣式系統
