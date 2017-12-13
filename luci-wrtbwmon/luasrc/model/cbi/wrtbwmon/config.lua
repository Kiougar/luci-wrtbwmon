local m = Map("wrtbwmon", "Usage - Configuration")

local s = m:section(NamedSection, "general", "wrtbwmon", "General settings")

local o = s:option(Flag, "persist", "Persist database",
    "Check this to persist the database file under /etc/config. "
    .. "This ensures usage is persisted even across firmware updates.")
o.rmempty = false

function o.write(self, section, value)
    if value == '1' then
        luci.sys.call("mv /tmp/usage.db /etc/config/usage.db")
    elseif value == '0' then
        luci.sys.call("mv /etc/config/usage.db /tmp/usage.db")
    end
    return Flag.write(self, section ,value)
end

return m
