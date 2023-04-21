var table = (function () {
    var initvalFlatten = false,
        defaultFlatten = false,
        initvalClass = 'all',
        defaultClass = 'all',
        classMap = [];
    var idTableBody = 'supplier-table',
        idTableHeader = 'supplier-table-header',
        idTableFooter = 'supplier-table-footer',
        idIndicator = 'table-indicator',
        idMenu = 'table-menu',
        idReset = 'table-reset',
        idFlatten = 'checkbox-flatten',
        classClass = 'classes',
        classAll = 'all';
    var paramFlatten = 'flatten',
        paramClass = 'class';

    classMap['country'] = 'Staat';
    classMap['federal'] = 'Bund';
    classMap['state'] = 'Land';
    classMap['stateAgency'] = 'Landesamt';
    classMap['regionalNetwork'] = 'Region';
    classMap['municipality'] = 'Stadt';
    classMap['council'] = 'Rat';

    function getCheckIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check align-middle" style="margin:0 .2rem 0 -.2rem"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    }

    function install() {
        var html = '';
        var style = 'line-height:1.2rem;padding:.2rem .6rem;cursor:pointer;margin-top:.2rem';

        html += '<div class="list-group" style="padding: .5rem 1rem 0 1rem">';
        html += '  <label class="form-check">';
        html += '    <input id="' + idFlatten + '" class="form-check-input" value="" type="checkbox">';
        html += '    <span class="form-check-label">';
        html += '      Flatten all portals';
        html += '    </span>';
        html += '  </label>';
        html += '</div>';

        html += '<div class="dropdown-divider"></div>';

        html += '<div class="list-group" style="padding: 0 1rem">';
        html += '  <div>';
        html += '    Classes:';
        html += '  </div>';
        html += '  <div style="padding-left:1.4rem">';
        html += '    <span class="badge me-1 ' + classAll + ' ' + classClass + '" style="' + style + '"><span></span>All</span>';
        Object.keys(classMap).forEach(key => {
            html += '    <span class="badge me-1 ' + classClass + ' ' + key + '" style="' + style + '"><span></span>' + classMap[key] + '</span>';
        });
        html += '  </div>';
        html += '</div>';

        html += '<div class="dropdown-divider"></div>';

        html += '<div class="dropdown-menu-footer">';
        html += '<a id="' + idReset + '" href="#" class="text-muted">Reset table settings</a>';
        html += '</div>';

        document.getElementById(idMenu).innerHTML = html;
    }

    function updateIndicator() {
        var elem = document.getElementById(idIndicator);
        var classes = document.getElementsByClassName(classClass);

        var hidden = initvalFlatten == defaultFlatten
            && initvalClass === defaultClass;

        elem.style.display = hidden ? 'none' : 'block';

        for(var c = 0; c < classes.length; ++c) {
            var item = classes[c];
            var span = item.getElementsByTagName('span')[0];

            item.classList.remove('bg-success', 'bg-secondary');

            if (item.classList.contains(initvalClass)) {
                item.classList.add('bg-success');
                span.innerHTML = getCheckIcon();
            } else {
                item.classList.add('bg-secondary');
                span.innerHTML = '';
            }
        }
    }

    function init() {
        var params = new URLSearchParams(window.location.search);
        var classes = document.getElementsByClassName(classClass);

        initvalFlatten = params.has(paramFlatten) ? (params.get(paramFlatten) === 'true') : defaultFlatten;
        initvalClass = params.get(paramClass) || defaultClass;

        document.getElementById(idFlatten).checked = initvalFlatten;

        document.getElementById(idReset).addEventListener('click', onClickReset);
        document.getElementById(idFlatten).addEventListener('click', onClickFlatten);
        for(var c = 0; c < classes.length; ++c) {
            var item = classes[c];
            item.addEventListener('click', onClickClass);
        }

        updateIndicator();
    }

    function onClickReset() {
        document.getElementById(idFlatten).checked = defaultFlatten;

        initvalFlatten = defaultFlatten;
        initvalClass = defaultClass;

        var params = new URLSearchParams(window.location.search);
        params.delete(paramFlatten);
        params.delete(paramClass);
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        table.update();
    }

    function onClickFlatten() {
        var cb = document.getElementById(idFlatten);
        initvalFlatten = cb.checked;

        var params = new URLSearchParams(window.location.search);
        if (initvalFlatten === defaultFlatten) {
            params.delete(paramFlatten);
        } else {
            params.set(paramFlatten, initvalFlatten);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        table.update();
    }

    function onClickClass() {
        var classList = this.className.split(' ');
        if (-1 !== classList.indexOf('badge')) {
            classList.splice(classList.indexOf('badge'), 1);
        }
        if (-1 !== classList.indexOf('me-1')) {
            classList.splice(classList.indexOf('me-1'), 1);
        }
        if (-1 !== classList.indexOf('bg-success')) {
            classList.splice(classList.indexOf('bg-success'), 1);
        }
        if (-1 !== classList.indexOf('bg-secondary')) {
            classList.splice(classList.indexOf('bg-secondary'), 1);
        }
        if (-1 !== classList.indexOf(classClass)) {
            classList.splice(classList.indexOf(classClass), 1);
        }

        initvalClass = classList[0] || '';

        var params = new URLSearchParams(window.location.search);
        if (initvalClass === defaultClass) {
            params.delete(paramClass);
        } else {
            params.set(paramClass, initvalClass);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        table.update();
    }

    function isParent(packageId, dateObj) {
        if (packageId === catalog.id) {
            return true;
        }

        if (initvalFlatten) {
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
        var ret = '';
        Object.keys(classMap).forEach(key => {
            if (type === key) {
                ret = '<span class="badge bg-secondary me-1">' + classMap[key] + '</span>';
            }
        });
        if (ret !== '') {
            return ret;
        }

        if (type === 'municipality+state') {
            return '<span class="badge bg-secondary me-1">Land</span>' +
                   '<span class="badge bg-secondary me-1">Stadt</span>';
        } else if (type === 'collectiveMunicipality') {
            return '<span class="badge bg-warning me-1" title="' + type + '">CM</span>';
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
        var type = '';
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
                type = data[0].type ? data[0].type : type;

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

        if ((initvalClass !== classAll) && (initvalClass !== type)) {
            return '';
        }
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

    install();
    init();

    return {
        update: funcUpdate,
    };
}());