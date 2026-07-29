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
- **Alert threshold**: 85% usage (170,000/200,000 tokens)
- When reaching 85%, proactively remind user and offer to clean up

### Plan File Cleanup

**CRITICAL**: Always clean up plan files when tasks are completed to prevent confusion after session resumption.

#### When to clean up:
1. **Task completed**: Immediately after finishing implementation and testing
2. **Before session compression**: When approaching 85% token usage
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

## Jira API

**Base URL:** `https://gemteks-jira.atlassian.net`
**API Version:** `/rest/api/3/` (NOT v2)
**Authentication:** Uses environment variables

### Environment Variables (already configured)

```bash
JIRA_BASE_URL="https://gemteks-jira.atlassian.net"
JIRA_USER_EMAIL="paul_wu@gemteks.com"
JIRA_API_TOKEN="ATATT3xFfG..." # Atlassian API token
```

### Fetch Single Issue

```bash
curl -s -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
  "$JIRA_BASE_URL/rest/api/3/issue/PCSDW1-XXX" | \
  python -c "import sys, json; data = json.load(sys.stdin); print(json.dumps({'key': data['key'], 'summary': data['fields']['summary'], 'description': data['fields']['description'], 'status': data['fields']['status']['name']}, indent=2, ensure_ascii=False))"
```

### Query Multiple Issues

```bash
curl -s -u "$JIRA_USER_EMAIL:$JIRA_API_TOKEN" \
  "$JIRA_BASE_URL/rest/api/3/search?jql=project=PCSDW1+AND+status+not+in+(Done)&maxResults=20&fields=summary,status,assignee" | \
  python -c "import sys, json; data = json.load(sys.stdin); [print(f\"{issue['key']}: {issue['fields']['summary']}\") for issue in data['issues']]"
```

### Important Notes

- Use `/rest/api/3/` (not `/rest/api/2/`)
- For JQL queries, use `status not in (Done)` (NOT `status != Done`)
- The old internal Jira URL `jira.gemteksolutions.com` is deprecated

