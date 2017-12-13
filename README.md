# Bandwidth tracker for OpenWRT [![Build Status](https://travis-ci.org/Kiougar/luci-wrtbwmon.svg?branch=master)](https://travis-ci.org/Kiougar/luci-wrtbwmon)

This Luci module uses [wrtbwmon](https://github.com/pyrovski/wrtbwmon) to track bandwidth usage.

##### Features
* **Auto refresh** every 5 seconds (can be changed)
* Track **speed per client** (if auto refresh is enabled)
* **No cron job** required (wrtbwmon is updated on demand)
* **Map MAC addresses to usernames** by editing a file from the UI.
* Ability to **persist database** across reboots and firmware updates

After installation you will see a new `Usage` menu item inside the `Network` menu list in the Luci GUI.

![Network Usage](https://github.com/Kiougar/luci-wrtbwmon/blob/master/screenshot.png?raw=true)

##### What it does

It displays a table that includes all columns **wrtbwmon** provides, 
with two additional ones (emphasis given):

1. Client
2. **Download speed**
3. **Upload speed**
4. Total downloaded
5. Total uploaded
6. Total usage
7. First seen date
8. Last seen date

##### How it works

The download/upload speed is calculated in memory on the **front end** using JS
thus **minimizing resource consumption** on the router. To properly calculate these values
an auto refresh interval must be set that runs the following commands on the router:

* `wrtbwmon update /tmp/usage.db`
* `wrtbwmon publish /tmp/usage.db /tmp/usage.htm /etc/wrtbwmon.user`

For the above commands to work the only *requirement* is that the `wrtbwmon` package is installed and enabled.

## Install

##### Step 1 - install the `wrtbwmon` package:

* Download the latest `.ipk` file from [wrtbwmon releases](https://github.com/pyrovski/wrtbwmon/releases)
* Copy the file to your router `/tmp` directory 
    * I use the following command: `scp wrtbwmon_*_all.ipk root@192.168.1.1:/tmp/`
* Install the package `opkg install /tmp/wrtbwmon_*_all.ipk`
        
##### Step 2 - setup* the `wrtbwmon` package:

* Schedule it to run on startup `/etc/init.d/wrtbwmon enable`
* Manually start it now `/etc/init.d/wrtbwmon start`

**If you have already setup a `cron job` to update the `wrtbwmon` database, it would be best if you removed it.
There is no need for `wrtbwmon` to regurarly update the db since we only need to run it when the `Usage` page is active.*

##### Step 3 - install this module:

* Download the latest `.ipk` file from [releases](https://github.com/Kiougar/luci-wrtbwmon/releases)
* Copy the file to your router `/tmp` directory
    * I use the following command: `scp luci_wrtbwmon_*_all.ipk root@192.168.1.1:/tmp/`
* Install the package `opkg install /tmp/luci_wrtbwmon_*_all.ipk`
* Clear the cache for `luci` to get the web interface to refresh `rm /tmp/luci-indexcache`

## TODO

* Add the `.ipk` package to the `OpenWRT` feed

## Contribute

Feel free to contribute on any of the above TODO items, or even on any feature you might think is helpful. 
I would appreciate any help.

## Credits

A big thanks to
* [pyrovski](https://github.com/pyrovski) for creating `wrtbwmon` and helping me with creating the `.ipk` package
* [OpenWRT](https://github.com/OpenWRT) organization for creating and maintaining `openwrt` and `luci`
* Carl Worth <cworth@east.isi.edu> for his `ipkg-build` script that lies in this repo
