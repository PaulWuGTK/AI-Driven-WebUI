# AI Page Generation Guide

## Purpose
這份文件給「下一次要請 AI 產生新頁面」時使用，避免遺漏：
- 多國語
- 視覺風格一致性
- 路由/選單可見性
- API/Type/Mock 分層
- `data-testid` 覆蓋

---

## 1) Required Deliverables (最低交付)
新增一個頁面時，至少要有以下項目：

1. View
- `src/views/.../*.vue`

2. API service
- `src/services/api/<feature>.ts`

3. Type definitions
- `src/types/<feature>.ts`

4. Mock data/service (如果該頁支援 mock/dev)
- `src/services/mockData/<feature>MockData.ts`

5. i18n keys
- `src/i18n/locales/en.ts`
- `src/i18n/locales/zh-TW.ts`
- `src/i18n/locales/zh-CN.ts`
- `src/i18n/locales/ja.ts`
- `src/i18n/locales/ko.ts`
- `src/i18n/locales/fr.ts`
- `src/i18n/locales/de.ts`

6. Route + Menu visibility
- `src/router/index.ts`
- `src/types/menuVisibility.ts`

7. QA test ids
- 頁面主要區塊、按鈕、欄位、表格列、錯誤與成功訊息都要有 `data-testid`（透過 `useQA()`）

---

## 2) UI/Interaction Rules (跟現有頁面一致)
### 2.1 Modal vs Replace（依 `PHASE5_EDIT_INTERACTION_AUDIT.md`）
Use `modal` when:
- 表格型 CRUD
- 單筆編輯
- 需要保持列表可見

Use `replace` when:
- 表單長且多段
- 需要 `list -> detail/edit -> back`
- 設定頁屬性強、需要完整畫面

### 2.2 Common Components 優先
優先使用：
- `SectionCard`
- `BaseTable`
- `BaseModal`
- `ActionButtons`
- `BaseInput` / `BaseSelect` / `BaseSwitch` / `BaseSecretInput`

避免自造一套按鈕/輸入框樣式，除非有明確需求。

### 2.3 Action 欄位樣式
- 使用 Material Icons（與現有頁面一致）
- icon size 以現有頁面風格為準（常見為 `24px`）
- 操作欄置中，避免 row 高度/欄寬跳動

---

## 3) i18n Rules
### 3.1 不可硬編字串
頁面上的可見文案都要走 `t('...')`，包含：
- 標題
- 小節標題
- 欄位 label
- placeholder
- 按鈕文字
- 對話框標題/訊息
- 錯誤與成功訊息

### 3.2 Key 命名規則
- 使用 feature namespace，例如 `account.*`、`upnp.*`
- 不要重用不相關 namespace（例如刪除確認不要借 `qos.confirmDelete`）
- 需要動態值時用參數：`t('account.confirmDeleteUser', { username })`

### 3.3 多語一致性檢查
新增 key 後，7 個 locale 檔都要補齊同名 key。

---

## 4) Menu/Role/Layout Integration Rules
若頁面有機種或角色差異（例如 CHT）：

1. 由 `SidebarMenu` context 決定（NetLayoutType / role）
- 參考 `useMenuVisibilityContext.ts`

2. 在 `menuVisibility.ts` 定義可見性
- `netLayoutTypes`
- `operationModes`
- 必要時 `roles`

3. 在 router 加入對應判斷
- `src/router/index.ts` 的 `routeVisibilityRules` 要有對應 menuKey

4. 若同路徑不同機種顯示不同頁
- 用 entry wrapper 決定渲染（參考 `AccountManagementEntry.vue`）

---

## 5) QA / data-testid Rules
### 5.1 使用方式
- 在頁面引入 `useQA`
- 以 `qa('<feature>-<element>')` 產生

### 5.2 最低覆蓋
- page title
- content root
- loading / error / success
- table headers / rows / actions
- form labels / inputs / toggles
- add/edit/delete buttons
- confirm dialog

---

## 6) API / Type / Mock Rules
1. Type 先行
- 先在 `src/types/<feature>.ts` 定義 GET/POST payload 與 response

2. API 層只負責轉換與呼叫
- `src/services/api/<feature>.ts`
- **Enable/Disable 欄位規則（固定）**
  - 後端進出（GET/POST）一律使用 `0/1`
  - UI state（Vue）可以使用 `boolean`
  - API adapter 必須做雙向轉換：
    - inbound: `0/1` -> `boolean`
    - outbound: `boolean` -> `0/1`
  - 禁止直接把 `true/false` 原樣送到後端
  - 若後端偶爾回傳字串 `'0'/'1'`，也要在 API 層一併 normalize

3. Mock 結構要與 API normalize 後一致
- 避免 mock 與真實 response 結構不同造成 UI 行為差異
- 建議同時保留「raw API mock = 0/1」驗證轉換邏輯，避免只在 mock 模式才正常

### 6.1 可複製 Helper（建議直接放在 `src/services/api/<feature>.ts`）
```ts
// Accept backend values: 0/1, '0'/'1', boolean, null/undefined
const toBool01 = (value: unknown): boolean => {
  if (value === 1 || value === '1' || value === true) return true;
  if (value === 0 || value === '0' || value === false) return false;
  return false; // fail-safe
};

// Outbound contract: backend must receive numeric 0/1
const toInt01 = (value: unknown): 0 | 1 => (value ? 1 : 0);
```

### 6.2 API Adapter 實作範例（inbound/outbound）
```ts
// inbound: API -> UI model
const normalizeResponse = (raw: any) => ({
  Enable: toBool01(raw.Enable),
  NATEnable: toBool01(raw.NATEnable),
  IGMPEnable: toBool01(raw.IGMPEnable)
});

// outbound: UI model -> API payload
const buildPayload = (ui: any) => ({
  Enable: toInt01(ui.Enable),
  NATEnable: toInt01(ui.NATEnable),
  IGMPEnable: toInt01(ui.IGMPEnable)
});
```

### 6.3 PR 檢查重點（Enable/Disable）
- 檢查 Vue state（checkbox/switch）是否為 boolean。
- 檢查送出 payload 是否是數字 `0/1`。
- 檢查 mock 與真機 API response 是否都能被 `toBool01` 正常處理。

---

## 7) Pre-merge Checklist
- [ ] 沒有硬編文案（全部 `t(...)`）
- [ ] 7 個 locale key 都補齊
- [ ] menuVisibility + router 規則已更新
- [ ] `data-testid` 完整
- [ ] `npm run build` 成功
- [ ] `npm run dev` 目測桌機/手機版面正常
- [ ] CRUD 互動模式符合 `modal/replace` 規則
- [ ] 檢查 Network payload：Enable/Disable 送出值是 `0/1`（不是 `true/false`）

---

## 8) Prompt Template (給 AI 的需求模板)
可直接複製以下內容給 AI：

```md
請幫我新增一頁「<PageName>」。

需求：
1. 位置：<menu path / route path>
2. 機種條件：<prpl/genix/cht>
3. 角色條件：<super/normal>
4. 功能：<list/add/edit/delete/detail>
5. API：
   - GET: <endpoint + response shape>
   - POST: <endpoint + payload shape>
   - Enable/Disable 欄位請使用 0/1（UI 可用 boolean，但 API 層需轉換）
6. UI 互動模式：<modal 或 replace>（請依 PHASE5 Decision Rules）
7. 必須使用 common components，保持既有風格
8. 全部文案要 i18n，補齊 en/zh-TW/zh-CN/ja/ko/fr/de
9. 要補完整 data-testid（useQA）
10. 請同步更新：
   - src/views
   - src/services/api
   - src/services/mockData（若需要）
   - src/types
   - src/i18n/locales/*
   - src/router/index.ts
   - src/types/menuVisibility.ts
11. 最後跑 npm run build 並回報結果
```

---

## 9) Notes
- 若需求只允許「最小改動」，優先在既有結構下擴充，不做大規模重構。
- 若後端/ACL 限制影響頁面行為，先在文件註明風險與邊界，再決定是否調整前端流程。

---

## 10) Apply Loading / Double-click Protection Rules

> 適用範圍：凡是頁面上的 `Apply` 會觸發 API（尤其是 `await` 的非同步流程），都必須遵循此規範。

### 10.1 必做規則
1. `ActionButtons` 必須綁定 loading 狀態  
   - `:apply-loading="loading"`
   - `:apply-disabled="loading"`
   - `:cancel-disabled="loading"`

2. handler 必須防重入  
   - `if (loading.value) return;`
   - 在 `try/finally` 中確保 `loading` 一定會復原。

3. 任何可再次觸發同一 API 的互動元件（例如編輯 icon、列表按鈕）在 loading 期間要 disable。

### 10.2 UX 分級
1. API 一般耗時（< 1 秒）  
   - 使用按鈕 loading + disable 即可。

2. API 可能較久（>= 1 秒，或需要輪詢）  
   - 除按鈕 loading 外，建議加頁面區塊或全頁 overlay，避免使用者誤判「沒反應」而重複點擊。

### 10.3 `data-testid` 規範
1. Apply 按鈕：`<feature>-apply-button`
2. Apply loading：`<feature>-apply-loading`
3. Overlay（若有）：`<feature>-applying-overlay`
4. Overlay spinner：`<feature>-applying-spinner`
5. Overlay text：`<feature>-applying-text`

### 10.4 實作範例
```vue
<ActionButtons
  :apply-loading="loading"
  :apply-disabled="loading"
  :cancel-disabled="loading"
  @apply="handleApply"
/>
```

```ts
const loading = ref(false);

const handleApply = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    await submitApi();
  } finally {
    loading.value = false;
  }
};
```

### 10.5 Code Review Checklist（Apply 行為）
- [ ] `@apply` 對應的流程是否有 `loading` guard。
- [ ] `ActionButtons` 是否同時有 `apply-loading / apply-disabled / cancel-disabled`。
- [ ] loading 期間是否禁止其他可重複觸發操作。
- [ ] 錯誤情境是否能正確解除 loading。
- [ ] 是否補齊對應 `data-testid`。

---

## 11) i18n Safe Editing Rules (Encoding + One-pass)

Use this workflow when adding or updating locale text to avoid mojibake and incomplete locale updates.

### 11.1 File Encoding Safety
1. Keep locale files as `UTF-8` (no BOM preferred).
2. Do not copy text through terminals/editors that convert encoding (CP932/Big5/ANSI).
3. If a locale file already looks corrupted in terminal output, do not mass-reformat it. Apply minimal line edits only.

### 11.2 One-pass Update Order
1. Add/rename i18n keys in `en.ts` first.
2. Immediately add the same keys in all required locales:
   - `zh-TW.ts`, `zh-CN.ts`, `ja.ts`, `ko.ts`, `fr.ts`, `de.ts`
3. Update all Vue usages from hard-coded text to `t('...')` in the same change.
4. Run verification before finishing:
   - `rg` for hard-coded strings in modified feature
   - `npm run build`

### 11.3 Overlay/Loading Copy Rules
1. Shared component defaults must be generic (no feature-specific wording).
2. Feature pages must pass their own feature wording explicitly.
3. If countdown is not required, pass:
   - `:description2="''"` or disable countdown/progress props.

### 11.4 Translation Quality Rules
1. Use product/router terminology consistently (no casual wording).
2. Keep style parallel across locales for the same key (same intent, same tone).
3. Prefer existing namespace:
   - `common.*` for generic actions/loading
   - `<feature>.*` for feature-specific applying text.

### 11.5 Pre-commit i18n Checklist
- [ ] No hard-coded UI copy in modified Vue files.
- [ ] New keys exist in all mandatory locales.
- [ ] Common vs feature namespaces are used correctly.
- [ ] Build passes (`npm run build`).

### 11.6 Safe Editing Commands (Windows/PowerShell)
Use these defaults when touching locale files to avoid encoding corruption:

1. Always read/write with explicit UTF-8:
   - `Get-Content -Raw -Encoding UTF8 <file>`
   - `Set-Content -Encoding UTF8 <file> <content>`
2. Prefer minimal edits with `apply_patch` for locale updates.
3. Before batch edits, create a backup copy:
   - `Copy-Item src/i18n/locales src/i18n/locales.bak -Recurse`
4. After changes are validated (`rg` key check + `npm run build`), remove backup:
   - `Remove-Item -Recurse -Force src/i18n/locales.bak`
5. Verify new keys in one command:
   - `rg -n "<newKey1>|<newKey2>" src/i18n/locales -g "*.ts"`
6. Final verification must include:
   - `npm run build`

### 11.7 Recovery Playbook (If Mojibake Happens)
1. Stop batch replacement immediately.
2. Restore only affected locale files from backup or Git history.
3. Re-apply changes with UTF-8 explicit read/write and minimal scope.
4. Re-run:
   - `rg` key check for all locales
   - `npm run build`

---

## 12) Lua Backend Scope (Use Only When Needed)

1. If the task includes creating or modifying Lua files under:
   - `referfolder/webui-generic/prpl/*.lua`
   then also follow:
   - `LUA_SCHEMA_GENERATION_GUIDE.md`

2. If the task is frontend-only (Vue/API adapter/i18n/router), do not force Lua changes.

3. For Lua generation, explicitly require:
   - payload root check (`M.func(arg)` unwrapped payload rule)
   - schema strictness decision (schema vs manual validation)
   - `0/1` vs boolean normalization where needed

---

## 13) Vue Safe Editing Rules (Backup + Validate + Cleanup)

Use this workflow when editing `.vue` files to reduce accidental breakage.

### 13.1 Before Editing
1. If touching a few files, back up only those files:
   - `Copy-Item src/views/advanced/lcm/ExecEnvTab.vue src/views/advanced/lcm/ExecEnvTab.vue.bak`
2. If touching many files in one feature, back up the feature folder:
   - `Copy-Item src/views/advanced/lcm src/views/advanced/lcm.bak -Recurse`
3. Prefer small incremental edits instead of large one-shot replacements.

### 13.2 During Editing
1. Keep one concern per change (UI, logic, i18n, API adapter).
2. Prefer `apply_patch` for minimal and auditable diffs.
3. Avoid broad regex replacement across `.vue` files unless absolutely needed.

### 13.3 Validation
1. Type/build check:
   - `npm run build`
2. Quick search for likely regressions (example):
   - `rg -n "TODO|FIXME|hard-coded|console\\.log" src/views src/components`
3. Run a page-level smoke test in browser (load page, trigger save/apply, verify no console errors).

### 13.4 Cleanup
1. Only after validation passes, remove backups:
   - `Remove-Item src/views/advanced/lcm/ExecEnvTab.vue.bak -Force`
   - `Remove-Item src/views/advanced/lcm.bak -Recurse -Force`

### 13.5 Recovery (If Vue Page Breaks)
1. Restore backup immediately:
   - `Copy-Item src/views/advanced/lcm/ExecEnvTab.vue.bak src/views/advanced/lcm/ExecEnvTab.vue -Force`
2. Re-apply changes in smaller chunks.
3. Re-run:
   - `npm run build`
