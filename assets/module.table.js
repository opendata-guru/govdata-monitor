var table = (function () {
//    var initvalId = '',
//        defaultId = '';
    var idTableBody = 'supplier-table',
        idTableHeader = 'supplier-table-header',
        idTableFooter = 'supplier-table-footer';
//    var paramId = '';

/*    function init() {
        var params = new URLSearchParams(window.location.search);

        if (params.has(paramId)) {
            initvalId = params.get(paramId);
        } else {
            initvalId = defaultId;
        }
    }*/

/*    function setId(id) {
        initvalId = id;

        if (table) {
            table.id = initvalId;
        }

        var params = new URLSearchParams(window.location.search);
        if (id === defaultId) {
            params.delete(paramId);
        } else {
            params.set(paramId, id);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);
    }*/

    function isParent(packageId, dateObj) {
        if (packageId === catalog.id) {
            return true;
        }

        if (monitor.showFlatPortals) {
            var found = false;
            monitor.data[dateObj].filter(item => item.id === packageId).forEach((row) => {
                if (row.packagesInId) {
                    found |= isParent(row.packagesInId, dateObj);
                }
            });
            return found;
        }

        return false;
    }

    function getParentPath(data, item) {
        var itemParent = data.filter(dataItem => dataItem.id === item.packagesInId);
        if (itemParent.length > 0) {
            var parent = '';
            if (itemParent[0].packagesInId != catalog.id) {
                parent = getParentPath(data, itemParent[0]);
            }
            return ' &larr; ' + itemParent[0].title + parent;
        }

        return ' &larr; ' + item.packagesInId;
    }

    function getRowIcon(type) {
        if (type === 'state') {
            return '<span class="badge bg-secondary me-1">Land</span>';
        } else if (type === 'municipality+state') {
            return '<span class="badge bg-secondary me-1">Land</span>' +
                   '<span class="badge bg-secondary me-1">Stadt</span>';
        } else if (type === 'stateAgency') {
            return '<span class="badge bg-secondary me-1">Landesamt</span>';
        } else if (type === 'municipality') {
            return '<span class="badge bg-secondary me-1">Stadt</span>';
        } else if (type === 'federal') {
            return '<span class="badge bg-secondary me-1">Bund</span>';
        } else if (type === 'collectiveMunicipality') {
            return '<span class="badge bg-warning me-1" title="' + type + '">CM</span>';
        } else if (type === 'regionalNetwork') {
            return '<span class="badge bg-secondary me-1">Region</span>';
        } else if (type === 'statisticaloffice') {
            return '<span class="badge bg-warning me-1" title="' + type + '">O</span>';
        } else if (type === 'portal') {
            return '<span class="badge bg-warning me-1" title="' + type + '">P</span>';
        } else if (type === 'geoPortal') {
            return '<span class="badge bg-warning me-1" title="' + type + '">G</span>';
        } else if (type === 'dumping') {
            return '<span class="badge bg-warning me-1" title="' + type + '">D</span>';
        } else if (type !== '') {
            return '<span class="badge bg-warning me-1" title="' + type + '">?</span>';
        }

        return '';
    }

    function getRow(arrayData, id) {
        var showBadge = arrayData.length === 1;
        var str = '';
        var icon = '';
        var title = '';
        var name = '';
        var assertion = '';
        var lastCount = undefined;
        var maxDiff = 0;

        arrayData.forEach(processData => {
            var data = processData ? processData.filter(item => item.id === id) : [];
            if (data.length > 0) {
                var currentCount = parseInt(data[0].packages ? data[0].packages : 0, 10);
                var addClass = '';
                title = data[0].title ? data[0].title : title;
                name = data[0].name ? data[0].name : name;

                if (data[0].datasetCountDuration) {
                    title = '<a href="#" onclick="catalog.set(\'' + id + '\')">' + title + '</a>';
                }
                if (data[0].packagesInId != catalog.id) {
                    title += ' <span class="small text-info">' + getParentPath(processData, data[0]) + '</span>';
                }

                icon = getRowIcon(data[0].type);

                if (lastCount) {
                    var difference = Math.abs(lastCount - currentCount);
                    maxDiff = Math.max(maxDiff, difference);
                    if (diff.highlight && (difference >= diff.threshold)) {
                        addClass = ' bg-warning';
                    }
                }
                str += '<td class="text-end' + addClass + '">' + monitorFormatNumber(data[0].packages ? data[0].packages : 0) + '</td>';

                if (showBadge) {
                    if (data[0].datasetCount) {
                        str += '<td class="text-end"><span class="badge bg-info">' + monitorFormatNumber(data[0].datasetCount) + '</span></td>';
                    } else {
                        str += '<td></td>';
                    }
                }
                if (data.length > 1) {
                    assertion += '<span class="badge bg-danger">' + data.length + '</span>';
                }
                lastCount = currentCount;
            } else {
                str += '<td class="text-end">-</td>';
                if (showBadge) {
                    str += '<td></td>';
                }
                lastCount = 0;
            }
        });

        if (diff.hideEqual && (arrayData.length > 1) && (maxDiff < diff.threshold)) {
            return '';
        }

        str = '<td><span title="' + name + '">' + icon + title + assertion + '</span></td>' + str;

        return '<tr>' + str + '</tr>';
    }

    function funcUpdate() {
        var arrayData = [];
        var arrayIds = [];
        var header = '';
        var footer = '';
        var body = '';

        header += '<th>Data Supplier</th>';
        for (d = 0; d < date.selection.length; ++d) {
            arrayData.push(monitor.data[date.selection[d]]);
            header += '<th>' + date.selection[d] + '</th>';
    
            if (arrayData[arrayData.length - 1]) {
                arrayData[arrayData.length - 1].forEach((row) => {
                    if (isParent(row.packagesInId ? row.packagesInId : '', date.selection[d])) {
                        if (arrayIds.indexOf(row.id) < 0) {
                            arrayIds.push(row.id);
                        }
                    }
                });
            }
        }
        if (arrayData.length === 1) {
            header += '<th>In source portal</th>';
        }

        if (arrayIds.length > 0) {
            arrayIds.forEach((id) => body += getRow(arrayData, id));
            footer += '<th>' + arrayIds.length + ' data suppliers</th>';
        } else {
            body += '<tr><td>No data available</td></tr>';
            footer += '<th></th>';
        }

        header = '<tr>' + header + '</tr>';
        footer = '<tr>' + footer + '</tr>';

        document.getElementById(idTableHeader).innerHTML = header;
        document.getElementById(idTableFooter).innerHTML = footer;
        document.getElementById(idTableBody).innerHTML = body;

        monitorUpdateCatalogPieChart();
        monitorUpdateCatalogHistoryChart();
    }

//    init();

    return {
//        id: initvalId,
//        set: funcSet,
        update: funcUpdate,
    };
}());