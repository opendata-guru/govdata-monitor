var table = (function () {
    var initvalFlatten = false,
        defaultFlatten = false,
        initvalLayer = 'all',
        defaultLayer = 'all',
        layers = [];
    var idTableBody = 'supplier-table',
        idTableHeader = 'supplier-table-header',
        idTableFooter = 'supplier-table-footer',
        idIndicator = 'table-indicator',
        idMenu = 'table-menu',
        idReset = 'table-reset',
        idFlatten = 'checkbox-flatten',
        layerClass = 'layer',
        layerAll = 'all';
    var paramFlatten = 'flatten',
        paramLayer = 'layer';

    layers['country'] = 'Staat';
    layers['federal'] = 'Bund';
    layers['federalAgency'] = 'Bundesbehörde';
    layers['federalCooperation'] = 'Bund + Land';
    layers['state'] = 'Land';
    layers['stateAgency'] = 'Landesamt';
    layers['regionalNetwork'] = 'Region';
    layers['municipality'] = 'Stadt';
    layers['council'] = 'Rat';

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
        html += '    Layer:';
        html += '  </div>';
        html += '  <div style="padding-left:1.4rem">';
        html += '    <span class="badge me-1 ' + layerAll + ' ' + layerClass + '" style="' + style + '"><span></span>All</span>';
        Object.keys(layers).forEach(key => {
            html += '    <span class="badge me-1 ' + layerClass + ' ' + key + '" style="' + style + '"><span></span>' + layers[key] + '</span>';
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
        var layer = document.getElementsByClassName(layerClass);

        var hidden = initvalFlatten == defaultFlatten
            && initvalLayer === defaultLayer;

        elem.style.display = hidden ? 'none' : 'block';

        for(var l = 0; l < layer.length; ++l) {
            var item = layer[l];
            var span = item.getElementsByTagName('span')[0];

            item.classList.remove('bg-success', 'bg-secondary');

            if (item.classList.contains(initvalLayer)) {
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
        var layer = document.getElementsByClassName(layerClass);

        initvalFlatten = params.has(paramFlatten) ? (params.get(paramFlatten) === 'true') : defaultFlatten;
        initvalLayer = params.get(paramLayer) || defaultLayer;

        document.getElementById(idFlatten).checked = initvalFlatten;

        document.getElementById(idReset).addEventListener('click', onClickReset);
        document.getElementById(idFlatten).addEventListener('click', onClickFlatten);
        for(var l = 0; l < layer.length; ++l) {
            var item = layer[l];
            item.addEventListener('click', onClickLayer);
        }

        updateIndicator();
    }

    function onClickReset() {
        document.getElementById(idFlatten).checked = defaultFlatten;

        initvalFlatten = defaultFlatten;
        initvalLayer = defaultLayer;

        var params = new URLSearchParams(window.location.search);
        params.delete(paramFlatten);
        params.delete(paramLayer);
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

    function onClickLayer(event) {
        event.stopPropagation();

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
        if (-1 !== classList.indexOf(layerClass)) {
            classList.splice(classList.indexOf(layerClass), 1);
        }

        initvalLayer = classList[0] || '';

        var params = new URLSearchParams(window.location.search);
        if (initvalLayer === defaultLayer) {
            params.delete(paramLayer);
        } else {
            params.set(paramLayer, initvalLayer);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        table.update();
    }

    function isParent(packageId, dateObj, sameAs) {
        var found = false;
        if (sameAs.length > 0) {
            sameAs.forEach((id) => found |= packageId === id);
        } else if (packageId === catalog.id) {
            found = true;
        }
        if (found) {
            return true;
        }

        if (initvalFlatten) {
            monitor.data[dateObj].filter(item => item.id === packageId).forEach((row) => {
                if (row.packagesInId) {
                    found |= isParent(row.packagesInId, dateObj, sameAs);
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

        //return ' &larr; ' + item.packagesInId;
        return '';
    }

    function getRowIcon(type) {
        var ret = '';
        Object.keys(layers).forEach(key => {
            if (type === key) {
                ret = '<span class="badge bg-secondary me-1">' + layers[key] + '</span>';
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

                if (lastCount !== undefined) {
                    var difference = lastCount === null ? currentCount : Math.abs(lastCount - currentCount);
                    maxDiff = Math.max(maxDiff, difference);
                    if (diff.highlight && (difference >= diff.threshold)) {
                        addClass = ' bg-warning';
                    }
                }
                str += '<td class="text-end' + addClass + '">' + monitorFormatNumber(currentCount) + '</td>';

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
                var addClass = '';
                if ((lastCount !== undefined) && (lastCount !== null)) {
                    var difference = lastCount;
                    maxDiff = Math.max(maxDiff, difference);
                    if (diff.highlight && (difference >= diff.threshold)) {
                        addClass = ' bg-warning';
                    }
                }
                str += '<td class="text-end' + addClass + '">-</td>';
                if (showBadge) {
                    str += '<td></td>';
                }
                lastCount = null;
            }
        });

        if ((initvalLayer !== layerAll) && (initvalLayer !== type)) {
            return '';
        }
        if (diff.hideEqual && (arrayData.length > 1) && (maxDiff < diff.threshold)) {
            return '';
        }

        str = '<td><span title="' + name + '">' + icon + title + assertion + '</span></td>' + str;

        return '<tr>' + str + '</tr>';
    }

    function getSublineRow(arrayData, id, countDatasets) {
        var str = '';
        var title = '';
        var name = '';
        var type = '';
        var lastCount = undefined;
        var maxDiff = 0;

        arrayData.forEach(processData => {
            var data = processData ? processData.filter(item => item.id === id) : [];
            if (data.length > 0) {
                var currentCount = countDatasets ? parseInt(data[0].datasetCount ? data[0].datasetCount : 0, 10) : parseInt(data[0].packages ? data[0].packages : 0, 10);
                var addClass = '';
                title = data[0].title ? data[0].title : title;
                name = data[0].name ? data[0].name : name;
                type = data[0].type ? data[0].type : type;

                if (!countDatasets && (data[0].packagesInId != catalog.id)) {
                    title += ' <span class="small text-info">' + getParentPath(processData, data[0]) + '</span>';
                }

                if (lastCount !== undefined) {
                    var difference = lastCount === null ? currentCount : Math.abs(lastCount - currentCount);
                    maxDiff = Math.max(maxDiff, difference);
                    if (diff.highlight && (difference >= diff.threshold)) {
                        addClass = ' bg-warning';
                    }
                }
                str += '<td class="text-end text-info' + addClass + '">' + monitorFormatNumber(currentCount) + '</td>';

                lastCount = currentCount;
            } else {
                var addClass = '';
                if ((lastCount !== undefined) && (lastCount !== null)) {
                    var difference = lastCount;
                    maxDiff = Math.max(maxDiff, difference);
                    if (diff.highlight && (difference >= diff.threshold)) {
                        addClass = ' bg-warning';
                    }
                }
                str += '<td class="text-end text-info' + addClass + '">-</td>';
                lastCount = null;
            }
        });

        str = '<td style="border-left:.5rem solid #1cbb8c" class="text-info"><span title="' + name + '">' + title + '</span></td>' + str;

        return '<tr>' + str + '</tr>';
    }

    function funcUpdate() {
        var arrayData = [];
        var arrayIds = [];
        var header = '';
        var footer = '';
        var subline = '';
        var body = '';
        var sameAs = catalog.getSameAs(catalog.id);

        header += '<th>Data Supplier</th>';
        for (d = 0; d < date.selection.length; ++d) {
            arrayData.push(monitor.data[date.selection[d]]);
            header += '<th>' + date.selection[d] + '</th>';
    
            if (arrayData[arrayData.length - 1]) {
                arrayData[arrayData.length - 1].forEach((row) => {
                    if (isParent(row.packagesInId ? row.packagesInId : '', date.selection[d], sameAs)) {
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

        subline += getSublineRow(arrayData, catalog.id, true);
        if (sameAs.length > 0) {
            sameAs.forEach((id) => subline += getSublineRow(arrayData, id, false));
        }

        header = '<tr>' + header + '</tr>';
        footer = '<tr>' + footer + '</tr>';
        subline = '<tr>' + subline + '</tr>';

        document.getElementById(idTableHeader).innerHTML = header + subline;
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