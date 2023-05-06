var table = (function () {
    var initvalFlatten = false,
        defaultFlatten = false,
        initvalLayer = 'all',
        defaultLayer = 'all';
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
        Object.keys(data.layers).forEach(key => {
            html += '    <span class="badge me-1 ' + layerClass + ' ' + key + '" style="' + style + '"><span></span>' + data.layers[key] + '</span>';
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

        if (table) {
            initvalFlatten = table.flatten;
            initvalLayer = table.layer;
        }

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

        table.flatten = defaultFlatten;
        table.layer = defaultLayer;

        var params = new URLSearchParams(window.location.search);
        params.delete(paramFlatten);
        params.delete(paramLayer);
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        data.emitFilterChanged();
    }

    function onClickFlatten() {
        var cb = document.getElementById(idFlatten);
        table.flatten = cb.checked;

        var params = new URLSearchParams(window.location.search);
        if (table.flatten === defaultFlatten) {
            params.delete(paramFlatten);
        } else {
            params.set(paramFlatten, table.flatten);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        data.emitFilterChanged();
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

        table.layer = classList[0] || '';

        var params = new URLSearchParams(window.location.search);
        if (table.layer === defaultLayer) {
            params.delete(paramLayer);
        } else {
            params.set(paramLayer, table.layer);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        data.emitFilterChanged();
    }

    function isParent(packageId, dateString, sameAs) {
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
            data.getDate(dateString).filter(item => item.id === packageId).forEach((row) => {
                if (row.packagesInId) {
                    found |= isParent(row.packagesInId, dateString, sameAs);
                }
            });
            return found;
        }

        return false;
    }

    function getParentPath(dataObj, item) {
        var itemParent = dataObj.filter(dataItem => dataItem.id === item.packagesInId);
        if (itemParent.length > 0) {
            var parent = '';
            if (itemParent[0].packagesInId != catalog.id) {
                parent = getParentPath(dataObj, itemParent[0]);
            }
            return ' &larr; ' + itemParent[0].title + parent;
        }

        //return ' &larr; ' + item.packagesInId;
        return '';
    }

    function getRow(row) {
        var cols = '';
        var icon = '';
        var title = row.title;

        if (row.linkId) {
            title = '<a href="#" onclick="catalog.set(\'' + row.linkId + '\')">' + title + '</a>';
        }
        if (row.path && (row.path !== '')) {
            title += ' <span class="small text-info">' + row.path + '</span>';
        }
        if (row.type && (row.type !== '')) {
            icon = '<span class="badge bg-secondary me-1">' + row.typeDE + '</span>';
        }

        if (row.cols.length > 0) {
            row.cols.forEach(col => {
                var addClass = col.highlight ? ' bg-warning' : '';
                cols += '<td class="text-end' + addClass + '">' + monitorFormatNumber(col.count) + '</td>';
            });
        }

        if (row.datasetCount !== undefined) {
            if (row.datasetCount) {
                cols += '<td class="text-end"><span class="badge bg-info">' + monitorFormatNumber(row.datasetCount) + '</span></td>';
            } else {
                cols += '<td></td>';
            }
        }

        return '<tr><td><span title="' + row.name + '">' + icon + title + '</span></td>' + cols + '</tr>';
    }

    function getSublineRow(arrayData, id, countDatasets) {
        var showBadge = arrayData.length === 1;
        var str = '';
        var title = '';
        var name = '';
        var type = '';
        var lastCount = undefined;
        var maxDiff = 0;

        arrayData.forEach(processData => {
            var dataObj = processData ? processData.filter(item => item.id === id) : [];
            if (dataObj.length > 0) {
                var currentCount = countDatasets ? parseInt(dataObj[0].datasetCount ? dataObj[0].datasetCount : 0, 10) : parseInt(dataObj[0].packages ? dataObj[0].packages : 0, 10);
                var addClass = '';
                title = dataObj[0].title ? dataObj[0].title : title;
                name = dataObj[0].name ? dataObj[0].name : name;
                type = dataObj[0].type ? dataObj[0].type : type;

                if (!countDatasets && (dataObj[0].packagesInId != catalog.id)) {
                    title += ' <span class="small text-info">' + getParentPath(processData, dataObj[0]) + '</span>';
                }

                if (lastCount !== undefined) {
                    var difference = lastCount === null ? currentCount : Math.abs(lastCount - currentCount);
                    maxDiff = Math.max(maxDiff, difference);
                    if (diff.highlight && (difference >= diff.threshold)) {
                        addClass = ' bg-warning';
                    }
                }
                str += '<td class="text-end' + addClass + '">' + monitorFormatNumber(currentCount) + '</td>';
                if (showBadge) {
                    str += '<td></td>';
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

        str = '<td><span title="' + name + '">' + title + '</span></td>' + str;

        return '<tr>' + str + '</tr>';
    }

    function funcUpdate() {
        var arrayData = [];
        var arrayIds = [];
        var firstHeader = '';
        var secondHeader = '';
        var footer = '';
        var subline = '';
        var body = '';
        var sameAs = catalog.getSameAs(catalog.id);

        firstHeader += '<th>Data Catalog</th>';
        secondHeader += '<th>Data Supplier</th>';

        for (var v = 0; v < data.viewHeader.length; ++v) {
            firstHeader += '<th class="text-end">' + data.viewHeader[v] + '</th>';
            secondHeader += '<th></th>';
        }
        if (data.viewHeader.length === 1) {
            firstHeader += '<th class="text-end">In source portal</th>';
            secondHeader += '<th></th>';
        }

        for (d = 0; d < date.selection.length; ++d) {
            arrayData.push(data.getDate(date.selection[d]));
    
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

        if (data.view.length > 0) {
            data.view.forEach((row) => body += getRow(row));
            footer += '<th>' + data.view.length + ' data suppliers</th>';
        } else {
            body += '<tr><td>No data available</td></tr>';
            footer += '<th></th>';
        }

        subline += getSublineRow(arrayData, catalog.id, true);
        if (sameAs.length > 0) {
            sameAs.forEach((id) => subline += getSublineRow(arrayData, id, false));
        }

        firstHeader = '<tr style="border-bottom:2px solid #000">' + firstHeader + '</tr>';
        secondHeader = '<tr style="border-top:2px solid #000;border-bottom:2px solid #000">' + secondHeader + '</tr>';
        footer = '<tr style="border-top:2px solid #000">' + footer + '</tr>';
        subline = '<tr>' + subline + '</tr>';

        document.getElementById(idTableHeader).innerHTML = firstHeader + subline + secondHeader;
        document.getElementById(idTableFooter).innerHTML = footer;
        document.getElementById(idTableBody).innerHTML = body;

        monitorUpdateCatalogPieChart();
        monitorUpdateCatalogHistoryChart();
    }

    install();
    init();

    return {
        flatten: initvalFlatten,
        layer: initvalLayer,
        layerAll: layerAll,
        update: funcUpdate,
    };
}());