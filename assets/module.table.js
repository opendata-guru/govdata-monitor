var table = (function () {
    var initvalFlatten = false,
        defaultFlatten = false,
        initvalClipboard = false,
        defaultClipboard = false;
        initvalLayers = [],
        defaultLayers = [];
    var idSupplierTableBody = 'supplier-table',
        idSupplierTableHeader = 'supplier-table-header',
        idSupplierTableFooter = 'supplier-table-footer',
        idCatalogTableBody = 'catalog-table',
        idCatalogTableHeader = 'catalog-table-header',
        idElement = 'tableDropdown',
        idMenu = 'table-menu',
        idReset = 'table-reset',
        idFlatten = 'checkbox-flatten',
        idClipboard = 'checkbox-clipboard',
        idDatasetDropdown = 'list-datasets-dropdown',
        layerClass = 'layer',
        layerAll = 'all',
        layerUndefined = 'void';
    var paramFlatten = 'flatten',
        paramClipboard = 'clipboard',
        paramLayers = 'layers';
    var dict = {
        de: {
            subMenuSettings: 'Einstellungen',
            subMenuTableCopy: 'Schaltflächen „In die Zwischenablage kopieren“ anzeigen',
            subMenuTableFlatten: 'Alle Portale flach darstellen',
            subMenuTableLayer: 'Ebene',
            subMenuTableLayerAll: 'Alle',
            subMenuTableLayerUndefined: 'Nicht definiert',
            subMenuTableMultipleLayers: 'Verwende „Strg + Klick“, um mehrere Ebenen auszuwählen',
            subMenuTableReset: 'Tabelleneinstellungen zurücksetzen',
            subMenuTableTitle: 'Tabelle',
        },
        en: {
            subMenuSettings: 'Settings',
            subMenuTableCopy: 'Show "copy to clipboard" buttons',
            subMenuTableFlatten: 'Flatten all portals',
            subMenuTableLayer: 'Layer',
            subMenuTableLayerAll: 'All',
            subMenuTableLayerUndefined: 'Undefined',
            subMenuTableMultipleLayers: 'Use "Ctrl + Click" to select multiple layers',
            subMenuTableReset: 'Reset table settings',
            subMenuTableTitle: 'Table',
        },
    };
    
    function getCheckIcon() {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check align-middle" style="margin:0 .2rem 0 -.2rem"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    }

    function install() {
        var html = '';
        var style = 'line-height:1.2rem;padding:.2rem .6rem;cursor:pointer;margin-top:.2rem;';
        var styleLeft = style + 'margin-right:0 !important;border-top-right-radius:0;border-bottom-right-radius:0;border-right:1px dashed #fff;';
        var styleMiddle = style + 'margin-right:0 !important;border-radius:0;border-right:1px dashed #fff;';
        var styleRight = style + 'border-top-left-radius:0;border-bottom-left-radius:0;';

        html += '<div class="list-group" style="padding: .5rem 1rem 0 1rem">';
        html += '  <div>' + dict[nav.lang].subMenuTableLayer + ':</div>';
        html += '  <div style="padding-left:1.4rem">';
        html += '    <span class="badge me-1 ' + layerAll + ' ' + layerClass + '" style="' + style + '"><span></span>' + dict[nav.lang].subMenuTableLayerAll + '</span>';
        html += '    <span class="badge me-1 ' + layerUndefined + ' ' + layerClass + '" style="' + style + '"><span></span>' + dict[nav.lang].subMenuTableLayerUndefined + '</span>';
        Object.keys(data.layers).forEach(key => {
            var isLeft = -1 !== ['supranational','country','federal','state','regionalNetwork','district','municipality'].indexOf(key);
            var isMiddle = -1 !== ['stateAgency'].indexOf(key);
            var isRight = -1 !== ['supranationalAgency','countryAgency','federalAgency','state+municipality','districtAgency','municipalityAgency'].indexOf(key);

            html += isLeft ? '<br>' : '';
            html += '<span class="badge me-1 ' + layerClass + ' ' + key + '" style="' + (isLeft ? styleLeft : isMiddle ? styleMiddle : isRight ? styleRight : style) + '"><span></span>' + data.layers[key] + '</span>';
        });
        html += '  </div>';
        html += '  <div class="text-muted text-center mt-2" style="font-size:.75rem">' + dict[nav.lang].subMenuTableMultipleLayers + '</div>';
        html += '</div>';

        html += '<div class="dropdown-divider"></div>';

        html += '<div class="list-group" style="padding: 0 1rem">';
        html += '  <label class="form-check">';
        html += '    <input id="' + idFlatten + '" class="form-check-input" value="" type="checkbox">';
        html += '    <span class="form-check-label">' + dict[nav.lang].subMenuTableFlatten + '</span>';
        html += '  </label>';
        html += '  <label class="form-check">';
        html += '    <input id="' + idClipboard + '" class="form-check-input" value="" type="checkbox">';
        html += '    <span class="form-check-label">' + dict[nav.lang].subMenuTableCopy + '</span>';
        html += '  </label>';
        html += '</div>';

        html += '<div class="dropdown-divider"></div>';

        html += '<div class="dropdown-menu-footer pt-0">';
        html += '<a id="' + idReset + '" href="#" class="text-muted">' + dict[nav.lang].subMenuTableReset + '</a>';
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

        var elem;
        elem = document.querySelector('.main nav.navbar > div:nth-child(2) li.nav-item.text-secondary');
        elem.innerHTML = dict[nav.lang].subMenuSettings + ':';
        elem = document.querySelector('#' + idElement + ' > span');
        elem.innerHTML = dict[nav.lang].subMenuTableTitle;

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
        if (row.children.length > 0) {
            var map = row.children.map((child) => child.id);

            title += ' (incl. ' + map.join(' + ') + ')';
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
            var copyTitle = '<button onclick="table.copyToClipboard(\'' + row.title + '\')" class="badge bg-success ms-1 border-0">Title</button>';
            var copyPath = '<button onclick="table.copyToClipboard(\'' + contributor + '|' + row.name + '\')" class="badge bg-danger ms-1 border-0">Path</button>';
            var copySID = '<button onclick="table.copyToClipboard(\'' + row.sid + '\')" class="badge bg-success ms-1 border-0">SID</button>';
            var copyName = '<button onclick="table.copyToClipboard(\'' + row.name + '\')" class="badge bg-success ms-1 border-0">Name</button>';
            return '<tr><td><span>' + title + '<span><span class="text-success text-sm">, copy'+ copyTitle + copyPath + copySID + copyName + '</span></td>' + cols + '</tr>';
        }

        return '<tr><td><span>' + icon + title + '</span></td>' + cols + '</tr>';
    }

    function funcCopyToClipboard(value) {
        navigator.clipboard.writeText(value);
    }

    function loadDatasetList(path, elemHeader, elemBody) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                elemHeader.innerHTML = 'Processing data...';
                elemBody.innerHTML = '';

                var arr = JSON.parse(this.responseText);
                arr.sort();
                elemHeader.innerHTML = arr.length + ' datasets loaded';
                elemBody.innerHTML = arr.join('<br>');
            } else if (this.readyState == 4) {
                elemHeader.innerHTML = 'Error';
                elemBody.innerHTML = '';
            }
        }

        xhr.send();
    }

    function funcListDatasets(elemButton, name, parent) {
        var catName = '', id = '';
        var elemMenu = elemButton.parentElement;
        var elemHeader = elemMenu.querySelector('.menu-header');
        var elemBody = elemMenu.querySelector('.menu-body');

        elemHeader.innerHTML = 'Loading data...';
        elemBody.innerHTML = '';

        if (elemButton.dataset.in === 'undefined') {
            catName = elemButton.dataset.name;
            id = '';
        } else {
            catName = elemButton.dataset.in;
            id = elemButton.dataset.name;
        }

        var cat = catalog.get(catName);
        var catLink = cat.link;

        console.log('https://opendata.guru/api/2/datasets?link=' + catLink + '&sub_id=' + id);
        if (id === '') {
            console.log('/api/3/action/package_list');
        } else {
            var base = catLink.split('/');
            base.pop();
            base.pop();
            base.pop();
            base.pop();
            console.log(base.join('/') + '/api/3/action/organization_show?include_dataset_count=false&include_datasets=true&include_extras=false&include_followers=false&include_groups=false&include_tags=false&include_users=false&id=' + id);
        }
        // package_list
        //   limit + offset
        // package_search https://docs.ckan.org/en/2.8/api/index.html#ckan.logic.action.get.package_search

        loadDatasetList('https://opendata.guru/api/2/datasets?link=' + catLink + '&sub_id=' + id, elemHeader, elemBody);
    }

    function getCatalogMenu(catalogId) {
        var html = ' and ';
        html += '<a title="Options" class="link-info" href="#" id="' + idDatasetDropdown + '" data-bs-toggle="dropdown">';
        html += 'List Datasets';
        html += '</a>';
        html += '<div class="menu-canvas dropdown-menu dropdown-menu-lg dropdown-menu-start py-2" aria-labelledby="' + idDatasetDropdown + '" id="table-menu">';
        html += '<div class="menu-header d-block px-3 py-1 text-dark fw-normal" style="color:#ccc">Press "Start"...</div>';
        html += '<div class="dropdown-divider mb-0"></div>';
        html += '<div class="menu-body py-2" style="height:7.75rem;overflow:auto;"></div>';
        html += '<div class="dropdown-divider mt-0"></div>';
        html += '<a data-name="' + catalogId.name + '" data-in="' + catalogId.in + '" onclick="table.listDatasets(this)" class="d-block px-3 py-1 text-dark fw-normal" style="color:#ccc">Start</a>';
        html += '</div>';

        return html;
    }

    function getCatalogRow(arrayData, id, countDatasets, lastSuffix) {
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
                    ignoreRow = true;
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
        var catalogId = {};
        if (countDatasets) {
            catalogId.name = id;
            suffix = '?cat=' + catalogId.name;
            diffSuffix = '&cat2=' + catalogId.name;
        } else {
            catalogId.name = name;
            catalogId.in = packagesInId;
            suffix = '?cat=' + catalogId.name + '&in=' + catalogId.in;
            diffSuffix = '&cat2=' + catalogId.name + '&in2=' + catalogId.in;
        }

        if (lastSuffix.value !== '') {
//            showDiff = '<a href="datasets.html' + lastSuffix.value + diffSuffix + '" class="link-info ms-2">Show differences</a>';
//            showDiff = '<a href="" class="ms-2" style="pointer-events:none;color:#888">Show differences</a>';
        }
//        showPortal = '<a href="" class="ms-2" style="pointer-events:none;color:#888">Show in portal</a>';

        secondLine = '<br><span class="ms-4">Work in progress:</span> <a href="datasets.html' + suffix + '" class="link-info">Show datasets</a>' + showPortal + showDiff + getCatalogMenu(catalogId);

        str = '<td>' + title + secondLine + '</td>' + str;

        lastSuffix.value = suffix;

        return '<tr>' + str + '</tr>';
    }

    function funcUpdate() {
        var arrayData = [];
        var arrayIds = [];
        var catalogHeader = '';
        var catalogRows = '';
        var supplierHeader = '';
        var supplierRows = '';
        var supplierFooter = '';
        var sameAs = catalog.getSameAs(catalog.id);

        catalogHeader += '<th></th>';
        supplierHeader += '<th>Data Suppliers</th>';

        for (var v = 0; v < data.viewHeader.length; ++v) {
            catalogHeader += '<th class="text-end">' + data.viewHeader[v] + '</th>';
            supplierHeader += '<th class="text-end">' + data.viewHeader[v] + '</th>';
        }
        if (data.viewHeader.length === 1) {
            supplierHeader += '<th class="text-end">In source portal</th>';
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
            data.view.forEach((row) => supplierRows += getRow(parent, row));
            supplierFooter += '<th>' + data.view.length + ' data suppliers</th>';
        } else {
            supplierRows += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
            supplierFooter += '<th></th>';
        }

        var suffix = { value: '' };
        catalogRows += getCatalogRow(arrayData, catalog.id, true, suffix);
        if (sameAs.length > 0) {
            sameAs.forEach((id) => catalogRows += getCatalogRow(arrayData, id, false, suffix));
        }

        catalogHeader = '<tr>' + catalogHeader + '</tr>';
        supplierHeader = '<tr style="border-bottom:1.5px solid #6C757D">' + supplierHeader + '</tr>';
        supplierFooter = '<tr style="border-top:1.5px solid #6C757D">' + supplierFooter + '</tr>';

        document.getElementById(idCatalogTableHeader).innerHTML = catalogHeader;
        document.getElementById(idCatalogTableBody).innerHTML = catalogRows;

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
        listDatasets: funcListDatasets,
        update: funcUpdate,
    };
}());

var tableLObjects = (function () {
    function init() {
    }

    function getLObjectTitle(lObject) {
        var sObject = lObject.sobject;

        if (sObject && sObject.title) {
            if (sObject.title[nav.lang]) {
                return sObject.title[nav.lang];
            }
            if (sObject.title.en) {
                return sObject.title.en;
            }
            return sObject.title[Object.keys(sObject.title)[0]];
        }

        return lObject.title;
    }

    function getLObjectType(lObject) {
        var sObject = lObject.sobject;

        if (sObject) {
            return  data.getTypeString(sObject.type);
        }

        return '';
    }

    function getLObjectImage(lObject) {
        var sObject = lObject.sobject;

        if (sObject && sObject.image && (sObject.image.url !== '')) {
            return  '<img src="' + sObject.image.url + '" style="height:1.5em;margin:-.1rem .5em 0 0">';
        }

        return '';
    }

    function sortAlphabetical(options) {
        return function(a, b) {
            return getLObjectTitle(a).localeCompare(getLObjectTitle(b));
        }
    }

    function sortCount(options) {
        options.dates = [...new Set(options.dates)];
        options.dates.sort();
        var date = options.dates.slice(-1)[0];

        if (!options.lObjectsCount[date]) {
            return undefined;
        }

        var count = options.lObjectsCount[date];

        return function(a, b) {
            if (count[a.lid] === count[b.lid]) {
                return getLObjectTitle(a).localeCompare(getLObjectTitle(b));
            }

            if (count[a.lid] === undefined) {
                return 1;
            }
            if (count[b.lid] === undefined) {
                return -1;
            }

            return count[a.lid] < count[b.lid] ? 1 : -1;
        }
    }

    function sort(options) {
//        options.pObject.lObjects.sort(sortAlphabetical(options));
        options.pObject.lObjects.sort(sortCount(options));
    }

    function buildTableHead(options) {
        var str = '';

        str += '<tr>';
        str += '<th style="padding:.25rem .5rem">' + options.dict[nav.lang].suppliers + '</th>';
        str += '<th>&nbsp;</th>';

        options.dates.forEach((date) => {
            var formated = date;
            if (nav.lang === 'de') {
                var current = new Date(date);
                formated = current.toLocaleString('de-DE').split(',')[0];
            }
            str += '<th style="padding:.25rem .5rem;text-align:right;border-left:1px solid #17a2b8">' + formated + '</th>';
        });

        str += '</tr>';

        return str;
    }

    function buildTableBody(options) {
        var current = new Date(Date.now());
        var dateString = current.toLocaleString('sv-SE').split(' ')[0];
        var str = '';

        options.pObject.lObjects.forEach((lObject) => {
            var lastSeen = '';
            var diffMilliseconds = new Date((new Date(dateString)).getTime() - (new Date(lObject.lastseen)).getTime());
            var diff = Math.floor(diffMilliseconds/(24*3600*1000));

            if (diff === 0) {
//                lastSeen = options.dict[nav.lang].lastSeenZeroDays;
            } else if (diff === 1) {
//                lastSeen = '<span class="text-warning">(' + options.dict[nav.lang].lastSeenOneDay + ')</span>';
            } else {
                lastSeen = '<span class="text-danger">(' + options.dict[nav.lang].lastSeenMoreDays.replace('{days}', diff) + ')</span>';
            }

            str += '<tr style="border-bottom:1px solid #ddd">';

            var url = '';
            var onClick = '';
            if (lObject.sid) {
                url = 'sid=' + lObject.sid;
                onClick = 'catalog.setSID(\'' + lObject.sid + '\')';
            } else {
                url = 'lid=' + lObject.lid;
                onClick = 'catalog.setLID(\'' + lObject.lid + '\')';
            }

            url += nav.lang === 'en' ? '' : '&lang=' + nav.lang;
            str += '<td style="padding:.25rem .5rem">';
            if (lObject.lid) {
                str += '<span class="d-loggedin ' + (account.isLoggedIn() ? '' : 'd-none') + ' badge bg-danger me-1" style="width:2.4rem;cursor:copy" onclick="tableLObjects.selectLID(this)">' + lObject.lid + '</span>';
            }
            str += '<a href="catalogs.html?' + url + '" onclick="' + onClick + '";event.preventDefault()>' + getLObjectImage(lObject) + getLObjectTitle(lObject) + '</a>';
            str += ' ' + lastSeen;
            str += '</td>';

            str += '<td style="padding:.25rem .5rem;background:#eee">';
            str += getLObjectType(lObject);
            str += '</td>';

            options.dates.forEach((date) => {
                var count = options.lObjectsCount[date] ? options.lObjectsCount[date][lObject.lid] : undefined;
                if (count === undefined) {
                    count = '-';
                }
                str += '<td style="padding:.25rem .5rem;text-align:right;background:#a4e9f4;border-left:1px solid #17a2b8">' + monitorFormatNumber(count) + '</td>';
            });

            str += '</tr>';
        });

        return str;
    }

    function buildHeader(options) {
        var str = '';

        str += '<div class="text-white" style="background:#17a2b8;padding:.62rem .5rem;font-size:.7rem">';
        str += options.dict[nav.lang].unknownPortal + ' <span class="ms-4" style="color:#a4e9f4">' + options.pObject.url + '</span>';
        str += '</div>';

        return str;
    }

    function buildTable(options) {
        var str = '';

        str += '<table class="bg-white" style="min-height:2rem;width:100%;font-size:.7rem">';

        if (options.pObject.lObjects && (options.pObject.lObjects.length > 0)) {
            str += '<thead style="background:#a4e9f4;border-bottom:1px solid #17a2b8">';
            str += buildTableHead(options);
            str += '</thead>';
            str += '<tbody>';
            str += buildTableBody(options);
            str += '</tbody>';
        } else {
            str += '<tr><td style="background: repeating-conic-gradient(#a4e9f4 0% 25%, transparent 0% 50%) 50% / 20px 20px;"></td></tr>';
        }

        str += '</table>';

        return str;
    }

    function buildFooter(options) {
        var str = '';

        str += '<div class="text-white mb-3" style="background:#17a2b8;padding:.62rem .5rem;font-size:.7rem">';
        if (!options.pObject.lObjects) {
            str += options.dict[nav.lang].suppliersError;
        } else if (options.pObject.lObjects.length === 0) {
            str += options.dict[nav.lang].suppliersCountZero;
        } else if (options.pObject.lObjects.length === 1) {
            str += options.dict[nav.lang].suppliersCountOne;
        } else {
            str += options.dict[nav.lang].suppliersCountMore.replace('{count}', options.pObject.lObjects.length);
        }
        str += '</div>';

        return str;
    }

    function buildFrame(options) {
        var str = '';

        sort(options);

        str += buildHeader(options);
        str += buildTable(options);
        str += buildFooter(options);

        return str;
    }

    function funcBuild(options) {
        if (!options.pObject) {
            console.error('pObject not exists');
            return;
        }

        options.dates = [...new Set(options.dates)];
        options.dates.sort();

        var str = buildFrame(options);

        var elem = document.getElementById('portal-' + options.pObject.pid);
        elem.innerHTML = str;
    }

    function funcSelectLID(that) {
        var lid = that.textContent;
        catalog.modifySetLID(lid);
    }

    init();

    return {
        build: funcBuild,
        getLObjectTitle: getLObjectTitle,
        selectLID: funcSelectLID,
    };
}());
