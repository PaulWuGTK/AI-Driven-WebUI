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

