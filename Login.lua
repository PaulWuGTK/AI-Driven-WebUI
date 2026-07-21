---
-- Login Module (CAPTCHA + lockout wrapper).
--
-- POST: /API/info?list=Login
-- Body: { username, password, captchaId, captcha }
--
-- Flow:
--   1) check lock (per-user policy from Users.User.{i}.X_GEMTEK-COM_*)
--   2) verify captcha on server via /tmp/captcha/<captchaId>.kv
--   3) if OK, call internal /session (amx_fcgi) with username/password
--
-- @module prpl.Login
--

local common = require('prpl.common')
local utils = require('prpl.utils')
local M = {}

local CAPTCHA_DIR = "/tmp/captcha"
local LOCK_DIR    = "/tmp/login_lock"
local GCPE_PATH   = "X_GEMTEK-COM_GCPE."
local USERINTERFACE_PATH = "UserInterface."
local USERS_PATH  = "Users."

local DEFAULT_MAX_FAILS = 3
local DEFAULT_LOCK_SEC  = 180
local POLICY_MAX_FAILS  = "X_GEMTEK-COM_RetryCount"
local POLICY_LOCK_MIN   = "X_GEMTEK-COM_LockTimeMin"
local POLICY_MAX_FAILS_LEGACY = "X_PRPLWARE-COM_RetryCount"
local POLICY_LOCK_MIN_LEGACY  = "X_PRPLWARE-COM_LockTimeMin"

-- NOTE:
-- In this framework, `arg` is usually the already-unwrapped payload object.
-- Keep schema minimal and aligned with current frontend payload contract.
local SCHEMAS = {
    {
        type = "object",
        properties = {
            username = { type = "string" },
            password = { type = "string" },
            captchaId = { type = "string" },
            captcha = { type = "string" }
        },
        required = { "username", "password" }
    }
}

-- ---------- helpers ----------

local function ensure_dir(path)
    os.execute(string.format("mkdir -p %q >/dev/null 2>&1", path))
    os.execute(string.format("chmod 700 %q >/dev/null 2>&1", path))
end

local function read_kv(path)
    local f = io.open(path, "r")
    if not f then return nil end
    local kv = {}
    for line in f:lines() do
        local k, v = line:match("^([%w_]+)=(.*)$")
        if k then kv[k] = v end
    end
    f:close()
    return kv
end

local function write_kv(path, kv)
    local f = io.open(path, "w")
    if not f then return false end
    for k, v in pairs(kv) do
        f:write(k, "=", tostring(v), "\n")
    end
    f:close()
    os.execute(string.format("chmod 600 %q >/dev/null 2>&1", path))
    return true
end

local function sanitize_key(s)
    s = tostring(s or "unknown")
    -- keep it filename-safe
    s = s:gsub("[^%w%._%-@]", "_")
    return s
end

local function trim(s)
    if type(s) ~= "string" then
        return nil
    end
    local v = s:match("^%s*(.-)%s*$")
    if v == "" then
        return nil
    end
    return v
end

local function first_xff_ip(xff)
    local v = trim(xff)
    if not v then
        return nil
    end
    local first = v:match("^([^,]+)")
    return trim(first)
end

local function get_remote_ip(req_ctx)
    if type(req_ctx) == "table" then
        local ctx_ip = trim(req_ctx.remote_addr)
            or trim(req_ctx.remoteAddr)
            or trim(req_ctx.client_ip)
            or trim(req_ctx.clientIp)
            or trim(req_ctx.ip)
            or trim(req_ctx.source_ip)
            or trim(req_ctx.sourceIp)
            or trim(req_ctx.HTTP_X_REAL_IP)
            or first_xff_ip(req_ctx.HTTP_X_FORWARDED_FOR)
            or trim(req_ctx.x_real_ip)
            or first_xff_ip(req_ctx.x_forwarded_for)
            or trim(req_ctx.REMOTE_ADDR)
        if ctx_ip then
            return ctx_ip
        end
    end

    local env_ip = trim(os.getenv("REMOTE_ADDR"))
        or trim(os.getenv("HTTP_X_REAL_IP"))
        or first_xff_ip(os.getenv("HTTP_X_FORWARDED_FOR"))
    return env_ip or "unknown"
end

local function sh_quote(s)
    return "'" .. tostring(s or ""):gsub("'", "'\\''") .. "'"
end

local function log_field(s)
    s = tostring(s or "")
    s = s:gsub("[\r\n\t]", " "):gsub("%s+", "_")
    if s == "" then
        return "-"
    end
    return s
end

local function audit_login(result, username, ip, reason, fail_count, lock_until)
    local msg = table.concat({
        "WEB_LOGIN_AUDIT",
        "result=" .. log_field(result),
        "user=" .. log_field(username),
        "interface=WebUI",
        "ip=" .. log_field(ip),
        "reason=" .. log_field(reason),
        "fail_count=" .. tostring(tonumber(fail_count) or 0),
        "lock_until=" .. tostring(tonumber(lock_until) or 0)
    }, " ")
    os.execute("logger -t webui-audit " .. sh_quote(msg) .. " >/dev/null 2>&1")
end

local function normalize_user_path(path)
    if type(path) ~= "string" or path == "" then
        return nil
    end
    if path:sub(-1) ~= "." then
        return path .. "."
    end
    return path
end

local function to_number_in_range(raw, min_v, max_v, default_v)
    local n = tonumber(raw)
    if not n then
        return default_v
    end
    if n < min_v or n > max_v then
        return default_v
    end
    return n
end

local function get_user_lock_policy(username)
    local policy = {
        max_fails = DEFAULT_MAX_FAILS, -- 0 => no lock limit
        lock_sec = DEFAULT_LOCK_SEC    -- 0 => no lock duration
    }

    if type(username) ~= "string" or username == "" then
        return policy
    end

    local user_path = utils.get_path_from_name(USERS_PATH .. "User.", "Username", username)
    user_path = normalize_user_path(user_path)
    if not user_path then
        return policy
    end

    local max_fails_raw = utils.get_name_from_path(user_path, POLICY_MAX_FAILS)
    if max_fails_raw == nil then
        max_fails_raw = utils.get_name_from_path(user_path, POLICY_MAX_FAILS_LEGACY)
    end
    policy.max_fails = to_number_in_range(max_fails_raw, 0, 5, DEFAULT_MAX_FAILS)

    local lock_min_raw = utils.get_name_from_path(user_path, POLICY_LOCK_MIN)
    if lock_min_raw == nil then
        lock_min_raw = utils.get_name_from_path(user_path, POLICY_LOCK_MIN_LEGACY)
    end
    local lock_min = to_number_in_range(lock_min_raw, 0, 90, math.floor(DEFAULT_LOCK_SEC / 60))
    policy.lock_sec = lock_min * 60

    return policy
end

-- ---------- credentials verify ----------

local function parse_status_from_table(ret)
    if not ret then
        return nil
    end
    if type(ret) == "table" and ret.Status then
        return ret.Status
    end
    if type(ret) == "table" and type(ret[1]) == "table" and ret[1].Status then
        return ret[1].Status
    end
    return nil
end

local function check_credentials_status(username, password)
    local function shell_try(args)
        local payload = string.format([[ '%s' ]], common.json.encode(args):gsub("'", [["]]))
        local cmd = "ubus -S call Users CheckCredentialsDiagnostics " .. payload
        local f = io.popen(cmd .. " 2>/dev/null")
        if not f then
            return nil
        end
        local out = f:read("*a") or ""
        f:close()

        local found_status = nil
        for line in out:gmatch("[^\r\n]+") do
            local ok, obj = pcall(common.json.decode, line)
            if ok and type(obj) == "table" then
                local st = parse_status_from_table(obj)
                if st then
                    found_status = st
                    break
                end
            end
        end

        if not found_status then
            if out:find("Credentials_Good", 1, true) then
                found_status = "Credentials_Good"
            elseif out:find("Credentials_Bad", 1, true) then
                found_status = "Credentials_Bad_Requested_Password_Incorrect"
            end
        end

        return found_status
    end

    local st = shell_try({
        Username = username or "",
        Password = password or "",
        IsHashed = false
    })
    if not st then
        st = shell_try({
            Username = username or "",
            Password = password or "",
            IsHashed = 0
        })
    end

    return st
end

local function verify_credentials(username, password)
    if not username or username == "" then
        return false, "username_missing"
    end
    if password == nil then
        return false, "password_missing"
    end

    local st = check_credentials_status(username, password)
    if st == "Credentials_Good" then
        return true, st
    end
    if not st then
        return false, "credentials_check_failed"
    end
    return false, st
end

-- ---------- lock logic (captcha + password failures) ----------

local function lock_path(username, ip)
    ensure_dir(LOCK_DIR)
    local key = sanitize_key(username) .. "@" .. sanitize_key(ip)
    return string.format("%s/%s.kv", LOCK_DIR, key)
end

local function get_lock_state(username, ip)
    local path = lock_path(username, ip)
    local kv = read_kv(path)
    if not kv then
        return { fail_count = 0, lock_until = 0, path = path }
    end
    return {
        fail_count = tonumber(kv.fail_count or "0") or 0,
        lock_until = tonumber(kv.lock_until or "0") or 0,
        path = path
    }
end

local function set_lock_state(state)
    return write_kv(state.path, {
        fail_count = state.fail_count or 0,
        lock_until = state.lock_until or 0
    })
end

local function clear_lock(username, ip)
    local path = lock_path(username, ip)
    os.execute(string.format("rm -f %q >/dev/null 2>&1", path))
end

local function bump_fail_and_maybe_lock(username, ip, max_fails, lock_sec)
    local now = os.time()
    local st = get_lock_state(username, ip)

    max_fails = tonumber(max_fails) or DEFAULT_MAX_FAILS
    lock_sec = tonumber(lock_sec) or DEFAULT_LOCK_SEC

    -- if lock expired, reset
    if st.lock_until > 0 and now >= st.lock_until then
        st.fail_count = 0
        st.lock_until = 0
    end

    st.fail_count = (st.fail_count or 0) + 1

    -- 0 means no lock limit.
    -- RetryCount means allowed retries before lock, so lock when fail_count > RetryCount.
    if max_fails > 0 and st.fail_count > max_fails then
        if lock_sec > 0 then
            st.lock_until = now + lock_sec
        else
            st.lock_until = 0
        end
    elseif max_fails <= 0 then
        st.lock_until = 0
    end

    set_lock_state(st)

    return st
end

-- ---------- captcha verify ----------

local function captcha_kv_path(captcha_id)
    return string.format("%s/%s.kv", CAPTCHA_DIR, sanitize_key(captcha_id))
end

local function verify_captcha(captcha_id, captcha_text)
    if not captcha_id or captcha_id == "" then
        return false, "captcha_id_missing"
    end
    if not captcha_text or captcha_text == "" then
        return false, "captcha_text_missing"
    end

    local path = captcha_kv_path(captcha_id)
    local kv = read_kv(path)
    if not kv then
        return false, "captcha_not_found"
    end

    local now = os.time()
    local expires_at = tonumber(kv.expires_at or "0") or 0
    if expires_at > 0 and now > expires_at then
        return false, "captcha_expired"
    end

    local expected = tostring(kv.code or ""):lower()
    local got = tostring(captcha_text):lower()

    if expected == "" then
        return false, "captcha_bad_state"
    end
    if got ~= expected then
        return false, "captcha_mismatch"
    end

    -- one-time use (optional but recommended)
    os.execute(string.format("rm -f %q >/dev/null 2>&1", path))
    return true, "ok"
end

-- ---------- handlers ----------

local function resolve_captcha_enable()
    local raw = utils.get_name_from_path(GCPE_PATH, "CaptchaEnable")
    if raw == false or raw == 0 or raw == "0" or raw == "false" then
        return 0
    end
    return 1
end

local function get_func()
    local current_lang = utils.get_name_from_path(USERINTERFACE_PATH, "CurrentLanguage") or "en"
    local available_langs = utils.get_name_from_path(USERINTERFACE_PATH, "AvailableLanguages") or "en"

    local lang_list = {}
    for lang in string.gmatch(available_langs, '([^,]+)') do
        table.insert(lang_list, lang)
    end

    return common.json.encode({
        Login = {
            language = {
                current = current_lang,
                available = lang_list
            },
            captchaEnable = resolve_captcha_enable()
        }
    })
end

local function trim(s)
    if type(s) ~= "string" then
        return ""
    end
    return (s:gsub("^%s*(.-)%s*$", "%1"))
end

local function resolve_wizard_required()
    local op_mode_raw = utils.get_name_from_path(GCPE_PATH, "OpMode")
    if op_mode_raw == nil then
        op_mode_raw = utils.get_name_from_path("Device." .. GCPE_PATH, "OpMode")
    end
    local op_mode = trim(tostring(op_mode_raw or ""))
    local op_mode_normalized = op_mode:lower()
    local wizard_required = (op_mode_normalized == "init") and 1 or 0

    return wizard_required, op_mode, op_mode_normalized
end

local function rm_file(path)
    if not path or path == "" then
        return false
    end
    local ok = os.remove(path)
    return ok == true
end

local function post_func(arg, req_ctx)
    if not arg or not utils.args_validator(arg, SCHEMAS) then
        return common.json.encode({ status = "invalid_payload" })
    end

    local username = arg.username
    local password = arg.password
    local captchaId = arg.captchaId or ""
    local captcha = arg.captcha or ""

    if not username or not password then
        return common.json.encode({ status = "invalid_payload" })
    end

    local captcha_enabled = (resolve_captcha_enable() == 1)

    local ip = get_remote_ip(req_ctx)
    local now = os.time()
    local policy = get_user_lock_policy(username)

    local st = get_lock_state(username, ip)
    if st.lock_until and st.lock_until > 0 and now < st.lock_until then
        audit_login("locked", username, ip, "prelocked", st.fail_count, st.lock_until)
        return common.json.encode({
                status = "locked",
                retryAfter = st.lock_until - now,
                lockUntil = st.lock_until
        })
    end

    if captcha_enabled then
        local ok, reason = verify_captcha(captchaId, captcha)
        if not ok then
            local st2 = bump_fail_and_maybe_lock(username, ip, policy.max_fails, policy.lock_sec)
            local retryAfter = 0
            if st2.lock_until and st2.lock_until > 0 and now < st2.lock_until then
                retryAfter = st2.lock_until - now
            end

            if retryAfter > 0 then
                audit_login("locked", username, ip, reason, st2.fail_count, st2.lock_until)
                return common.json.encode({
                        status = "locked",
                        failCount = st2.fail_count,
                        lockUntil = st2.lock_until,
                        retryAfter = retryAfter
                })
            end

            audit_login("captcha_invalid", username, ip, reason, st2.fail_count, st2.lock_until)
            return common.json.encode({
                    status = (reason == "captcha_mismatch" and "captcha_invalid") or reason,
                    failCount = st2.fail_count,
                    locked = (retryAfter > 0),
                    retryAfter = retryAfter
            })
        end

        -- captcha OK -> single-use: remove kv
        rm_file("/tmp/captcha/" .. captchaId .. ".kv")
    end

    local cred_ok, cred_reason = verify_credentials(username, password)
    if not cred_ok then
        -- when credentials check mechanism fails unexpectedly, don't auto-lock user
        if cred_reason == "credentials_check_failed" then
            audit_login("failed", username, ip, cred_reason, 0, 0)
            return common.json.encode({
                    status = "failed",
                    error = cred_reason
            })
        end

        local st3 = bump_fail_and_maybe_lock(username, ip, policy.max_fails, policy.lock_sec)
        local now2 = os.time()
        if st3.lock_until and st3.lock_until > 0 and now2 < st3.lock_until then
            audit_login("locked", username, ip, cred_reason, st3.fail_count, st3.lock_until)
            return common.json.encode({
                    status = "locked",
                    retryAfter = st3.lock_until - now2,
                    lockUntil = st3.lock_until,
                    failCount = st3.fail_count
            })
        end

        audit_login("credentials_invalid", username, ip, cred_reason, st3.fail_count, st3.lock_until)
        return common.json.encode({
                status = "credentials_invalid",
                failCount = st3.fail_count,
                locked = false,
                retryAfter = 0
        })
    end

    clear_lock(username, ip)
    audit_login("ok", username, ip, "login_success", 0, 0)

    local wizard_required, op_mode = resolve_wizard_required()

    return common.json.encode({
            status = "ok",
            next = "/session",
            opMode = op_mode,
            wizardRequired = wizard_required
    })
end


function M.func(arg, req_ctx)
    return utils.with_ubus(function()
        return arg and post_func(arg, req_ctx) or get_func()
    end)
end

return M
