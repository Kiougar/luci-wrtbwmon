module("luci.controller.wrtbwmon", package.seeall)

function index()
    entry({"admin", "network", "usage"}, template("wrtbwmon"), "Usage").dependent=true
    entry({"admin", "network", "usage", "usage_data"}, call("usage_data")).dependent=true
    entry({"admin", "network", "usage_data"}, call("usage_data")).dependent=true
    entry({"admin", "network", "usage", "usage_reset"}, call("usage_reset")).dependent=true
    entry({"admin", "network", "usage_reset"}, call("usage_reset")).dependent=true
    entry({"admin", "network", "usage_config"}, cbi("wrtbwmon"), "Usage Config").dependent=true
end

function usage_database_path()
    local cursor = luci.model.uci.cursor()
    if cursor:get("wrtbwmon", "general", "persist") == "1" then
        return "/etc/config/usage.db"
    else
        return "/tmp/usage.db"
    end
end

function usage_data()
    local db = usage_database_path()
    local cmd = "wrtbwmon update " .. db .. " && wrtbwmon publish " .. db .. " /tmp/usage.htm && cat /tmp/usage.htm"
    luci.http.prepare_content("text/html")
    luci.http.write(luci.sys.exec(cmd))
end

function usage_reset()
    local db = usage_database_path()
    local ret = luci.sys.call("wrtbwmon update " .. db .. " && rm " .. db)
    luci.http.status(204)
end