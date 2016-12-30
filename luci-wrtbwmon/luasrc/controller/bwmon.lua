module("luci.controller.bwmon", package.seeall)

function index()
    entry({"admin", "network", "usage"}, template("bwmon"), "Usage").dependent=true
    entry({"admin", "network", "usage_data"}, call("usage_data")).dependent=true
end

function usage_data()
    luci.http.prepare_content("text/html")
    luci.http.write(luci.sys.exec("wrtbwmon update /tmp/usage.db && wrtbwmon publish /tmp/usage.db /tmp/usage.htm && cat /tmp/usage.htm"))
end
