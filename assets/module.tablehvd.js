var tableHVD = (function () {
    var initvalFlatten = false,
        defaultFlatten = false,
        initvalClipboard = false,
        defaultClipboard = false;
        initvalLayers = [],
        defaultLayers = [];
    var idSupplierTableBody = 'supplier-table',
        idSupplierTableHeader = 'supplier-table-header',
        idSupplierTableFooter = 'supplier-table-footer',
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

        html += '<div class="list-group" style="padding: .5rem 1rem 0 1rem">';
        html += '  <div>';
        html += '    Layer:';
        html += '  </div>';
        html += '  <div style="padding-left:1.4rem">';
        html += '    <span class="badge me-1 ' + layerAll + ' ' + layerClass + '" style="' + style + '"><span></span>All</span>';
        html += '    <span class="badge me-1 ' + layerUndefined + ' ' + layerClass + '" style="' + style + '"><span></span>Undefined</span>';
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

        if (tableHVD) {
            initvalFlatten = tableHVD.flatten;
            initvalLayers = tableHVD.layers;
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

        tableHVD.flatten = defaultFlatten;
        tableHVD.layers = defaultLayers;
        initvalClipboard = defaultClipboard;

        var params = new URLSearchParams(window.location.search);
        params.delete(paramFlatten);
        params.delete(paramClipboard);
        params.delete(paramLayers);
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        dataHVD.emitFilterChanged();
    }

    function onClickFlatten() {
        var cb = document.getElementById(idFlatten);
        tableHVD.flatten = cb.checked;

        var params = new URLSearchParams(window.location.search);
        if (tableHVD.flatten === defaultFlatten) {
            params.delete(paramFlatten);
        } else {
            params.set(paramFlatten, tableHVD.flatten);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        dataHVD.emitFilterChanged();
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
        dataHVD.emitFilterChanged();
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
            tableHVD.layers = [];
        } else if (ctrlKey) {
            if (tableHVD.layers.indexOf(name) === -1) {
                tableHVD.layers.push(name);
            } else {
                tableHVD.layers.splice(tableHVD.layers.indexOf(name), 1);
            }
        } else {
            tableHVD.layers = name ? [name] : [];
        }
        
        var params = new URLSearchParams(window.location.search);
        if (tableHVD.layers.length === 0) {
            params.delete(paramLayers);
        } else {
            params.set(paramLayers, tableHVD.layers.join('|'));
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        dataHVD.emitFilterChanged();
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
            dataHVD.getDate(dateString).filter(item => item.id === packageId).forEach((row) => {
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

    function getRow(row) {
        var cols = '';
        var title = row.title;

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

        return '<tr><td><span>' + title + '</span></td>' + cols + '</tr>';
    }

    function funcCopyToClipboard(value) {
        navigator.clipboard.writeText(value);
    }

    function funcUpdate() {
        var arrayData = [];
        var arrayIds = [];
        var supplierHeader = '';
        var supplierRows = '';
        var supplierFooter = '';
        var sameAs = catalog.getSameAs(catalog.id);

        supplierHeader += '<th>HVD Suppliers</th>';

        for (var v = 0; v < dataHVD.viewHeader.length; ++v) {
            supplierHeader += '<th class="text-end">' + dataHVD.viewHeader[v] + '</th>';
        }

        for (d = 0; d < date.selection.length; ++d) {
            arrayData.push(dataHVD.getDate(date.selection[d]));
    
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

        if (dataHVD.view.length > 0) {
            dataHVD.view.forEach((row) => supplierRows += getRow(row));
            supplierFooter += '<th>' + dataHVD.view.length + ' HVD suppliers</th>';
        } else {
            supplierRows += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
            supplierFooter += '<th></th>';
        }

        supplierHeader = '<tr style="border-bottom:1.5px solid #6C757D">' + supplierHeader + '</tr>';
        supplierFooter = '<tr style="border-top:1.5px solid #6C757D">' + supplierFooter + '</tr>';

        document.getElementById(idSupplierTableHeader).innerHTML = supplierHeader;
        document.getElementById(idSupplierTableFooter).innerHTML = supplierFooter;
        document.getElementById(idSupplierTableBody).innerHTML = supplierRows;

        var menuCanvasList = document.querySelectorAll('.menu-canvas');
        menuCanvasList.forEach((menuCanvas) => {
            menuCanvas.addEventListener('click', onStopPropagation);
        });
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