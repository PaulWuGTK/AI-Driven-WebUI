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

## i18n

- 7 locales: `en`, `zh-TW`, `zh-CN`, `ja`, `ko`, `fr`, `de`
- Type definitions in `src/i18n/locales/types.ts`
- Always update all 7 locale files + types.ts when adding/modifying i18n keys

