# 快速測試：5 分鐘驗證文件可用性

> 這是一個簡化的測試流程，讓你快速驗證 docs-local-ref 是否可用。

---

## 📋 測試情境

**目標：** 請 AI 根據文件生成一個簡單的 LAN Status 頁面

**不需要：** 查看原始程式碼、複製任何現有檔案

**只需要：** docs-local-ref 文件 + AI 工具（Claude, ChatGPT, etc.）

---

## 🎯 步驟 1：準備提示詞

**複製以下提示詞給 AI：**

```
我有一套 WebUI 技術文件，存放在 docs-local-ref 目錄中。
請你根據這些文件，生成一個 LAN Status 顯示頁面（Vue 3 Composition API）。

步驟：
1. 查看 03-page-structure.md，搜尋 "4.3 LAN 狀態"，了解頁面功能
2. 查看 01-api-specification.md，搜尋 "StatusLan"，找到 API 規格
3. 查看 02-data-models.md，搜尋 "LanStatusResponse"，了解資料結構
4. 查看 05-ui-components.md，使用 SectionCard 元件
5. 查看 06-style-guide.md，使用正確的 CSS 變數
6. 查看 07-i18n-guide.md，所有文字使用 i18n

要求：
- 使用 Vue 3 <script setup> 語法
- 使用 SectionCard 元件作為容器
- 顯示所有 LAN 介面的資訊（Name, MAC, IPv4, Status）
- 樣式使用 CSS 變數（如 var(--color-primary)）
- 所有文字使用 t('lan.xxx') 不可硬編英文
- API 呼叫：GET /API/info?list=StatusLan

請生成完整的 .vue 檔案。
```

---

## ✅ 步驟 2：檢查 AI 輸出

AI 應該生成類似這樣的程式碼：

### 2.1 檢查點 1：API 呼叫正確嗎？

```javascript
// ✅ 正確（符合 01-api-specification.md）
const response = await fetch('/API/info?list=StatusLan');

// ❌ 錯誤（endpoint 不對）
const response = await fetch('/api/lan/status');
```

### 2.2 檢查點 2：使用了正確的元件嗎？

```vue
<!-- ✅ 正確（使用 05-ui-components.md 的 SectionCard） -->
<SectionCard :title="t('lan.title')">
  ...
</SectionCard>

<!-- ❌ 錯誤（自創元件） -->
<CustomCard title="LAN Status">
  ...
</CustomCard>
```

### 2.3 檢查點 3：樣式使用 CSS 變數嗎？

```css
/* ✅ 正確（使用 06-style-guide.md 的變數） */
.interface-card {
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

/* ❌ 錯誤（硬編數值） */
.interface-card {
  padding: 16px;
  background: #f8f8f8;
  border-radius: 8px;
}
```

### 2.4 檢查點 4：文字使用 i18n 嗎？

```vue
<!-- ✅ 正確（使用 07-i18n-guide.md 的翻譯鍵） -->
<span>{{ t('lan.macAddress') }}</span>

<!-- ❌ 錯誤（硬編英文） -->
<span>MAC Address</span>
```

### 2.5 檢查點 5：資料結構正確嗎？

```typescript
// ✅ 正確（符合 02-data-models.md 的 LanStatusResponse）
interface LanInterface {
  Name: string;
  MACAddress: string;
  IPv4Address: string;
  Status: string;
}

// ❌ 錯誤（欄位名稱不對）
interface LanInterface {
  name: string;
  mac: string;
  ip: string;
  status: string;
}
```

---

## 📊 步驟 3：評分

根據上述 5 個檢查點評分：

| 檢查點 | 通過？ | 說明 |
|--------|--------|------|
| API 呼叫正確 | ☐ | endpoint 和方法符合文件 |
| 使用正確元件 | ☐ | 使用文件中定義的元件 |
| 使用 CSS 變數 | ☐ | 不硬編數值 |
| 使用 i18n | ☐ | 不硬編文字 |
| 資料結構正確 | ☐ | 欄位名稱符合文件 |

**通過 5/5：** ✅ 文件完全可用！
**通過 3-4/5：** ⚠️ 文件大致可用，但需要補充某些細節
**通過 0-2/5：** ❌ 文件不夠完整，需要大幅改善

---

## 🔧 步驟 4：如果測試失敗

### 問題 A：AI 使用了錯誤的 API endpoint

**可能原因：** AI 參考了其他知識而非文件

**解決方法：**
```
請重新生成，嚴格參考 docs-local-ref/01-api-specification.md
找到 "### 4.3 LAN 狀態" 章節，API 是：
GET /API/info?list=StatusLan
```

### 問題 B：AI 硬編了英文字串

**可能原因：** 提示詞沒有強調 i18n

**解決方法：**
```
請將所有硬編的英文改為 i18n 翻譯鍵。
參考 docs-local-ref/07-i18n-guide.md
"LAN Status" → t('lan.title')
"MAC Address" → t('lan.macAddress')
```

### 問題 C：AI 沒有使用 CSS 變數

**可能原因：** 提示詞沒有強調樣式指南

**解決方法：**
```
請使用 docs-local-ref/06-style-guide.md 的 CSS 變數。
例如：
- 主色：var(--color-primary)
- 間距：var(--space-4)
- 背景：var(--bg-tertiary)
```

---

## 💡 步驟 5：進階測試（可選）

如果基礎測試通過，可以試試更複雜的：

### 測試 2：Port Forwarding 頁面

**特點：**
- 使用 BaseTable 元件
- 使用 BaseModal 對話框
- 有新增/編輯/刪除操作

**提示詞：**
```
請根據 docs-local-ref 文件，生成 Port Forwarding 頁面。
要求：
1. 使用 BaseTable 顯示規則列表（參考 05-ui-components.md）
2. 使用 BaseModal 進行新增/編輯（參考 05-ui-components.md）
3. API 使用 /API/info?list=PortForwarding（參考 01-api-specification.md）
4. 資料結構參考 02-data-models.md
5. 所有樣式使用 CSS 變數（參考 06-style-guide.md）
6. 所有文字使用 i18n（參考 07-i18n-guide.md）
```

---

## 📝 測試結果記錄

完成測試後，記錄結果：

```
測試日期：__________
測試者：__________
AI 工具：__________

基礎測試（LAN Status）：
- API 正確：[ ]
- 元件正確：[ ]
- CSS 變數：[ ]
- i18n 完整：[ ]
- 資料結構：[ ]

總分：___/5

進階測試（Port Forwarding）：
- 通過：[ ]
- 未通過：[ ]
- 未測試：[ ]

文件改善建議：
1. ______________________________
2. ______________________________
3. ______________________________

總評：
[ ] 文件完全可用，可獨立重建頁面
[ ] 文件大致可用，但需補充某些細節
[ ] 文件不夠完整，需大幅改善
```

---

## ✨ 總結

**如果測試通過（5/5）：**
- ✅ 文件已達到可用標準
- ✅ 可以向主管展示成果
- ✅ 可以實際用於 Lua 重建頁面

**如果測試部分通過（3-4/5）：**
- ⚠️ 記錄哪些地方不足
- ⚠️ 補充遺漏的資訊
- ⚠️ 重新測試

**如果測試失敗（0-2/5）：**
- ❌ 檢視文件是否完整
- ❌ 確認提示詞是否清楚
- ❌ 考慮讓 AI 直接讀取文件內容

---

**下一步：**
1. 實際執行這個快速測試
2. 記錄結果
3. 根據結果決定是否需要補充文件
