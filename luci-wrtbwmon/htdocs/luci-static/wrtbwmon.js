// interval in seconds
var scheduleTimeout, updateTimeout, isScheduled = true, interval = 5;
var sortedColumn = 7, sortedEltId = "thTotal", sortDirection = "desc";
var perHostTotals = false, showPerHostTotalsOnly = false;

(function () {
    var oldDate, oldValues = [];

    function getSize(size) {
        var prefix = [' ', 'k', 'M', 'G', 'T', 'P', 'E', 'Z'];
        var precision, base = 1000, pos = 0;
        while (size > base) {
            size /= base;
            pos++;
        }
        if (pos > 2) precision = 1000; else precision = 1;
        return (Math.round(size * precision) / precision) + ' ' + prefix[pos] + 'B';
    }

    function dateToString(date) {
        return date.toString().substring(0, 24);
    }

    function getDateString(value) {
        var tmp = value.split('_'),
            str = tmp[0].split('-').reverse().join('-') + 'T' + tmp[1];
        return dateToString(new Date(str));
    }

    function isArray(obj) {
        return obj instanceof Array;
    }

    function handleError() {
        // TODO handle errors
        // var message = 'Something went wrong...';
    }

    function handleValues(values) {
        if (!isArray(values)) return '';

        // find data
        var data = [], totals = [0, 0, 0, 0, 0];
        for (var i = 0; i < values.length; i++) {
            var d = handleRow(values[i]);
            if (d[1]) {
                data.push(d);
                // get totals
                for (var j = 0; j < totals.length; j++) {
                    totals[j] += d[1][3 + j];
                }
            }
        }

        // aggregate (sub-total) by hostname (or MAC address) after the global totals are computed, before sort and display
        if (perHostTotals) {
            var curHost = 0, insertAt = 1;
            while (curHost < data.length && insertAt < data.length) {
                // grab the current hostname/mac, and walk the data looking for rows with the same host/mac
                var hostName = data[curHost][1][0].toLowerCase();
                for (var k = curHost+1; k < data.length; k++) {
                    if (data[k][1][0].toLowerCase() == hostName) {
                        // this is another row for the same host, group it with any other rows for this host
                        data.splice(insertAt, 0, data.splice(k, 1)[0]);
                        insertAt++;
                    }
                }

                // if we found more than one row for the host, add a subtotal row
                if (insertAt > curHost+1) {
                    var hostTotals = [data[curHost][1][0], '', '', 0, 0, 0, 0, 0];
                    for (var i = curHost; i < insertAt && i < data.length; i++) {
                        for (var j = 3; j < hostTotals.length; j++) {
                            hostTotals[j] += data[i][1][j];
                        }
                    }
                    var hostTotalRow = '<tr><th title="' + data[curHost][1][1] + '">' + data[curHost][1][0] + '<br/> (host total) </th>';
                    for (var m = 3; m < hostTotals.length; m++) {
                        var t = hostTotals[m];
                        hostTotalRow += '<td align="right">' + getSize(t) + (m < 5 ? '/s' : '') + '</td>'
                    }
                    hostTotalRow += '</tr>';
                    data.splice(insertAt, 0, [hostTotalRow, hostTotals]);
                }
                curHost = insertAt;
                insertAt = curHost+1;
            }
        }

        data.sort(function (x, y) {
            var a = x[1][sortedColumn];
            var b = y[1][sortedColumn];
            if (sortDirection == "desc") {
                    if (a < b) return 1;
                    if (a > b) return -1;
                    return 0;
            } else {
                    if (a > b) return 1;
                    if (a < b) return -1;
                    return 0;
            }
        });

        // display data
        var result = '<tr>\
                            <th id="thClient">Client</th>\
                            <th id="thDownload">Download</th>\
                            <th id="thUpload">Upload</th>\
                            <th id="thTotalDown">Total Down</th>\
                            <th id="thTotalUp">Total Up</th>\
                            <th id="thTotal">Total</th>\
                            <th id="thFirstSeen">First Seen</th>\
                            <th id="thLastSeen">Last Seen</th>\
                          </tr>';
        for (var k = 0; k < data.length; k++) {
            result += data[k][0];
        }
        result += '<tr><th>TOTAL</th>';
        for (var m = 0; m < totals.length; m++) {
            var t = totals[m];
            result += '<td align="right">' + getSize(t) + (m < 2 ? '/s' : '') + '</td>'
        }
        result += '</tr>';
        return result;

        function handleRow(data) {
            // check if data is array
            if (!isArray(data)) return [''];

            // find old data
            var oldData;
            for (var i = 0; i < oldValues.length; i++) {
                var cur = oldValues[i];
                // compare mac addresses and ip addresses
                if (oldValues[i][1] === data[1] && oldValues[i][2] === data[2]) {
                    oldData = cur;
                    break;
                }
            }

            // find download and upload speeds
            var dlSpeed = 0, upSpeed = 0;
            if (oldData) {
                var now = new Date(),
                    seconds = (now - oldDate) / 1000;
                dlSpeed = (data[3] - oldData[3]) / seconds;
                upSpeed = (data[4] - oldData[4]) / seconds;
            }

            // create rowData
            var rowData = [];
            for (var j = 0; j < data.length; j++) {
                rowData.push(data[j]);
                if (j === 2) {
                    rowData.push(dlSpeed, upSpeed);
                }
            }

            // create displayData
            var displayData = [
                '<td title="' + data[1] + '">' + data[0] + '<br />' + data[2] + '</td>',
                '<td align="right">' + getSize(dlSpeed) + '/s</td>',
                '<td align="right">' + getSize(upSpeed) + '/s</td>',
                '<td align="right">' + getSize(data[3]) + '</td>',
                '<td align="right">' + getSize(data[4]) + '</td>',
                '<td align="right">' + getSize(data[5]) + '</td>',
                '<td>' + getDateString(data[6]) + '</td>',
                '<td>' + getDateString(data[7]) + '</td>'
            ];

            // display row data
            var result = '<tr>';
            for (var k = 0; k < displayData.length; k++) {
                result += displayData[k];
            }
            result += '</tr>';
            return [result, rowData];
        }
    }

    function registerTableEventHandlers() {
        // note these ordinals are into the data array, not the table output
        document.getElementById('thClient').addEventListener('click', function () {
            setSortColumn(this.id, 0, true); // hostname
        });
        document.getElementById('thDownload').addEventListener('click', function () {
            setSortColumn(this.id, 3, true); // dlspeed
        });
        document.getElementById('thUpload').addEventListener('click', function () {
            setSortColumn(this.id, 4, true); // ulspeed
        });
        document.getElementById('thTotalDown').addEventListener('click', function () {
            setSortColumn(this.id, 5, true); // total down
        });
        document.getElementById('thTotalUp').addEventListener('click', function () {
            setSortColumn(this.id, 6, true); // total up
        });
        document.getElementById('thTotal').addEventListener('click', function () {
            setSortColumn(this.id, 7, true); // total
        });
    }

    function receiveData(once) {
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var re = /(var values = new Array[^;]*;)/,
                    match = ajax.responseText.match(re);
                if (!match) {
                    handleError();
                } else {
                    // evaluate values
                    eval(match[1]);
                    //noinspection JSUnresolvedVariable
                    var v = values;
                    if (!v) {
                        handleError();
                    } else {
                        document.getElementById('tableBody').innerHTML = handleValues(v);
                        setSortColumn(null, null, false);
                        // set old values
                        oldValues = v;
                        // set old date
                        oldDate = new Date();
                        document.getElementById('updated').innerHTML = 'Last updated ' + dateToString(oldDate);
                    }
                }
                if (!once && interval > 0) reschedule(interval);
            }
        };
        ajax.open('GET', 'usage_data', true);
        ajax.send();
    }

    document.getElementById('intervalSelect').addEventListener('change', function () {
        interval = this.value;
        if (interval > 0) {
            // it is not scheduled, schedule it
            if (!isScheduled) {
                reschedule(interval);
            }
        } else {
            // stop the scheduling
            stopSchedule();
        }
    });

    document.getElementById('resetDatabase').addEventListener('click', function () {
        if (confirm('This will delete the database file. Are you sure?')) {
            var ajax = new XMLHttpRequest();
            ajax.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 204) {
                    location.reload();
                }
            };
            ajax.open('GET', 'usage_reset', true);
            ajax.send();
        }
    });

    document.getElementById('perHostTotals').addEventListener('change', function () {
        perHostTotals = !perHostTotals;
    });

    //document.getElementById('showPerHostTotalsOnly').addEventListener('change', function () {
    //    showPerHostTotalsOnly = !showPerHostTotalsOnly;
    //});


    function stopSchedule() {
        window.clearTimeout(scheduleTimeout);
        window.clearTimeout(updateTimeout);
        setUpdateMessage('');
        isScheduled = false;
    }

    function reschedule(seconds) {
        isScheduled = true;
        seconds = seconds || 60;
        updateSeconds(seconds);
        scheduleTimeout = window.setTimeout(receiveData, seconds * 1000);
    }

    function setUpdateMessage(msg) {
        document.getElementById('updating').innerHTML = msg;
    }

    function updateSeconds(start) {
        setUpdateMessage('Updating again in <b>' + start + '</b> seconds.');
        if (start > 0) {
            updateTimeout = window.setTimeout(function () {
                updateSeconds(start - 1);
            }, 1000);
        }
    }

    function setSortColumn(eltid, col, do_sort = false) {
        if (col != null && col == sortedColumn) {
            if (sortDirection == "desc")
                sortDirection = "asc";
            else
                sortDirection = "desc";
        } else {
            sortDirection = "desc";
        }
        sortedColumn = col != null ? col : sortedColumn;
        sortedEltId = eltid ? eltid : sortedEltId;
        if (do_sort)
            document.getElementById('tableBody').innerHTML = handleValues(oldValues);
        e = document.getElementById(sortedEltId);
        if (e)
            e.innerHTML = e.innerHTML + (sortDirection == "asc" ? "&#x25B2" : "&#x25BC");
        registerTableEventHandlers();
    }

    receiveData();

})();
