# Claude Code — Project Instructions

## Deploy WebUI to DUT (192.168.1.1)

**CRITICAL**: The WebUI root on the device is `/www/` (NOT `/www/webui/`).

### Full deploy flow (build + package + deploy)

```bash
npm run build
tar -czf ai-driven-webui.tar.gz dist
scp -O ai-driven-webui.tar.gz root@192.168.1.1:/tmp/ai-driven-webui.tar.gz
ssh root@192.168.1.1 "cd /tmp && rm -rf dist && tar zxf ai-driven-webui.tar.gz && rm -rf /www/* && cp -a dist/* /www/ && sync && echo DEPLOY_OK"
```

Key points:
- Package as `tar -czf ai-driven-webui.tar.gz dist` (include the `dist` folder itself)
- Use `scp -O` (DUT has no sftp-server)
- Extract on DUT produces `/tmp/dist/`, then copy `dist/*` into `/www/`
- Always `rm -rf /www/*` before copying to remove stale hashed files

### Deploy single Lua to DUT

```bash
scp -O <local-lua-file> root@192.168.1.1:/tmp/<filename>.lua
ssh root@192.168.1.1 "cp -a /tmp/<filename>.lua <target-path> && chmod 755 <target-path> && <restart-command>"
```

## Git Workflow

- Two branches: `GFiberWebUI-20260522` and `GenericWebUI-20260522`
- Every commit must include the `ai-driven-webui.tar.gz` build artifact (SDK expects this exact filename)
- Push to both branches after each commit
- Commit message prefix: `WebUI:`
- **NEVER force push to GenericWebUI-20260522** — internal Gitea mirrors this branch, and SDK Makefiles pin specific commit hashes (`PKG_SOURCE_VERSION`). Force push would make those commits unreachable and break SDK builds.
- Push to GenericWebUI-20260522 using cherry-pick (not direct push from GFiberWebUI-20260522), so each branch maintains its own commit history.
- **NEVER use `git commit --amend` after a commit has been pushed.** Once pushed, any fix must be a **new commit** on top. Amending a pushed commit rewrites history and requires force push, which is forbidden on GenericWebUI-20260522. Only amend commits that have NOT been pushed yet.

## i18n

- 7 locales: `en`, `zh-TW`, `zh-CN`, `ja`, `ko`, `fr`, `de`
- Type definitions in `src/i18n/locales/types.ts`
- Always update all 7 locale files + types.ts when adding/modifying i18n keys

## Session Management & Plan Cleanup

### Token Usage Monitoring

- Monitor token usage from system warnings: `Token usage: X/200000; Y remaining`
- **Alert threshold**: 90% usage (180,000/200,000 tokens)
- When reaching 90%, proactively remind user and offer to clean up

### Plan File Cleanup

**CRITICAL**: Always clean up plan files when tasks are completed to prevent confusion after session resumption.

#### When to clean up:
1. **Task completed**: Immediately after finishing implementation and testing
2. **Before session compression**: When approaching 90% token usage
3. **On explicit completion**: When user confirms task is done

#### How to clean up:
```bash
# Remove completed plan file
rm -f ~/.claude/plans/<plan-file-name>.md

# Clear todo list if no active tasks
# Use TodoWrite tool with empty array: []
```

#### Best practices:
- **After task completion**: Ask user "該任務已完成，是否移除對應的 plan 檔案？"
- **Session resumption**: If seeing old plan files, ask user first before automatically resuming
- **Never assume**: Don't automatically continue plans after session resumption - always confirm with user
- **Clean todo list**: Clear or update TodoWrite after completing tasks

### Session Resumption Protocol

When continuing from a previous session:

1. **Check current context**: Don't automatically resume old plans
2. **Confirm with user**: Ask what the current task is
3. **Clean up old plans**: Remove completed plan files proactively
4. **Verify todo list**: Ensure TodoWrite reflects current work, not old tasks

**Example prompt after resumption:**
```
對話已恢復。發現舊的 plan 檔案 [XXX]，
請問是要：
1. 繼續之前的任務
2. 開始新的任務（並清理舊 plan）
3. 其他
```

## Self-Learning Protocol

When encountering an error during a task and subsequently finding a solution, **proactively ask the user** whether to record the lesson in this file.

### When to ask:

- SSH/SCP connection failures resolved by a workaround
- Build or deploy errors caused by environment/config issues
- API call failures due to authentication, encoding, or format issues
- Any repeated mistake that a future session would benefit from knowing

### How to ask:

```
剛剛遇到 [問題描述]，已透過 [解法] 解決。
是否要記錄到 CLAUDE.md 的「Known Issues & Solutions」中，避免下次再發生？
```

### How to record:

Append to the `Known Issues & Solutions` section below with format:

```markdown
#### Issue Title
- **Symptom**: What went wrong
- **Cause**: Why it happened
- **Solution**: How to fix it
```

## Known Issues & Solutions

#### DUT SSH host key changes after reflash/reboot
- **Symptom**: `REMOTE HOST IDENTIFICATION HAS CHANGED` error during scp/ssh
- **Cause**: DUT regenerates SSH host keys on reflash; old key in `~/.ssh/known_hosts` no longer matches
- **Solution**: `ssh-keygen -R 192.168.1.1` then retry with `-o StrictHostKeyChecking=accept-new`

#### Jira API curl fails with "URL rejected: Malformed input"
- **Symptom**: `curl` with `$JIRA_API_TOKEN` env var fails with malformed URL error
- **Cause**: Token contains `=` and special chars; shell variable expansion inside double quotes corrupts the value
- **Solution**: Use single-quoted inline credentials instead of env var expansion (see Jira API section below)

#### Locale files must be read before parallel editing
- **Symptom**: `File has not been read yet` error when editing multiple locale files in parallel
- **Cause**: The Edit tool requires a file to be Read at least once in the conversation before editing
- **Solution**: Read all 7 locale files first (can be parallel), then edit them (can be parallel)

#### CLAUDE.md must NEVER contain credentials or secrets
- **Symptom**: Jira API token and email were accidentally committed to CLAUDE.md and pushed to both branches
- **Cause**: Credentials were stored directly in CLAUDE.md for convenience; `git add CLAUDE.md` included them in the commit
- **Solution**: Store all credentials in **environment variables** only (`~/.bashrc` or `~/.zshrc`). CLAUDE.md should reference env var names (e.g., `$JIRA_USER_EMAIL`) but NEVER contain actual values. After an accidental leak, immediately rotate the token at https://id.atlassian.com/manage-profile/security/api-tokens

#### Jira search API endpoint deprecated
- **Symptom**: `/rest/api/3/search` returns error about migration
- **Cause**: Atlassian deprecated the `/rest/api/3/search` endpoint
- **Solution**: Use `/rest/api/3/search/jql` instead. Same parameters (jql, maxResults, fields, startAt) but different base path

#### v-if condition hides field when default value changes
- **Symptom**: A field "disappears" from the UI after changing a default value elsewhere
- **Cause**: Field visibility controlled by `v-if` on a value that changed (e.g., Idle Time shown only when `Contrigger === 'OnDemand'`, but default changed to `'AlwaysOn'`)
- **Solution**: Review all `v-if` conditions that depend on the changed value; adjust or remove conditions as needed

#### syslog-ng persist-name conflict with multiple remote destinations (BACKEND BUG)
- **Symptom**: syslog-ng fails to start after configuring remote syslog. Error message: `conflicting persist-names were found; persist_name='afsocket_dd.(dgram,192.168.1.168:514)'`. DUT sends no syslog packets to remote server (verified via tcpdump). Occurs when multiple log types (messages_remote, wifi, hostapd) are configured to send to the same IP:port.
- **Cause**: The `mod-syslogng.so` module (part of tr181-syslog system component) auto-generates `/etc/syslog-ng.conf` but does not add unique `persist-name` options when multiple network destinations point to the same host:port. syslog-ng requires each destination to have a unique persist-name identifier. This is a **backend system bug in the SDK/firmware**, not a WebUI issue.
- **Root cause file**: `/usr/lib/amx/tr181-syslog/mod-syslogng.so` (compiled binary)
- **When it happens**: Configuration is regenerated whenever LogRemote parameters change (Enable, Address, Port, Protocol) via WebUI or ba-cli
- **Temporary workaround** (manual fix after each config change):
  ```bash
  ssh root@192.168.1.1

  # Backup current config
  cp /etc/syslog-ng.conf /etc/syslog-ng.conf.backup

  # Add unique persist-name to each network destination
  sed -i '
  /destination d_action_1_network/,/);/ {
      /);/i\		persist-name("remote_wifi")
  }
  /destination d_action_5_network/,/);/ {
      /);/i\		persist-name("remote_hostapd")
  }
  /destination d_action_8_network/,/);/ {
      /);/i\		persist-name("remote_messages")
  }
  ' /etc/syslog-ng.conf

  # Restart syslog-ng
  killall syslog-ng
  sleep 1
  syslog-ng

  # Verify it started successfully
  ps | grep syslog-ng
  ```
- **Verification**: Use tcpdump to confirm packets are being sent: `tcpdump -i any -n 'udp and port 514' -c 3 -X`
- **Long-term solution**: This bug must be fixed in the tr181-syslog module at the SDK/firmware level. The config generator should automatically add unique persist-names when multiple destinations share the same host:port combination. Report to backend/SDK team.
- **Note**: The Remote Syslog WebUI feature itself works correctly. The DeviceSyslogAction.lua and frontend code do not need any changes. This is purely a backend system configuration generation issue.

#### Windows Firewall blocks syslog UDP 514 inbound
- **Symptom**: DUT is sending syslog packets (verified via tcpdump on DUT), but Python syslog server on Windows PC receives nothing
- **Cause**: Windows Firewall blocks inbound UDP traffic on port 514 by default
- **Solution**: Add firewall rule with administrator privileges:
  ```powershell
  # Run PowerShell as Administrator, then:
  netsh advfirewall firewall add rule name="Syslog UDP 514" protocol=UDP dir=in localport=514 action=allow
  ```
- **Verification**: `netsh advfirewall firewall show rule name="Syslog UDP 514"`

## Page Development Guidelines

### Modal Form Pattern (Reference: QosRuleTab.vue)

When building pages with Add/Edit modals, always reference `src/views/network/qos/QosRuleTab.vue` as the canonical pattern:

```html
<BaseModal v-model="showModal" :title="modalTitle">
  <div class="modal-form">
    <div v-if="formError" class="modal-error-banner">{{ formError }}</div>
    <div class="form-group">
      <label class="form-label form-label-required">Label</label>
      <BaseInput v-model="formData.field" />
    </div>
    <div class="form-group">
      <label class="form-label">Label</label>
      <BaseSelect v-model="formData.field" :options="options" />
    </div>
    <ActionButtons class="modal-actions"
      :apply-text="editMode ? t('common.save') : t('common.add')"
      :apply-loading="saving"
      @cancel="showModal = false" @apply="handleSubmit" />
  </div>
</BaseModal>
```

CSS classes used with this pattern:
- `modal-form` — flex column with gap
- `modal-error-banner` — error banner inside modal
- `modal-actions` — flex end-aligned button group

### Use Existing Base* Components

- **BaseInput** — for text/number/password inputs (wraps `<input>` with form-group, label, error display)
- **BaseSelect** — for dropdowns with simple option lists
- **BaseSwitch** — for on/off toggles (supports `trueValue`/`falseValue`)
- **ActionButtons** — for save/cancel button pairs (supports `applyLoading`, `applyType="submit"`)
- **SectionCard** — for page sections with title bar (`header-mode="row"` + `#actions` slot for table headers)
- **BaseTable** — for data tables
- **BaseModal** — for modal dialogs
- **BaseToast** — for success/error notifications

**Exception**: `BaseSelect` does NOT support per-option `:disabled`. When individual options need to be disabled, use a raw `<select>` with the `form-select` CSS class.

### Efficient Page Planning

When creating a new page or feature:
1. **Pick one existing page** that has the closest UI pattern (table + modal → QosRuleTab, simple form → DdnsForm)
2. **Read that reference page once** and adapt its structure directly
3. **Do NOT search extensively** across many files during initial planning — this wastes context and time
4. Import components from `'../../../components/common'` (barrel export)

## Jira API

**Base URL:** `https://gemteks-jira.atlassian.net`
**API Version:** `/rest/api/3/` (NOT v2)

**IMPORTANT**: Credentials are stored in environment variables (`JIRA_USER_EMAIL`, `JIRA_API_TOKEN`), NOT in this file. See the check-jira skill for setup instructions.

### Fetch Single Issue

```bash
# Read credentials from env vars first, then use actual values in single quotes
curl -s -u '<JIRA_USER_EMAIL>:<JIRA_API_TOKEN>' \
  'https://gemteks-jira.atlassian.net/rest/api/3/issue/PCSDW1-XXX' | \
  python -c "import sys, json; data = json.load(sys.stdin); print(json.dumps({'key': data['key'], 'summary': data['fields']['summary'], 'description': data['fields']['description'], 'status': data['fields']['status']['name']}, indent=2, ensure_ascii=False))"
```

### Query Multiple Issues (JQL)

```bash
# NOTE: /rest/api/3/search is DEPRECATED — use /rest/api/3/search/jql instead
curl -s -u '<JIRA_USER_EMAIL>:<JIRA_API_TOKEN>' \
  'https://gemteks-jira.atlassian.net/rest/api/3/search/jql?jql=project%3DPCSDW1%20AND%20status%20not%20in%20(Done)&maxResults=50&fields=summary,status,assignee,priority'
```

### Jira Project Statuses

PCSDW1 uses Chinese status names:
- `待辦事項` = To Do / Open
- `進行中` = In Progress
- `Ready for Verification`
- `Need Info`
- `Done`

When querying by status, use `status not in (Done)` to get all open issues. There is no "Open" status.

### Important Notes

- Use `/rest/api/3/` (not `/rest/api/2/`)
- **Search endpoint**: Use `/rest/api/3/search/jql` (NOT the old `/rest/api/3/search` which is deprecated)
- For JQL queries, use `status not in (Done)` (NOT `status != Done`)
- The old internal Jira URL `jira.gemteksolutions.com` is deprecated
- Always use single-quoted `-u 'email:token'` syntax — do NOT use env var expansion with this token
- **NEVER commit credentials to this file** — use environment variables instead

