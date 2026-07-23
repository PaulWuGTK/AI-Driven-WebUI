# 樣式指南 (Style Guide)

> 本文件定義系統的視覺設計規範，包含色彩、間距、字體、陰影等，供 Lua + API 重建前端頁面時參考。
> 使用這些標準樣式可確保視覺風格一致。

---

## 1. 色彩系統 (Color System)

### 1.1 主色調 (Primary Colors)

| 用途 | CSS 變數 | 色碼 | 預覽 |
|------|---------|------|------|
| 主要色 | `--color-primary` | `#0070BB` | 🟦 藍色 |
| 主要色 (懸停) | `--color-primary-hover` | `#005A96` | 🟦 深藍 |
| 主要色 (淺背景) | `--color-primary-light` | `#E6F3FA` | 🟦 淺藍 |

**使用場景：**
- 主要操作按鈕（Save, Apply, Submit）
- 連結文字
- 啟用狀態的開關/選項
- 重要資訊標示

---

### 1.2 語意色彩 (Semantic Colors)

| 用途 | CSS 變數 | 色碼 | 預覽 | 使用場景 |
|------|---------|------|------|---------|
| 成功 | `--color-success` | `#10B981` | 🟢 綠色 | 成功訊息、啟用狀態 |
| 成功 (淺背景) | `--color-success-light` | `#D1FAE5` | 🟢 淺綠 | 成功訊息背景 |
| 警告 | `--color-warning` | `#F59E0B` | 🟡 橘色 | 警告訊息、需注意事項 |
| 警告 (淺背景) | `--color-warning-light` | `#FEF3C7` | 🟡 淺橘 | 警告訊息背景 |
| 錯誤 | `--color-error` | `#EF4444` | 🔴 紅色 | 錯誤訊息、危險操作 |
| 錯誤 (淺背景) | `--color-error-light` | `#FEE2E2` | 🔴 淺紅 | 錯誤訊息背景 |
| 資訊 | `--color-info` | `#3B82F6` | 🔵 藍色 | 資訊提示 |
| 資訊 (淺背景) | `--color-info-light` | `#DBEAFE` | 🔵 淺藍 | 資訊提示背景 |

**使用範例：**
```css
/* 成功訊息 */
.success-message {
  background-color: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

/* 錯誤訊息 */
.error-message {
  background-color: var(--color-error-light);
  color: var(--color-error);
  border: 1px solid var(--color-error);
}
```

---

### 1.3 中性色彩 (Neutral Colors)

| 色階 | CSS 變數 | 色碼 | 用途 |
|------|---------|------|------|
| 白色 | `--color-white` | `#FFFFFF` | 卡片背景、輸入框背景 |
| 灰 50 | `--color-gray-50` | `#F9FAFB` | 頁面背景 |
| 灰 100 | `--color-gray-100` | `#F3F4F6` | 懸停背景 |
| 灰 200 | `--color-gray-200` | `#E5E7EB` | 邊框 |
| 灰 300 | `--color-gray-300` | `#D1D5DB` | 停用文字 |
| 灰 400 | `--color-gray-400` | `#9CA3AF` | 次要文字 |
| 灰 500 | `--color-gray-500` | `#6B7280` | 輔助文字 |
| 灰 600 | `--color-gray-600` | `#4B5563` | 一般文字 |
| 灰 700 | `--color-gray-700` | `#374151` | 標題文字 |
| 灰 800 | `--color-gray-800` | `#1F2937` | 深色標題 |
| 灰 900 | `--color-gray-900` | `#111827` | 最深文字 |
| 黑色 | `--color-black` | `#000000` | 純黑（少用） |

---

### 1.4 文字色彩 (Text Colors)

| 用途 | CSS 變數 | 對應色碼 | 使用場景 |
|------|---------|---------|---------|
| 主要文字 | `--text-primary` | `#333333` | 正文、標籤、一般內容 |
| 次要文字 | `--text-secondary` | `#666666` | 說明文字、輔助資訊 |
| 三級文字 | `--text-tertiary` | `#9CA3AF` | 不重要的提示文字 |
| 反轉文字 | `--text-inverse` | `#FFFFFF` | 深色背景上的文字 |
| 連結 | `--text-link` | `#0070BB` | 可點擊連結 |
| 連結懸停 | `--text-link-hover` | `#005A96` | 連結懸停狀態 |

**使用範例：**
```css
/* 頁面標題 */
h1 {
  color: var(--text-primary);
  font-weight: var(--font-weight-bold);
}

/* 說明文字 */
.help-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
```

---

### 1.5 背景色彩 (Background Colors)

| 用途 | CSS 變數 | 色碼 | 使用場景 |
|------|---------|------|---------|
| 主要背景 | `--bg-primary` | `#F5F5F5` | 頁面背景 |
| 次要背景 | `--bg-secondary` | `#FFFFFF` | 卡片、輸入框背景 |
| 三級背景 | `--bg-tertiary` | `#F8F8F8` | 區塊背景 |
| 遮罩 | `--bg-overlay` | `rgba(0,0,0,0.5)` | 對話框遮罩 |

---

### 1.6 邊框色彩 (Border Colors)

| 用途 | CSS 變數 | 色碼 | 使用場景 |
|------|---------|------|---------|
| 一般邊框 | `--border-color` | `#E0E0E0` | 卡片、輸入框邊框 |
| 淺色邊框 | `--border-color-light` | `#F0F0F0` | 表格分隔線 |
| 深色邊框 | `--border-color-dark` | `#CCCCCC` | 強調邊框 |
| 聚焦邊框 | `--border-color-focus` | `#0070BB` | 輸入框聚焦狀態 |

---

## 2. 間距系統 (Spacing System)

**基礎單位：8px（0.5rem）**

| 級別 | CSS 變數 | 值 | px | 使用場景 |
|------|---------|----|----|---------|
| 0 | `--space-0` | `0` | 0px | 無間距 |
| 1 | `--space-1` | `0.25rem` | 4px | 極小間距 |
| 2 | `--space-2` | `0.5rem` | 8px | 小間距、元件內間距 |
| 3 | `--space-3` | `0.75rem` | 12px | 元件間小間距 |
| 4 | `--space-4` | `1rem` | 16px | 元件間標準間距 |
| 5 | `--space-5` | `1.25rem` | 20px | 元件間中等間距 |
| 6 | `--space-6` | `1.5rem` | 24px | 區塊間距 |
| 8 | `--space-8` | `2rem` | 32px | 大區塊間距 |
| 10 | `--space-10` | `2.5rem` | 40px | 區段間距 |
| 12 | `--space-12` | `3rem` | 48px | 主要區段間距 |
| 16 | `--space-16` | `4rem` | 64px | 頁面級間距 |

**使用範例：**
```css
/* 卡片內邊距 */
.card {
  padding: var(--space-6);  /* 24px */
}

/* 表單欄位間距 */
.form-group {
  margin-bottom: var(--space-4);  /* 16px */
}

/* 按鈕組間距 */
.button-group {
  gap: var(--space-2);  /* 8px */
}
```

---

## 3. 字體系統 (Typography)

### 3.1 字體家族 (Font Family)

| 用途 | CSS 變數 | 字體 |
|------|---------|------|
| 無襯線體 | `--font-family-sans` | Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif |
| 等寬字體 | `--font-family-mono` | "JetBrains Mono", Menlo, Monaco, "Courier New", monospace |

**使用場景：**
- `sans` - 一般文字、標題、UI 元件
- `mono` - 程式碼、IP 位址、MAC 位址、技術資料

---

### 3.2 字體大小 (Font Size)

| 級別 | CSS 變數 | 值 | px | 使用場景 |
|------|---------|----|----|---------|
| xs | `--font-size-xs` | `0.75rem` | 12px | 提示文字、徽章 |
| sm | `--font-size-sm` | `0.875rem` | 14px | 說明文字、表格內容 |
| base | `--font-size-base` | `1rem` | 16px | 正文、輸入框 |
| lg | `--font-size-lg` | `1.125rem` | 18px | 次標題 |
| xl | `--font-size-xl` | `1.25rem` | 20px | 小標題 |
| 2xl | `--font-size-2xl` | `1.5rem` | 24px | 中標題 |
| 3xl | `--font-size-3xl` | `1.875rem` | 30px | 大標題 |
| 4xl | `--font-size-4xl` | `2.25rem` | 36px | 主標題 |

**使用範例：**
```css
/* 頁面標題 */
h1 {
  font-size: var(--font-size-3xl);  /* 30px */
}

/* 區塊標題 */
h2 {
  font-size: var(--font-size-2xl);  /* 24px */
}

/* 正文 */
p {
  font-size: var(--font-size-base);  /* 16px */
}

/* 說明文字 */
.help-text {
  font-size: var(--font-size-sm);  /* 14px */
}
```

---

### 3.3 字體粗細 (Font Weight)

| 級別 | CSS 變數 | 值 | 使用場景 |
|------|---------|---|---------|
| Normal | `--font-weight-normal` | 400 | 正文 |
| Medium | `--font-weight-medium` | 500 | 輔助標題、強調文字 |
| Semibold | `--font-weight-semibold` | 600 | 次要標題、按鈕 |
| Bold | `--font-weight-bold` | 700 | 主要標題、重要文字 |

---

### 3.4 行高 (Line Height)

| 級別 | CSS 變數 | 值 | 使用場景 |
|------|---------|---|---------|
| Tight | `--line-height-tight` | 1.25 | 標題 |
| Normal | `--line-height-normal` | 1.5 | 正文 |
| Relaxed | `--line-height-relaxed` | 1.75 | 大段文字 |

---

## 4. 圓角系統 (Border Radius)

| 級別 | CSS 變數 | 值 | px | 使用場景 |
|------|---------|----|----|---------|
| None | `--radius-none` | `0` | 0px | 無圓角 |
| Small | `--radius-sm` | `0.25rem` | 4px | 小元件、標籤 |
| Medium | `--radius-md` | `0.375rem` | 6px | 按鈕、輸入框 |
| Large | `--radius-lg` | `0.5rem` | 8px | 卡片 |
| XL | `--radius-xl` | `0.75rem` | 12px | 大卡片 |
| Full | `--radius-full` | `9999px` | 圓形 | 頭像、徽章 |

**使用範例：**
```css
/* 按鈕 */
.btn {
  border-radius: var(--radius-md);  /* 6px */
}

/* 卡片 */
.card {
  border-radius: var(--radius-lg);  /* 8px */
}

/* 頭像 */
.avatar {
  border-radius: var(--radius-full);  /* 圓形 */
}
```

---

## 5. 陰影系統 (Shadow System)

| 級別 | CSS 變數 | 值 | 使用場景 |
|------|---------|---|---------|
| XS | `--shadow-xs` | `0 1px 2px 0 rgba(0,0,0,0.05)` | 細微陰影 |
| SM | `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` | 小陰影、懸停狀態 |
| MD | `--shadow-md` | `0 1px 8px rgba(0,0,0,0.2)` | 卡片陰影 |
| LG | `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | 下拉選單 |
| XL | `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | 對話框 |

**使用範例：**
```css
/* 卡片 */
.card {
  box-shadow: var(--shadow-md);
}

/* 對話框 */
.modal {
  box-shadow: var(--shadow-xl);
}

/* 懸停效果 */
.card:hover {
  box-shadow: var(--shadow-lg);
}
```

---

## 6. 動畫過渡 (Transitions)

| 速度 | CSS 變數 | 值 | 使用場景 |
|------|---------|---|---------|
| Fast | `--transition-fast` | `150ms ease-in-out` | 小元件狀態變化 |
| Base | `--transition-base` | `200ms ease-in-out` | 一般過渡效果 |
| Slow | `--transition-slow` | `300ms ease-in-out` | 大元件動畫 |

**使用範例：**
```css
/* 按鈕懸停 */
.btn {
  transition: background-color var(--transition-base);
}

/* 開關切換 */
.switch {
  transition: transform var(--transition-fast);
}
```

---

## 7. Z-Index 階層 (Z-Index Scale)

| 層級 | CSS 變數 | 值 | 使用場景 |
|------|---------|---|---------|
| Dropdown | `--z-index-dropdown` | 1000 | 下拉選單 |
| Sticky | `--z-index-sticky` | 1020 | 固定元素 |
| Fixed | `--z-index-fixed` | 1030 | 固定導航 |
| Modal Backdrop | `--z-index-modal-backdrop` | 1040 | 對話框遮罩 |
| Modal | `--z-index-modal` | 1050 | 對話框 |
| Popover | `--z-index-popover` | 1060 | 彈出提示 |
| Tooltip | `--z-index-tooltip` | 1070 | 工具提示 |

---

## 8. 斷點系統 (Breakpoints)

| 斷點 | CSS 變數 | 值 | 裝置 |
|------|---------|---|------|
| SM | `--breakpoint-sm` | 640px | 手機橫向 |
| MD | `--breakpoint-md` | 768px | 平板直向 |
| LG | `--breakpoint-lg` | 1024px | 平板橫向 / 小筆電 |
| XL | `--breakpoint-xl` | 1280px | 桌機 |

**使用範例：**
```css
/* 響應式佈局 */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }
}
```

---

## 9. 佈局尺寸 (Layout Dimensions)

| 元素 | CSS 變數 | 值 | 說明 |
|------|---------|---|------|
| 側邊欄寬度 | `--sidebar-width` | 265px | 側邊選單寬度 |
| 頂欄高度 | `--header-height` | 50px | 頂部導航高度 |
| 內容最大寬度 | `--content-max-width` | 100% | 內容區最大寬度 |

---

## 10. 常用樣式模式 (Common Patterns)

### 10.1 卡片樣式

```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
}
```

### 10.2 按鈕樣式

```css
/* 主要按鈕 */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  transition: background-color var(--transition-base);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

/* 次要按鈕 */
.btn-secondary {
  background-color: var(--color-gray-100);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* 危險按鈕 */
.btn-danger {
  background-color: var(--color-error);
  color: var(--text-inverse);
}
```

### 10.3 輸入框樣式

```css
.input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.input:focus {
  outline: none;
  border-color: var(--border-color-focus);
  box-shadow: 0 0 0 3px rgba(0, 112, 187, 0.1);
}

.input.error {
  border-color: var(--color-error);
}
```

### 10.4 表格樣式

```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--border-color);
  text-align: left;
}

.table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-color-light);
}

.table tr:hover {
  background-color: var(--color-gray-50);
}
```

---

## 11. 訊息提示樣式

### 11.1 成功訊息

```css
.alert-success {
  background-color: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}
```

### 11.2 錯誤訊息

```css
.alert-error {
  background-color: var(--color-error-light);
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}
```

### 11.3 警告訊息

```css
.alert-warning {
  background-color: var(--color-warning-light);
  color: #856404;  /* 深色橘文字 */
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}
```

---

## 12. 使用建議

### 12.1 優先使用 CSS 變數

❌ **不建議：**
```css
.button {
  background-color: #0070BB;
  padding: 16px;
  border-radius: 6px;
}
```

✅ **建議：**
```css
.button {
  background-color: var(--color-primary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}
```

### 12.2 遵循間距系統

使用標準間距值，避免自訂數字：
```css
/* ✅ 好 */
margin: var(--space-4);  /* 16px */

/* ❌ 避免 */
margin: 15px;  /* 不符合 8px 系統 */
```

### 12.3 保持陰影一致

使用預定義的陰影級別，不要自訂：
```css
/* ✅ 好 */
box-shadow: var(--shadow-md);

/* ❌ 避免 */
box-shadow: 0 2px 5px rgba(0,0,0,0.15);
```

---

## 13. 總結

**使用這套樣式系統的好處：**
1. ✅ **風格一致** - 所有頁面使用相同的色彩、間距、字體
2. ✅ **易於維護** - 修改一個變數即可影響全域
3. ✅ **響應式友善** - 預定義的斷點和尺寸系統
4. ✅ **符合無障礙** - 色彩對比度符合 WCAG 標準
5. ✅ **開發效率高** - 不需記憶具體數值，使用語意化變數名稱

**下一步：**
- 查看 `05-ui-components.md` 了解如何將樣式套用到元件
- 查看 `07-i18n-guide.md` 了解多語系文字處理
