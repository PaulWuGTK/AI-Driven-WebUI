#!/usr/bin/env lua
--
-- fcgi_control.lua  (webui-generic)
--
-- FastCGI entry point for the webui-generic REST API.
--
-- Installed at: /usr/lib/lua/webui-generic/fcgi_control.lua
-- Lighttpd routes /API вк this process via Unix socket.
--

-- Add our own directory and prpl/ sub-directory to the module search path.
-- This must come before any require() calls.
local INSTALL_DIR = "/usr/lib/lua/webui-generic/"
package.path = INSTALL_DIR .. "?.lua;"
            .. INSTALL_DIR .. "?/init.lua;"
            .. INSTALL_DIR .. "prpl/?.lua;"
            .. package.path

local fcgi    = require("fcgi")
local runtime = require("runtime")
local lamx    = require("lamx")

-- Debug mode
local DEBUG = false
local function dprint(msg)
    if DEBUG then
        print(msg)
    end
end

-- Constants
local BUFFER_LEN = 8192
local DM_SESSION_CHECK_METHOD = "CheckSessionValid"
local DM_HTTPACCESS_ROOT = "Device.UserInterface.HTTPAccess."
local DM_SESSION_CHECK_FALLBACK_PATHS = {
    "Device.UserInterface.HTTPAccess.LocalGUI.",
    "Device.UserInterface.HTTPAccess.LocalGUIHttps.",
    "Device.UserInterface.HTTPAccess.RemoteGUI.",
}
local HTTPACCESS_CACHE_TTL_SEC = 5
local HTTPACCESS_CACHE = {
    ts = 0,
    enabled_paths = nil,
}


-- Utility: Check if a string has a valid item
local function extract_item(path_info)
    if not path_info or path_info == "" then
        dprint("Error: PATH_INFO is not a valid string!")
        return nil
    end

    local items = {}
    for word in string.gmatch(path_info, '[^%p*]+') do
        table.insert(items, word)
    end

    for _, item in ipairs(items) do
        if item == "info" then
            return "info"
        elseif item == "dm" then
            return "dm"
        else
            dprint("Unknown item: " .. item)
        end
    end

    return nil
end


-- Utility: Check if a file exists
local function file_exists(filepath)
    local file = io.open(filepath, "r")
    if file then
        file:close()
        return true
    end
    return false
end

local function extract_bearer_token(raw_auth)
    if type(raw_auth) ~= "string" or raw_auth == "" then
        return ""
    end

    local token = raw_auth:match("^[Bb]earer%s+(.+)$")
    if token and token ~= "" then
        return token
    end

    return ""
end

local function parse_query_param(query_string, key)
    if type(query_string) ~= "string" or query_string == "" then
        return nil
    end

    local pattern = key .. "=([^&]+)"
    local value = query_string:match(pattern)
    if value and value ~= "" then
        return value
    end
    return nil
end

local function trim(s)
    if type(s) ~= "string" then
        return s
    end
    return s:match("^%s*(.-)%s*$")
end

local function bool01(v)
    return v == 1 or v == true or v == "1" or v == "true"
end

local function normalize_httpaccess_path(path)
    if type(path) ~= "string" then
        return nil
    end

    path = trim(path)
    if not path or path == "" then
        return nil
    end

    if path:sub(-1) ~= "." then
        path = path .. "."
    end

    if path:match("^Device%.UserInterface%.HTTPAccess%.[%w_%-]+%.$") then
        return path
    end

    if path:match("^UserInterface%.HTTPAccess%.[%w_%-]+%.$") then
        return "Device." .. path
    end

    if path:match("^[%w_%-]+%.$") then
        return DM_HTTPACCESS_ROOT .. path:gsub("%.$", "") .. "."
    end

    if path:match("^[%w_%-]+$") then
        return DM_HTTPACCESS_ROOT .. path .. "."
    end

    return nil
end

local function get_httpaccess_path_hint()
    local keys = {
        "HTTP_HTTPACCESSPATH",
        "HTTP_X_HTTPACCESSPATH",
        "HTTP_X_PRPLWARE_COM_HTTPACCESSPATH",
        "HTTPACCESSPATH",
    }

    for _, key in ipairs(keys) do
        local raw = fcgi.getParam(key)
        local path = normalize_httpaccess_path(raw)
        if path then
            return path
        end
    end

    return nil
end

local function get_enabled_httpaccess_paths()
    local now = os.time() or 0
    if HTTPACCESS_CACHE.enabled_paths and (now - HTTPACCESS_CACHE.ts) < HTTPACCESS_CACHE_TTL_SEC then
        return HTTPACCESS_CACHE.enabled_paths
    end

    local enabled_paths = {}
    local success, data = pcall(lamx.bus.get, DM_HTTPACCESS_ROOT, 0)
    if success and type(data) == "table" then
        for object_path, info in pairs(data) do
            if type(object_path) == "string"
                and type(info) == "table"
                and object_path:match("^Device%.UserInterface%.HTTPAccess%.[%w_%-]+%.$")
                and bool01(info.Enable) then
                table.insert(enabled_paths, object_path)
            end
        end
    end

    if #enabled_paths == 0 then
        for _, path in ipairs(DM_SESSION_CHECK_FALLBACK_PATHS) do
            table.insert(enabled_paths, path)
        end
    end

    HTTPACCESS_CACHE.ts = now
    HTTPACCESS_CACHE.enabled_paths = enabled_paths
    return enabled_paths
end

local function build_session_check_paths(httpaccess_hint)
    local paths = {}
    local seen = {}

    local function push(path)
        if type(path) == "string" and path ~= "" and not seen[path] then
            seen[path] = true
            table.insert(paths, path)
        end
    end

    push(normalize_httpaccess_path(httpaccess_hint))

    for _, path in ipairs(get_enabled_httpaccess_paths()) do
        push(path)
    end

    return paths
end

local function is_public_api_request(action, item, query_string)
    if item ~= "info" then
        return false
    end

    local list_name = parse_query_param(query_string, "list")
    if not list_name then
        return false
    end

    if action == "GET" and list_name == "LoginCaptcha" then
        return true
    end

    if action == "GET" and list_name == "Login" then
        return true
    end

    if action == "POST" and list_name == "Login" then
        return true
    end

    return false
end

-- Utility: Validate session ID
local function validate_session(session_id, remote_addr, httpaccess_hint)
    lamx.backend.load("/usr/bin/mods/amxb/mod-amxb-ubus.so")
    lamx.bus.open("ubus:/var/run/ubus/ubus.sock")

    local force_valid_file = "/tmp/force_valid_session"
    if file_exists(force_valid_file) then
        dprint("Force valid session triggered by file: " .. force_valid_file)
        lamx.backend.remove("ubus")
        return 1
    end

    local check_paths = build_session_check_paths(httpaccess_hint)
    for _, path in ipairs(check_paths) do
        local success, ret = pcall(lamx.bus.call, path, DM_SESSION_CHECK_METHOD,
                {id = session_id, ip = remote_addr})

        if success and ret and ret[1] == 1 then
            dprint("Session valid on path: " .. path)
            lamx.backend.remove("ubus")
            return 1
        end

        if not success then
            dprint("Session check call failed on path: " .. path)
        end
    end

    lamx.backend.remove("ubus")
    return 0
end


-- Utility: Check if the request is from the same site
local function is_same_site(http_referer, http_host, http_origin, server_name)
    if http_referer and http_host and string.find(http_referer, http_host, 1, true) then
        return true
    elseif http_origin and server_name and string.find(http_origin, server_name, 1, true) then
        return true
    end
    return false
end


-- Handle GET requests
local function handle_get(item, query_string, req_ctx)
    if not query_string then
        print("Error: Missing QUERY_STRING for GET request.")
        return ""
    end

    if item == "info" then
        return runtime.merge_infolistjson(query_string, req_ctx)
    elseif item == "dm" then
        return runtime.merge_dmlistjson(query_string)
    else
        dprint("Error: Unknown GET item: " .. tostring(item))
        return ""
    end
end


-- Handle POST requests
local function handle_post(item, buffer_len, content_length, getline, is_same_origin, req_ctx)
    if not content_length or content_length == 0 then
        print("Error: Missing HTTP_CONTENT_LENGTH for POST request.")
        return '{"api_return":400,"error":"Bad Request"}'
    end

    dprint("Content length: " .. content_length)

    local post_data = ""
    local remaining = tonumber(content_length) or 0
    if remaining <= 0 then
        print("Error: Invalid content_length: " .. tostring(content_length))
        return '{"api_return":400,"error":"Invalid content_length"}'
    end

    while remaining > 0 do
        local chunk = getline(buffer_len)
        if not chunk or chunk == "" then 
            print("Error: getline() returned empty string, breaking loop")
            break
        end  

        post_data = post_data .. chunk
        remaining = remaining - #chunk

        if remaining <= 0 then
            break
        end
    end

    if post_data == "" then
        print("Error: Empty POST data")
        return '{"api_return":400,"error":"Empty POST data"}'
    end

    if post_data and is_same_origin then
        if item == "info" then
            return runtime.exeparam(post_data, req_ctx)
        else
            print("Error: Unknown POST item: " .. tostring(item))
        end
    else
        print("Error: Unable to process POST data.")
        fcgi.putStr('Status: 400 Bad Request\n')
        return '{"api_return":400,"error":"Bad Request"}'
    end

    return ""
end

-- Main server loop
dprint('Starting FastCGI server...')
while fcgi.accept() == 0 do
    --Show env code
    --[[local envtable = fcgi.getEnv()
    PrintTable(envtable) ]]

    local action = fcgi.getParam("REQUEST_METHOD")
    local item = extract_item(fcgi.getParam("PATH_INFO"))
    dprint("[Action, Item]: [" .. tostring(action) .. ", " .. tostring(item) .. "]")

    local server_name = fcgi.getParam("SERVER_NAME")
    local http_origin = fcgi.getParam("HTTP_ORIGIN")
    local http_referer = fcgi.getParam("HTTP_REFERER")
    local http_host = fcgi.getParam("HTTP_HOST")
    local remote_addr = fcgi.getParam("REMOTE_ADDR")
    local query_string = fcgi.getParam("QUERY_STRING") or ""
    local raw_authorization = fcgi.getParam("HTTP_AUTHORIZATION") or ""
    local httpaccess_hint = get_httpaccess_path_hint()
    local session_id = extract_bearer_token(raw_authorization)
    local req_ctx = {
        session_id = session_id,
        remote_addr = remote_addr,
        request_method = action or "",
    }

    local force_valid_session = file_exists("/tmp/force_valid_session")
    local valid_session = force_valid_session or ((session_id ~= "") and (validate_session(session_id, remote_addr, httpaccess_hint) == 1))
    local public_request = is_public_api_request(action, item, query_string)
    local same_site = is_same_site(http_referer, http_host, http_origin, server_name)

    if (not valid_session) and (not public_request) then
        dprint("Invalid session ID.")
        fcgi.putStr("Status: 403 Forbidden\r\n")
        fcgi.putStr("\r\n")
        fcgi.putStr("<html><body><h1>403 Forbidden</h1></body></html>")
        fcgi.finish()
    else
        local retstr
        if action == "GET" then
            retstr = handle_get(item, query_string, req_ctx)
        elseif action == "POST" then
            retstr = handle_post(item, BUFFER_LEN, fcgi.getParam("HTTP_CONTENT_LENGTH"), fcgi.getLine, same_site, req_ctx)
        else
            print("Error: Unsupported action: " .. tostring(action))
            fcgi.putStr("Status: 405 Method Not Allowed\r\n")
            retstr = '{"api_return":405,"error":"Method Not Allowed"}'
        end

        -- Respond to the client
        fcgi.putStr("Content-Type: application/json\n\n")
        fcgi.putStr(retstr)
        fcgi.finish()
    end
end

dprint("Server shutting down...")
