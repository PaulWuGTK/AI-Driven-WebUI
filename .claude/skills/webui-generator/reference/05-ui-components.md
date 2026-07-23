# UI 元件庫參考 (UI Components Reference)

> 本文件列出系統所有共用 UI 元件及其使用方式，供 Lua + API 重建前端頁面時參考。
> 使用這些標準元件可確保視覺風格一致，避免重複造輪子。

---

## 📋 元件清單總覽

| 元件 | 用途 | Props 數量 | 主要特性 |
|------|------|-----------|---------|
| **BaseInput** | 文字輸入 | 14 | 驗證、錯誤提示、說明文字 |
| **BaseSelect** | 下拉選單 | 11 | 選項列表、驗證狀態 |
| **BaseSwitch** | 開關切換 | 9 | Boolean/0/1 值切換 |
| **BaseCheckbox** | 核取方塊 | - | 多選、驗證 |
| **BaseTextarea** | 多行文字 | - | 大段文字輸入 |
| **BaseSecretInput** | 密碼輸入 | - | 顯示/隱藏切換 |
| **BaseTable** | 資料表格 | 14 | 排序、響應式、自訂欄位 |
| **BaseModal** | 對話框 | 6 | 尺寸變化、關閉控制 |
| **ActionButtons** | 操作按鈕組 | 12 | 取消/套用、變體樣式 |
| **SectionCard** | 區塊卡片 | 6 | 標題、內容區塊 |
| **BaseButton** | 按鈕 | - | 各種變體樣式 |
| **BaseSpinner** | 載入動畫 | - | 載入中指示 |
| **BaseToast** | 訊息提示 | - | 成功/錯誤訊息 |
| **BaseBadge** | 標籤徽章 | - | 狀態標示 |
| **BaseTabs** | 分頁標籤 | - | 內容分頁 |

---

## 1. 表單輸入元件

### 1.1 BaseInput（文字輸入）

**用途：** 各種類型的文字輸入欄位

**Props:**

| 名稱 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `modelValue` | `string \| number` | *必填* | 輸入值 |
| `label` | `string` | `undefined` | 欄位標籤 |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'` | `'text'` | HTML input type |
| `placeholder` | `string` | `''` | 提示文字 |
| `disabled` | `boolean` | `false` | 停用狀態 |
| `readonly` | `boolean` | `false` | 唯讀狀態 |
| `required` | `boolean` | `false` | 必填（顯示紅色星號） |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸大小 |
| `error` | `boolean` | `false` | 錯誤狀態 |
| `errorMessage` | `string` | `undefined` | 錯誤訊息 |
| `helpText` | `string` | `undefined` | 說明文字 |
| `id` | `string` | `undefined` | HTML id |
| `dataTestid` | `string` | `undefined` | 測試 ID |

**Events:**
- `update:modelValue(value)` - 值改變時觸發
- `blur(event)` - 失焦時觸發
- `focus(event)` - 聚焦時觸發

**Slots:**
- `prepend` - 輸入框前方插槽
- `append` - 輸入框後方插槽

**Exposed Methods:**
- `focus()` - 聚焦輸入框
- `blur()` - 失焦輸入框

**使用範例（偽代碼）：**
```json
{
  "component": "BaseInput",
  "props": {
    "modelValue": "192.168.1.1",
    "label": "IP Address",
    "type": "text",
    "placeholder": "Enter IP address",
    "required": true,
    "helpText": "Enter a valid IPv4 address",
    "dataTestid": "lan-ip-input"
  },
  "events": {
    "update:modelValue": "handleIpChange"
  }
}
```

---

### 1.2 BaseSelect（下拉選單）

**用途：** 單選下拉選單

**Props:**

| 名稱 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `modelValue` | `string \| number` | *必填* | 選中的值 |
| `options` | `Array<string \| number \| {label, value}>` | *必填* | 選項列表 |
| `label` | `string` | `undefined` | 欄位標籤 |
| `placeholder` | `string` | `''` | 提示文字 |
| `disabled` | `boolean` | `false` | 停用狀態 |
| `required` | `boolean` | `false` | 必填 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸大小 |
| `error` | `boolean` | `false` | 錯誤狀態 |
| `errorMessage` | `string` | `undefined` | 錯誤訊息 |
| `helpText` | `string` | `undefined` | 說明文字 |
| `id` | `string` | `undefined` | HTML id |
| `dataTestid` | `string` | `undefined` | 測試 ID |

**Option 格式：**
```json
// 簡單格式（值即標籤）
["Option 1", "Option 2", "Option 3"]

// 物件格式（自訂標籤與值）
[
  {"label": "WPA3-Personal", "value": "wpa3"},
  {"label": "WPA2-Personal", "value": "wpa2"},
  {"label": "None", "value": "none"}
]
```

**Events:**
- `update:modelValue(value)` - 選項改變時觸發
- `change(value)` - 選項改變時觸發

**使用範例：**
```json
{
  "component": "BaseSelect",
  "props": {
    "modelValue": "wpa3",
    "label": "Security Mode",
    "options": [
      {"label": "WPA3-Personal", "value": "wpa3"},
      {"label": "WPA2-Personal", "value": "wpa2"},
      {"label": "None", "value": "none"}
    ],
    "required": true,
    "dataTestid": "security-mode-select"
  }
}
```

---

### 1.3 BaseSwitch（開關切換）

**用途：** Boolean 開關或 0/1 切換

**Props:**

| 名稱 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `modelValue` | `string \| number \| boolean` | *必填* | 開關狀態 |
| `trueValue` | `string \| number \| boolean` | `true` | 開啟時的值 |
| `falseValue` | `string \| number \| boolean` | `false` | 關閉時的值 |
| `label` | `string` | `''` | 標籤文字 |
| `disabled` | `boolean` | `false` | 停用狀態 |
| `required` | `boolean` | `false` | 必填 |
| `id` | `string` | `undefined` | HTML id |
| `name` | `string` | `''` | HTML name |
| `dataTestid` | `string` | `''` | 容器測試 ID |
| `sliderDataTestid` | `string` | `''` | 滑桿測試 ID |
| `labelDataTestid` | `string` | `''` | 標籤測試 ID |

**Events:**
- `update:modelValue(value)` - 開關改變時觸發
- `change(value)` - 開關改變時觸發

**Slots:**
- `label` - 自訂標籤內容

**重要：0/1 轉換**
```json
// 若後端使用 0/1，在 UI 層使用 trueValue/falseValue 轉換
{
  "component": "BaseSwitch",
  "props": {
    "modelValue": 1,          // 從 API 取得的值
    "trueValue": 1,           // 開啟 = 1
    "falseValue": 0,          // 關閉 = 0
    "label": "Enable WiFi",
    "dataTestid": "wifi-enable-toggle"
  }
}
```

---

### 1.4 BaseSecretInput（密碼輸入）

**用途：** 密碼輸入欄位，支援顯示/隱藏切換

**Props:** （繼承 BaseInput 的大部分 props）
- 額外提供 「顯示/隱藏」按鈕
- `inputDataTestid` - 輸入框測試 ID
- `toggleDataTestid` - 切換按鈕測試 ID

**使用範例：**
```json
{
  "component": "BaseSecretInput",
  "props": {
    "modelValue": "",
    "label": "Password",
    "placeholder": "Enter password",
    "required": true,
    "inputDataTestid": "password-input",
    "toggleDataTestid": "password-toggle"
  }
}
```

---

## 2. 資料展示元件

### 2.1 BaseTable（資料表格）

**用途：** 可排序的資料表格，支援響應式顯示（手機版會切換為卡片模式）

**Props:**

| 名稱 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `columns` | `Column[]` | *必填* | 欄位定義 |
| `data` | `any[]` | *必填* | 資料陣列 |
| `title` | `string` | `undefined` | 表格標題 |
| `hover` | `boolean` | `false` | 懸停效果 |
| `striped` | `boolean` | `false` | 斑馬紋 |
| `bordered` | `boolean` | `false` | 邊框 |
| `compact` | `boolean` | `false` | 緊密間距 |
| `responsive` | `boolean` | `true` | 響應式（手機卡片模式） |
| `emptyText` | `string` | `'No data available'` | 無資料文字 |
| `rowKey` | `string` | `'id'` | 行的唯一鍵 |
| `tableDataTestid` | `string` | `''` | 表格容器測試 ID |
| `mobileDataTestid` | `string` | `''` | 手機模式測試 ID |
| `initialSortKey` | `string` | `''` | 初始排序欄位 |
| `initialSortOrder` | `'asc' \| 'desc'` | `'asc'` | 初始排序方向 |
| `rowDataTestid` | `Function` | `undefined` | 行測試 ID 產生函數 |

**Column 定義：**
```json
{
  "key": "ipAddress",              // 欄位鍵（對應 data 中的屬性）
  "label": "IP Address",           // 欄位標題
  "sortable": true,                // 是否可排序
  "align": "left",                 // 對齊方式: left | center | right
  "width": "150px",                // 欄位寬度
  "headerDataTestid": "ip-header"  // 表頭測試 ID
}
```

**Slots:**
- `header` - 自訂表頭（替代 title）
- `header-actions` - 表頭操作區
- `empty` - 空狀態內容
- `cell-{columnKey}` - 自訂欄位內容（例如：`cell-actions`）
- `label-{columnKey}` - 手機模式下的欄位標籤

**使用範例：**
```json
{
  "component": "BaseTable",
  "props": {
    "columns": [
      {"key": "ipAddress", "label": "IP Address", "sortable": true},
      {"key": "macAddress", "label": "MAC Address", "sortable": true},
      {"key": "status", "label": "Status", "align": "center"},
      {"key": "actions", "label": "Actions", "align": "center", "width": "100px"}
    ],
    "data": [
      {"id": "1", "ipAddress": "192.168.1.100", "macAddress": "AA:BB:CC:DD:EE:FF", "status": "Connected"},
      {"id": "2", "ipAddress": "192.168.1.101", "macAddress": "11:22:33:44:55:66", "status": "Disconnected"}
    ],
    "title": "Connected Devices",
    "striped": true,
    "hover": true,
    "emptyText": "No devices connected"
  },
  "slots": {
    "cell-actions": "<!-- 自訂操作按鈕 -->"
  }
}
```

---

### 2.2 SectionCard（區塊卡片）

**用途：** 頁面內容區塊的容器，提供標題和內容區分

**Props:**

| 名稱 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `title` | `string` | `''` | 區塊標題 |
| `headerMode` | `'title' \| 'row'` | `'title'` | 標題模式 |
| `titleTag` | `string` | `'div'` | 標題 HTML 標籤 |
| `headerDataTestid` | `string` | `''` | 標頭測試 ID |
| `titleDataTestid` | `string` | `''` | 標題測試 ID |
| `contentDataTestid` | `string` | `''` | 內容測試 ID |

**Slots:**
- `header` - 自訂標頭（替代 title）
- `actions` - 標頭右側操作區
- `default` - 內容區

**使用範例：**
```json
{
  "component": "SectionCard",
  "props": {
    "title": "Basic Settings",
    "headerMode": "title"
  },
  "slots": {
    "default": "<!-- 內容區塊 -->",
    "actions": "<!-- 右上角按鈕 -->"
  }
}
```

---

## 3. 互動元件

### 3.1 BaseModal（對話框）

**用途：** 彈出對話框，用於編輯、確認、訊息提示

**Props:**

| 名稱 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `modelValue` | `boolean` | *必填* | 對話框顯示狀態 |
| `title` | `string` | `undefined` | 對話框標題 |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | 尺寸大小 |
| `closable` | `boolean` | `true` | 顯示關閉按鈕 |
| `closeOnOverlay` | `boolean` | `true` | 點擊遮罩關閉 |
| `closeOnEscape` | `boolean` | `true` | ESC 鍵關閉 |
| `closeButtonDataTestid` | `string` | `''` | 關閉按鈕測試 ID |

**Events:**
- `update:modelValue(value)` - 控制顯示狀態
- `close()` - 關閉時觸發

**Slots:**
- `header` - 自訂標頭（替代 title）
- `default` - 對話框內容
- `footer` - 對話框底部（通常放 ActionButtons）

**使用範例：**
```json
{
  "component": "BaseModal",
  "props": {
    "modelValue": true,
    "title": "Edit Device",
    "size": "md",
    "closeButtonDataTestid": "modal-close"
  },
  "slots": {
    "default": "<!-- 表單內容 -->",
    "footer": {
      "component": "ActionButtons",
      "props": {
        "cancelText": "Cancel",
        "applyText": "Save"
      }
    }
  }
}
```

---

### 3.2 ActionButtons（操作按鈕組）

**用途：** 標準化的「取消」+「套用」按鈕組，常用於對話框和表單底部

**Props:**

| 名稱 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `showCancel` | `boolean` | `true` | 顯示取消按鈕 |
| `showApply` | `boolean` | `true` | 顯示套用按鈕 |
| `cancelText` | `string` | `''` | 取消文字（空值使用 i18n） |
| `applyText` | `string` | `''` | 套用文字（空值使用 i18n） |
| `cancelType` | `'button' \| 'submit' \| 'reset'` | `'button'` | 取消按鈕 type |
| `applyType` | `'button' \| 'submit' \| 'reset'` | `'button'` | 套用按鈕 type |
| `cancelVariant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' \| 'success'` | `'secondary'` | 取消樣式 |
| `applyVariant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' \| 'success'` | `'primary'` | 套用樣式 |
| `cancelDisabled` | `boolean` | `false` | 停用取消按鈕 |
| `applyDisabled` | `boolean` | `false` | 停用套用按鈕 |
| `applyLoading` | `boolean` | `false` | 套用按鈕載入中 |
| `dataTestid` | `string` | `''` | 容器測試 ID |
| `cancelDataTestid` | `string` | `''` | 取消按鈕測試 ID |
| `applyDataTestid` | `string` | `''` | 套用按鈕測試 ID |

**Events:**
- `cancel(event)` - 取消按鈕點擊
- `apply(event)` - 套用按鈕點擊

**使用範例：**
```json
{
  "component": "ActionButtons",
  "props": {
    "cancelText": "Cancel",
    "applyText": "Save Changes",
    "applyLoading": false,
    "cancelDataTestid": "form-cancel",
    "applyDataTestid": "form-submit"
  },
  "events": {
    "cancel": "handleCancel",
    "apply": "handleSubmit"
  }
}
```

---

## 4. 其他實用元件

### 4.1 BaseButton

**用途：** 通用按鈕元件

**主要 Props:**
- `variant` - 樣式變體：`primary` | `secondary` | `outline` | `ghost` | `danger` | `success`
- `size` - 尺寸：`sm` | `md` | `lg`
- `disabled` - 停用狀態
- `loading` - 載入中狀態

---

### 4.2 BaseSpinner

**用途：** 載入中動畫

**主要 Props:**
- `size` - 尺寸：`sm` | `md` | `lg`
- `variant` - 樣式：`primary` | `secondary` | `white`

---

### 4.3 BaseBadge

**用途：** 狀態標籤徽章

**主要 Props:**
- `variant` - 樣式：`primary` | `success` | `warning` | `error` | `info`
- `text` - 標籤文字

---

## 5. 元件使用最佳實踐

### 5.1 統一使用 data-testid

**所有元件都應加上 `data-testid`，方便測試和自動化：**
```json
{
  "component": "BaseInput",
  "props": {
    "dataTestid": "lan-ip-input"
  }
}
```

### 5.2 驗證狀態處理

**使用 `error` 和 `errorMessage` 顯示驗證錯誤：**
```json
{
  "component": "BaseInput",
  "props": {
    "modelValue": "invalid-ip",
    "label": "IP Address",
    "error": true,
    "errorMessage": "Please enter a valid IP address"
  }
}
```

### 5.3 必填欄位標示

**使用 `required` prop 會自動顯示紅色星號：**
```json
{
  "component": "BaseInput",
  "props": {
    "label": "SSID",
    "required": true
  }
}
```

### 5.4 0/1 與 Boolean 轉換

**後端 API 使用 0/1，前端使用 `trueValue`/`falseValue` 轉換：**
```json
{
  "component": "BaseSwitch",
  "props": {
    "modelValue": 1,
    "trueValue": 1,
    "falseValue": 0,
    "label": "Enable Feature"
  }
}
```

### 5.5 表格自訂欄位

**使用 slot 自訂表格欄位內容（例如操作按鈕）：**
```json
{
  "component": "BaseTable",
  "props": {
    "columns": [
      {"key": "name", "label": "Name"},
      {"key": "actions", "label": "Actions", "align": "center"}
    ],
    "data": [...]
  },
  "slots": {
    "cell-actions": {
      "component": "div",
      "children": [
        {"component": "button", "text": "Edit", "class": "btn-edit"},
        {"component": "button", "text": "Delete", "class": "btn-delete"}
      ]
    }
  }
}
```

---

## 6. 元件樣式變體參考

### 6.1 Button Variants

| Variant | 用途 | 顏色 |
|---------|------|------|
| `primary` | 主要操作 | 藍色 (#0078d4) |
| `secondary` | 次要操作 | 灰色 |
| `outline` | 輪廓按鈕 | 透明背景 + 邊框 |
| `ghost` | 幽靈按鈕 | 透明背景 |
| `danger` | 危險操作 | 紅色 (#dc3545) |
| `success` | 成功操作 | 綠色 (#28a745) |

### 6.2 Size Variants

| Size | 用途 | 高度 |
|------|------|------|
| `sm` | 小型 | ~32px |
| `md` | 中型（預設） | ~40px |
| `lg` | 大型 | ~48px |

### 6.3 Modal Sizes

| Size | 寬度 | 用途 |
|------|------|------|
| `sm` | 400px | 簡單確認對話框 |
| `md` | 600px | 一般表單 |
| `lg` | 800px | 複雜表單 |
| `xl` | 1000px | 大型內容 |
| `full` | 95vw | 全螢幕 |

---

## 7. 元件組合範例

### 7.1 標準編輯表單

```json
{
  "component": "SectionCard",
  "props": {
    "title": "Basic Settings"
  },
  "children": [
    {
      "component": "BaseInput",
      "props": {
        "modelValue": "192.168.1.1",
        "label": "IP Address",
        "required": true
      }
    },
    {
      "component": "BaseInput",
      "props": {
        "modelValue": "255.255.255.0",
        "label": "Subnet Mask",
        "required": true
      }
    },
    {
      "component": "BaseSwitch",
      "props": {
        "modelValue": 1,
        "trueValue": 1,
        "falseValue": 0,
        "label": "Enable DHCP"
      }
    },
    {
      "component": "ActionButtons",
      "props": {
        "cancelText": "Cancel",
        "applyText": "Save"
      }
    }
  ]
}
```

### 7.2 表格 + 對話框編輯

```json
{
  "layout": [
    {
      "component": "SectionCard",
      "props": {"title": "Port Forwarding Rules"},
      "slots": {
        "actions": {
          "component": "BaseButton",
          "props": {
            "variant": "primary",
            "text": "Add Rule"
          }
        },
        "default": {
          "component": "BaseTable",
          "props": {
            "columns": [
              {"key": "name", "label": "Name"},
              {"key": "protocol", "label": "Protocol"},
              {"key": "externalPort", "label": "External Port"},
              {"key": "internalPort", "label": "Internal Port"},
              {"key": "actions", "label": "Actions", "align": "center"}
            ],
            "data": []
          }
        }
      }
    },
    {
      "component": "BaseModal",
      "props": {
        "modelValue": false,
        "title": "Edit Rule",
        "size": "md"
      },
      "slots": {
        "default": "<!-- 編輯表單 -->",
        "footer": {
          "component": "ActionButtons"
        }
      }
    }
  ]
}
```

---

## 8. 常見問題 (FAQ)

### Q: 如何處理 API 回傳的 0/1 值？

A: 使用 `BaseSwitch` 的 `trueValue` 和 `falseValue`：
```json
{
  "component": "BaseSwitch",
  "props": {
    "modelValue": apiData.Enable,  // API 回傳 0 或 1
    "trueValue": 1,
    "falseValue": 0
  }
}
```

### Q: 如何在表格中加入操作按鈕？

A: 使用 `cell-{columnKey}` slot：
```json
{
  "columns": [
    {"key": "name", "label": "Name"},
    {"key": "actions", "label": "Actions"}
  ],
  "slots": {
    "cell-actions": "<button>Edit</button><button>Delete</button>"
  }
}
```

### Q: 如何顯示載入中狀態？

A: 使用 `BaseSpinner` 或 `ActionButtons` 的 `applyLoading`：
```json
{
  "component": "ActionButtons",
  "props": {
    "applyLoading": true,
    "applyDisabled": true
  }
}
```

### Q: 多語系文字如何處理？

A: 元件的 `label`、`placeholder`、`errorMessage` 等文字應從 i18n 系統取得（見 `07-i18n-guide.md`）

---

## 9. 總結

**使用這些標準元件的好處：**
1. ✅ **風格一致** - 所有頁面使用相同的 UI 元件
2. ✅ **減少開發時間** - 不需重複實作相同功能
3. ✅ **維護性高** - 元件集中管理，修改一處即可影響全域
4. ✅ **測試友善** - 所有元件都支援 `data-testid`
5. ✅ **響應式** - BaseTable 等元件自動適配手機/桌面

**下一步：**
- 查看 `06-style-guide.md` 了解色彩、間距等樣式規範
- 查看 `07-i18n-guide.md` 了解多語系文字處理
