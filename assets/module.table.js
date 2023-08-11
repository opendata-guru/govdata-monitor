var table = (function () {
    var initvalFlatten = false,
        defaultFlatten = false,
        initvalClipboard = false,
        defaultClipboard = false;
        initvalLayers = [],
        defaultLayers = [];
    var idTableBody = 'supplier-table',
        idTableHeader = 'supplier-table-header',
        idTableFooter = 'supplier-table-footer',
        idElement = 'tableDropdown',
        idMenu = 'table-menu',
        idReset = 'table-reset',
        idFlatten = 'checkbox-flatten',
        idClipboard = 'checkbox-clipboard',
        layerClass = 'layer',
        layerAll = 'all',
        layerUndefined = 'void';
    var paramFlatten = 'flatten',
        paramClipboard = 'clipboard',
        paramLayers = 'layers';

    function getCheckIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check align-middle" style="margin:0 .2rem 0 -.2rem"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    }

    function install() {
        var html = '';
        var style = 'line-height:1.2rem;padding:.2rem .6rem;cursor:pointer;margin-top:.2rem;';
        var styleLeft = style + 'margin-right:0 !important;border-top-right-radius:0;border-bottom-right-radius:0;border-right:1px dashed #fff;';
        var styleRight = style + 'border-top-left-radius:0;border-bottom-left-radius:0;';

        html += '<div class="list-group" style="padding: .5rem 1rem 0 1rem">';
        html += '  <div>';
        html += '    Layer:';
        html += '  </div>';
        html += '  <div style="padding-left:1.4rem">';
        html += '    <span class="badge me-1 ' + layerAll + ' ' + layerClass + '" style="' + style + '"><span></span>All</span>';
        html += '    <span class="badge me-1 ' + layerUndefined + ' ' + layerClass + '" style="' + style + '"><span></span>Undefined</span>';
        Object.keys(data.layers).forEach(key => {
            var isLeft = -1 !== ['federal','state','district','municipality'].indexOf(key);
            var isRight = -1 !== ['federalAgency','stateAgency','districtAgency','municipalityAgency'].indexOf(key);

            html += isLeft ? '<br>' : '';
            html += '<span class="badge me-1 ' + layerClass + ' ' + key + '" style="' + (isLeft ? styleLeft : isRight ? styleRight : style) + '"><span></span>' + data.layers[key] + '</span>';
        });
        html += '  </div>';
        html += '  <div class="text-muted text-center mt-2" style="font-size:.75rem">';
        html += '    Use "Ctrl + Click" to select multiple layers';
        html += '  </div>';
        html += '</div>';

        html += '<div class="dropdown-divider"></div>';

        html += '<div class="list-group" style="padding: 0 1rem">';
        html += '  <label class="form-check">';
        html += '    <input id="' + idFlatten + '" class="form-check-input" value="" type="checkbox">';
        html += '    <span class="form-check-label">';
        html += '      Flatten all portals';
        html += '    </span>';
        html += '  </label>';
        html += '  <label class="form-check">';
        html += '    <input id="' + idClipboard + '" class="form-check-input" value="" type="checkbox">';
        html += '    <span class="form-check-label">';
        html += '      Show "copy to clipboard" buttons';
        html += '    </span>';
        html += '  </label>';
        html += '</div>';

        html += '<div class="dropdown-divider"></div>';

        html += '<div class="dropdown-menu-footer pt-0">';
        html += '<a id="' + idReset + '" href="#" class="text-muted">Reset table settings</a>';
        html += '</div>';

        document.getElementById(idMenu).innerHTML = html;
    }

    function isLayerSelected(classList) {
        var ret = false;
        if (initvalLayers.length > 0) {
            initvalLayers.forEach(layer => {
                ret |= classList.contains(layer);
            });
        } else if (classList.contains(layerAll)) {
            ret = true;
        }

        return ret;
    }

    function updateIndicator() {
        var elem = document.getElementById(idElement);
        var layer = document.getElementsByClassName(layerClass);

        if (table) {
            initvalFlatten = table.flatten;
            initvalLayers = table.layers;
        }

        var hidden = initvalFlatten == defaultFlatten
            && initvalClipboard == defaultClipboard
            && initvalLayers.length === defaultLayers.length;

            elem.style.background = hidden ? 'inherit' : 'repeating-linear-gradient(-55deg,#17a2b860 0,#17a2b860 .1rem,#fff .1rem,#fff .4rem)';

        for(var l = 0; l < layer.length; ++l) {
            var item = layer[l];
            var span = item.getElementsByTagName('span')[0];

            item.classList.remove('bg-success', 'bg-secondary');

            if (isLayerSelected(item.classList)) {
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
        initvalClipboard = params.has(paramClipboard) ? (params.get(paramClipboard) === 'true') : defaultClipboard;
        initvalLayers = params.get(paramLayers)?.split('|') || defaultLayers;

        document.getElementById(idFlatten).checked = initvalFlatten;
        document.getElementById(idClipboard).checked = initvalClipboard;

        document.querySelector('[aria-labelledby="' + idElement + '"]').addEventListener('click', onStopPropagation);
        document.getElementById(idReset).addEventListener('click', onClickReset);
        document.getElementById(idFlatten).addEventListener('click', onClickFlatten);
        document.getElementById(idClipboard).addEventListener('click', onClickClipboard);
        for(var l = 0; l < layer.length; ++l) {
            var item = layer[l];
            item.addEventListener('click', onClickLayer);
        }

        updateIndicator();
    }

    function onStopPropagation(event) {
        event.stopPropagation();
    }

    function onClickReset() {
        document.getElementById(idFlatten).checked = defaultFlatten;
        document.getElementById(idClipboard).checked = defaultClipboard;

        table.flatten = defaultFlatten;
        table.layers = defaultLayers;
        initvalClipboard = defaultClipboard;

        var params = new URLSearchParams(window.location.search);
        params.delete(paramFlatten);
        params.delete(paramClipboard);
        params.delete(paramLayers);
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

    function onClickClipboard() {
        var cb = document.getElementById(idClipboard);
        initvalClipboard = cb.checked;

        var params = new URLSearchParams(window.location.search);
        if (initvalClipboard === defaultClipboard) {
            params.delete(paramClipboard);
        } else {
            params.set(paramClipboard, initvalClipboard);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        data.emitFilterChanged();
    }

    function onClickLayer(event) {
        var ctrlKey = event.ctrlKey || event.metaKey;
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

        var name = classList[0];
        if (name === layerAll) {
            table.layers = [];
        } else if (ctrlKey) {
            if (table.layers.indexOf(name) === -1) {
                table.layers.push(name);
            } else {
                table.layers.splice(table.layers.indexOf(name), 1);
            }
        } else {
            table.layers = name ? [name] : [];
        }
        
        var params = new URLSearchParams(window.location.search);
        if (table.layers.length === 0) {
            params.delete(paramLayers);
        } else {
            params.set(paramLayers, table.layers.join('|'));
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
/*            var parent = '';
            if (itemParent[0].packagesInId != catalog.id) {
                parent = getParentPath(dataObj, itemParent[0]);
            }*/
            return ' (datasets in ' + itemParent[0].title + ' portal)';
        }

        return '';
    }

    function getRow(parent, row) {
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
                cols += '<td class="text-end align-middle' + addClass + '">' + monitorFormatNumber(col.count) + '</td>';
            });
        }

        if (row.datasetCount !== undefined) {
            if (row.datasetCount) {
                cols += '<td class="text-end align-middle"><span class="badge bg-info">' + monitorFormatNumber(row.datasetCount) + '</span></td>';
            } else {
                cols += '<td></td>';
            }
        }

        if (initvalClipboard && (icon === '')) {
            var contributorParts = row.contributor.split('/');
            var contributor = contributorParts[2];
            if (0 === contributor.indexOf('www.mcloud.de')) {
                contributor = contributor.slice(4);
            }
            var copyTitle = '<button onclick="table.copyToClipboard(\'' + row.title + '\')" class="badge bg-success ms-1 border-0">Name</button>';
            var copyPath = '<button onclick="table.copyToClipboard(\'' + contributor + '|' + row.name + '\')" class="badge bg-success ms-1 border-0">Path</button>';
            return '<tr><td><span>' + title + '<span><span class="text-success text-sm">, copy'+ copyTitle + copyPath + '</span></td>' + cols + '</tr>';
        }

        return '<tr><td><span>' + icon + title + '</span></td>' + cols + '</tr>';
    }

    function funcCopyToClipboard(value) {
        navigator.clipboard.writeText(value);
    }

    function getSublineRow(arrayData, id, countDatasets, lastSuffix) {
        var showBadge = arrayData.length === 1;
        var str = '';
        var name = '';
        var title = '';
        var type = '';
        var lastCount = undefined;
        var maxDiff = 0;
        var ignoreRow = false;
        var packagesInId = '';

        arrayData.forEach(processData => {
            var dataObj = processData ? processData.filter(item => item.id === id) : [];
            if (dataObj.length > 0) {
                if ((dataObj[0].type === 'root') && !countDatasets) {
                    ignoreRow = true;
                }
                if (countDatasets && (undefined === dataObj[0].datasetCount)) {
//                    ignoreRow = true;
                }

                var currentCount = countDatasets ? parseInt(dataObj[0].datasetCount ? dataObj[0].datasetCount : 0, 10) : parseInt(dataObj[0].packages ? dataObj[0].packages : 0, 10);
                var addClass = '';
                title = dataObj[0].title ? dataObj[0].title : title;
                name = dataObj[0].name ? dataObj[0].name : name;
                type = dataObj[0].type ? dataObj[0].type : type;
                packagesInId = dataObj[0].packagesInId ? dataObj[0].packagesInId : packagesInId;

                if (!countDatasets && (dataObj[0].packagesInId != catalog.id)) {
                    title += ' <span class="small">' + getParentPath(processData, dataObj[0]) + '</span>';
                }

                if (lastCount !== undefined) {
                    var difference = lastCount === null ? currentCount : Math.abs(lastCount - currentCount);
                    maxDiff = Math.max(maxDiff, difference);
                    if (diff.highlight && (difference >= diff.threshold)) {
                        addClass = ' bg-warning';
                    }
                }
                str += '<td class="text-end align-middle' + addClass + '">' + monitorFormatNumber(currentCount) + '</td>';
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
                str += '<td class="text-end align-middle' + addClass + '">-</td>';
                if (showBadge) {
                    str += '<td></td>';
                }
                lastCount = null;
            }
        });

        if (ignoreRow) {
            return '';
        }

        var secondLine = '';
        var showDiff = '';
        var showPortal = '';
        var suffix = '';
        var diffSuffix = '';
        if (countDatasets) {
            suffix = '?cat=' + id;
            diffSuffix = '&cat2=' + id;
        } else {
            suffix = '?cat=' + name + '&in=' + packagesInId;
            diffSuffix = '&cat2=' + name + '&in2=' + packagesInId;
        }

        if (lastSuffix.value !== '') {
//            showDiff = '<a href="datasets.html' + lastSuffix.value + diffSuffix + '" class="link-info ms-2">Show differences</a>';
//            showDiff = '<a href="" class="ms-2" style="pointer-events:none;color:#888">Show differences</a>';
        }
//        showPortal = '<a href="" class="ms-2" style="pointer-events:none;color:#888">Show in portal</a>';

        secondLine = '<br><a href="datasets.html' + suffix + '" class="link-info ms-4">Show datasets</a>' + showPortal + showDiff;

        str = '<td>' + title + secondLine + '</td>' + str;

        lastSuffix.value = suffix;

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

        firstHeader += '<th>Data Catalogs</th>';
        secondHeader += '<th>Data Suppliers</th>';

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
            var parent = catalog.get(catalog.id);
            data.view.forEach((row) => body += getRow(parent, row));
            footer += '<th>' + data.view.length + ' data suppliers</th>';
        } else {
            body += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
            footer += '<th></th>';
        }

        var suffix = { value: '' };
        subline += getSublineRow(arrayData, catalog.id, true, suffix);
        if (sameAs.length > 0) {
            sameAs.forEach((id) => subline += getSublineRow(arrayData, id, false, suffix));
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

        map.update();
        system.update();
    }

    install();
    init();

    return {
        copyToClipboard: funcCopyToClipboard,
        flatten: initvalFlatten,
        layers: initvalLayers,
        layerNameOfUndefined: layerUndefined,
        update: funcUpdate,
    };
}());