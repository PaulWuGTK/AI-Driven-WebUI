# 文件完整性檢查清單 (Documentation Completeness Checklist)

> 本文件用於驗證 `docs-local-ref` 的完整性，確保可以用這些文件獨立重建前端頁面。

---

## ✅ 核心文件完整度

- [x] **API 規格文件** (`01-api-specification.md`)
  - [x] 所有 API endpoints 都有記錄
  - [x] Request/Response 格式定義完整
  - [x] 特殊端點（非標準格式）有說明
  - [x] 有快速索引表

- [x] **資料模型文件** (`02-data-models.md`)
  - [x] 所有 TypeScript 介面都已轉換
  - [x] 資料結構為語言無關格式
  - [x] 欄位型別定義清楚

- [x] **頁面結構文件** (`03-page-structure.md`)
  - [x] 每個路由頁面都有說明
  - [x] 頁面使用的 API 有列出
  - [x] 使用者可執行的操作有記錄
  - [ ] **待補充：UI 元件庫參考** (見下方建議)

- [x] **路由與權限文件** (`04-routing-permissions.md`)
  - [x] 認證流程完整
  - [x] 運作模式說明
  - [x] 選單可見性規則完整
  - [x] 完整路由表

---

## 📋 驗證方法

### 1. API 覆蓋率驗證

```bash
# 檢查所有 API service 檔案是否都在文件中
find src/services/api -name "*.ts" -not -name "index.ts"

# 對照 01-api-specification.md 中的 endpoint 清單
# 確認每個 service 都有對應的 API 文件
```

**驗證結果：**
- [ ] 所有 API service 都有對應文件
- [ ] 所有文件中的 API 都有實作

### 2. 資料模型覆蓋率驗證

```bash
# 檢查所有 types 檔案
find src/types -name "*.ts"

# 對照 02-data-models.md
# 確認所有 interface/type 都有文件
```

**驗證結果：**
- [ ] 所有主要 interface 都有文件
- [ ] 特殊資料結構（union types, enums）都有說明

### 3. 頁面覆蓋率驗證

```bash
# 檢查所有 view 檔案
find src/views -name "*.vue"

# 對照 03-page-structure.md
# 確認每個頁面都有功能說明
```

**驗證結果：**
- [ ] 所有路由頁面都有文件
- [ ] 所有頁面的 API 使用都有記錄
- [ ] 所有頁面的操作流程都有說明

### 4. 路由完整性驗證

```bash
# 檢查 router/index.ts 中的路由定義
# 對照 04-routing-permissions.md
```

**驗證結果：**
- [ ] 所有路由都有文件
- [ ] 所有 menuKey 的可見性規則都有記錄
- [ ] 認證/權限檢查機制有完整說明

---

## 🎯 里程碑定義建議

### Milestone 1: 基礎文件完整 ✅ (已完成)
- [x] API 規格文件
- [x] 資料模型文件
- [x] 頁面結構文件
- [x] 路由權限文件

### Milestone 2: 驗證與補充 (建議進行)
- [ ] 執行上述 4 項驗證
- [ ] 補充遺漏的 API/頁面文件
- [ ] 新增 UI 元件庫參考文件（見下方）
- [ ] 新增樣式指南文件（見下方）

### Milestone 3: 可用性測試 (最終驗證)
- [ ] 找一位不熟悉此專案的開發者
- [ ] 僅提供 docs-local-ref 文件
- [ ] 請他嘗試用 Lua + API 重建其中一個頁面
- [ ] 記錄他遇到的問題和需要查看原始碼的次數
- [ ] 根據反饋補充文件

---

## 💡 建議補充的文件

### 1. UI 元件庫參考 (`05-ui-components.md`)

**目的：** 說明可用的共用元件及其用法，避免重複造輪子

**內容應包含：**
- BaseInput, BaseSelect, BaseSwitch, BaseSecretInput
- BaseTable, BaseModal, ActionButtons
- SectionCard, BlockingOverlay
- 每個元件的 props 定義
- 使用範例（用 pseudo-code 或 JSON 描述）

**範例格式：**
```markdown
### BaseInput

**用途：** 文字輸入欄位，支援錯誤提示與說明文字

**Props:**
- label: string (必填) - 欄位標籤
- modelValue: string - 輸入值
- error: boolean - 是否顯示錯誤狀態
- errorMessage: string - 錯誤訊息
- helpText: string - 說明文字
- placeholder: string - 提示文字
- required: boolean - 是否必填（顯示紅色星號）
- disabled: boolean - 是否停用

**Events:**
- update:modelValue - 值改變時觸發
```

### 2. 樣式指南 (`06-style-guide.md`)

**目的：** 確保用 Lua 生成的頁面視覺風格一致

**內容應包含：**
- 主題色彩定義（primary, secondary, success, warning, error）
- 間距系統（0.5rem, 1rem, 1.5rem, 2rem）
- 字體大小階層
- 陰影層級
- 邊框圓角標準
- 常用 CSS class 名稱

**範例格式：**
```markdown
### 色彩系統

| 用途 | 色碼 | CSS Variable |
|------|------|--------------|
| 主色（Primary） | `#0078d4` | `--color-primary` |
| 成功（Success） | `#28a745` | `--color-success` |
| 警告（Warning） | `#ffc107` | `--color-warning` |
| 錯誤（Error） | `#dc3545` | `--color-error` |
| 文字主色 | `#333` | `--color-text` |
| 文字次要 | `#666` | `--color-text-secondary` |
| 背景灰 | `#f8f9fa` | `--bg-gray` |
| 邊框 | `#ddd` | `--border-color` |

### 間距系統

統一使用 0.5rem 的倍數：
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 2.5rem (40px)
```

### 3. i18n 多語系指南 (`07-i18n-guide.md`)

**目的：** 說明如何處理多語系文字

**內容應包含：**
- 7 種語言清單（en, zh-TW, zh-CN, ja, ko, fr, de）
- 翻譯 key 命名規則
- 動態參數使用方式
- 範例：`t('account.confirmDeleteUser', { username: 'admin' })`

---

## 🔄 持續維護流程

### 當新增功能時
1. [ ] 更新 API 規格文件（如有新 endpoint）
2. [ ] 更新資料模型文件（如有新 type）
3. [ ] 更新頁面結構文件（如有新頁面）
4. [ ] 更新路由權限文件（如有新路由/權限規則）

### 定期檢查（每月一次）
1. [ ] 執行上述 4 項驗證
2. [ ] 修正發現的遺漏或錯誤
3. [ ] 更新此檢查清單

---

## 📊 完成度計分

### 當前分數評估

| 項目 | 權重 | 完成度 | 得分 |
|------|------|--------|------|
| API 文件 | 30% | 100% | 30 |
| 資料模型 | 25% | 100% | 25 |
| 頁面結構 | 25% | 90% | 22.5 |
| 路由權限 | 20% | 100% | 20 |
| **總分** | **100%** | - | **97.5%** |

### 到達 100% 需要：
- [ ] 補充 UI 元件庫參考（+1.5%）
- [ ] 補充樣式指南（+1%）
- [ ] 完成驗證測試（確認無遺漏）

---

## 🎓 使用這些文件的方式

### 情境 1：用 Lua 重建一個頁面

1. 查看 `03-page-structure.md` 找到該頁面的功能描述
2. 查看 `04-routing-permissions.md` 了解該頁面的路由和可見性規則
3. 查看 `01-api-specification.md` 找到該頁面使用的 API
4. 查看 `02-data-models.md` 了解 API 的 request/response 結構
5. （建議補充）查看 `05-ui-components.md` 選擇適合的 UI 元件
6. （建議補充）查看 `06-style-guide.md` 確保樣式一致

### 情境 2：驗證 API 呼叫是否正確

1. 查看 `01-api-specification.md` 確認 endpoint 和方法
2. 查看 `02-data-models.md` 確認 payload 格式
3. 注意 Enable/Disable 欄位必須使用 `0/1`（不是 `true/false`）

### 情境 3：確認頁面在特定模式下是否可見

1. 查看 `04-routing-permissions.md` 的選單可見性規則
2. 找到對應的 menuKey
3. 檢查 netLayoutType, operationMode, userRole 條件

---

## ✨ 總結

**目前狀態：** 基礎文件架構完整（97.5%）

**建議行動：**
1. ✅ 使用本檢查清單執行完整性驗證
2. ✅ 補充建議的 3 份文件（UI元件、樣式、i18n）
3. ✅ 找人實際測試用這些文件重建頁面
4. ✅ 根據測試反饋持續優化

**里程碑交付物：**
- 向主管展示 4 份核心文件（3791 行）
- 展示本完整性檢查清單
- 說明已覆蓋 72 個 API endpoints、所有主要頁面、完整路由結構
- 提出後續優化計畫（補充 3 份建議文件）
