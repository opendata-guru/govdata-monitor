var tableHVD = (function () {
    var initvalFlatten = false,
        defaultFlatten = false,
        initvalClipboard = false,
        defaultClipboard = false;
        initvalLayers = [],
        defaultLayers = [];
    var idDatasetsTableBody = 'datasets-table',
        idDatasetsTableHeader = 'datasets-table-header',
        idDatasetsTableFooter = 'datasets-table-footer',
        idDistributionsTableBody = 'distributions-table',
        idDistributionsTableHeader = 'distributions-table-header',
        idDistributionsTableFooter = 'distributions-table-footer',
        idDataservicesTableBody = 'dataservices-table',
        idDataservicesTableHeader = 'dataservices-table-header',
        idDataservicesTableFooter = 'dataservices-table-footer',
        idLicensesTableBody = 'licenses-table',
        idLicensesTableHeader = 'licenses-table-header',
        idLicensesTableFooter = 'licenses-table-footer',
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

    function getSPARQLcountEUlicensesByCatalog(msCat) {
		var sparql = 
`prefix dct: <http://purl.org/dc/terms/>
prefix r5r: <http://data.europa.eu/r5r/>
prefix dcat: <http://www.w3.org/ns/dcat#>

select ?license (count(?license) as ?count) ?mapped where {
  <?MSCat?> ?cp ?d.
  ?d r5r:applicableLegislation <http://data.europa.eu/eli/reg_impl/2023/138/oj>.
  ?d a dcat:Dataset.
  ?d dcat:distribution ?dist.
  ?dist r5r:applicableLegislation <http://data.europa.eu/eli/reg_impl/2023/138/oj>.
  OPTIONAL { ?dist dct:license ?license.
    OPTIONAL { ?license ?skos ?mapped.
      FILTER ( ?skos IN ( <http://www.w3.org/2004/02/skos/core#exactMatch>,
                          <http://www.w3.org/2004/02/skos/core#narrowMatch>,
                          <http://www.w3.org/2004/02/skos/core#broadMatch> ))
    }
  }
}`;

		return sparql.replace('?MSCat?', msCat);
    }

    function getPortalLink(title, query) {
        var baseURL = 'https://data.europa.eu/data/sparql';
        var endpoint = 'https://data.europa.eu/sparql';
        var ret = '';

        ret += baseURL;
        ret += '?locale=en';
        ret += '#query=' + encodeURIComponent(query);
        ret += '&endpoint=' + encodeURIComponent(endpoint);
        ret += '&requestMethod=' + encodeURIComponent('POST');
        ret += '&tabTitle=' + encodeURIComponent(title);
        ret += '&headers=' + encodeURIComponent('{}');
        ret += '&contentTypeConstruct=' + encodeURIComponent('application/n-triples,*/*;q=0.9');
        ret += '&contentTypeSelect=' + encodeURIComponent('application/sparql-results+json,*/*;q=0.9');
        ret += '&locale=' + encodeURIComponent('en');
        ret += '&outputFormat=' + encodeURIComponent('table');

        return ret;
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
        data.emitFilterChanged();
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

    function getDatasetRow(row) {
        var cols = '';
        var title = row.title;

        if (row.cols.length > 0) {
            row.cols.forEach(col => {
                var addClass = col.highlight ? ' bg-warning' : '';
                cols += '<td class="text-end align-middle' + addClass + '">' + monitorFormatNumber(col.datasetCount) + '</td>';
            });
        }

/*        if (row.datasetCount !== undefined) {
            if (row.datasetCount) {
                cols += '<td class="text-end align-middle"><span class="badge bg-info">' + monitorFormatNumber(row.datasetCount) + '</span></td>';
            } else {
                cols += '<td></td>';
            }
        }*/

        return '<tr><td><span>' + title + '</span></td>' + cols + '</tr>';
    }

    function getDistributionRow(row) {
        var cols = '';
        var title = row.title;

        if (row.cols.length > 0) {
            row.cols.forEach(col => {
                var addClass = col.highlight ? ' bg-warning' : '';
                cols += '<td class="text-end align-middle' + addClass + '">' + monitorFormatNumber(col.distributionCount) + '</td>';
            });
        }

/*        if (row.datasetCount !== undefined) {
            if (row.datasetCount) {
                cols += '<td class="text-end align-middle"><span class="badge bg-info">' + monitorFormatNumber(row.datasetCount) + '</span></td>';
            } else {
                cols += '<td></td>';
            }
        }*/

        return '<tr><td><span>' + title + '</span></td>' + cols + '</tr>';
    }

    function getDataserviceRow(row) {
        var cols = '';
        var title = row.title;

        if (row.cols.length > 0) {
            row.cols.forEach(col => {
                var addClass = col.highlight ? ' bg-warning' : '';
                cols += '<td class="text-end align-middle' + addClass + '">' + monitorFormatNumber(col.dataServiceCount) + '</td>';
            });
        }

/*        if (row.datasetCount !== undefined) {
            if (row.datasetCount) {
                cols += '<td class="text-end align-middle"><span class="badge bg-info">' + monitorFormatNumber(row.datasetCount) + '</span></td>';
            } else {
                cols += '<td></td>';
            }
        }*/

        return '<tr><td><span>' + title + '</span></td>' + cols + '</tr>';
    }

    function getLicenseRow(row) {
        var cols = '';
        var title = row.title;

        if (row.cols.length > 0) {
            row.cols.forEach(col => {
                var str = '';
                var licenseless = parseInt(col.distributionCount, 10) - parseInt(col.licenseCount.cc_0, 10) - parseInt(col.licenseCount.cc_0_comparable, 10) - parseInt(col.licenseCount.cc_by, 10) - parseInt(col.licenseCount.cc_by_comparable, 10) - parseInt(col.licenseCount.restrictive, 10) - parseInt(col.licenseCount.unknown, 10);
                str += '<span class="badge border border-success bg-success" style="width:4em">' + col.licenseCount.cc_0 + '</span>';
                str += '<span class="badge border border-success text-success" style="width:4em">' + col.licenseCount.cc_0_comparable + '</span>';
                str += '<br>';
                str += '<span class="badge border border-primary bg-primary" style="width:4em">' + col.licenseCount.cc_by + '</span>';
                str += '<span class="badge border border-primary text-primary" style="width:4em">' + col.licenseCount.cc_by_comparable + '</span>';
                str += '<br>';
                str += '<span class="badge border border-danger bg-danger" style="width:4em">' + col.licenseCount.restrictive + '</span>';
                str += '<span class="badge border border-danger text-danger"" style="width:4em">' + licenseless + '</span>';
                str += '<br>';
                str += '<span class="badge border border-secondary bg-secondary" style="width:8em">' + col.licenseCount.unknown + '</span>';

                var addClass = col.highlight ? ' bg-warning' : '';
                cols += '<td class="text-end align-middle' + addClass + '">' + str + '</td>';
            });
        }

        title += ' (<a href="' + getPortalLink(title, getSPARQLcountEUlicensesByCatalog(row.linkId)) + '" target="_blank">show query</a>)';

/*        if (row.datasetCount !== undefined) {
            if (row.datasetCount) {
                cols += '<td class="text-end align-middle"><span class="badge bg-info">' + monitorFormatNumber(row.datasetCount) + '</span></td>';
            } else {
                cols += '<td></td>';
            }
        }*/

        return '<tr><td><span>' + title + '</span></td>' + cols + '</tr>';
    }

    function funcCopyToClipboard(value) {
        navigator.clipboard.writeText(value);
    }

    function funcUpdate() {
        var arrayData = [];
        var arrayIds = [];
        var datasetHeader = '';
        var datasetRows = '';
        var datasetFooter = '';
        var distributionHeader = '';
        var distributionRows = '';
        var distributionFooter = '';
        var dataserviceHeader = '';
        var dataserviceRows = '';
        var dataserviceFooter = '';
        var licenseHeader = '';
        var licenseRows = '';
        var licenseFooter = '';
        var sameAs = catalog.getSameAs(catalog.id);

        datasetHeader += '<th>HVD Datasets</th>';
        distributionHeader += '<th>HVD Distributions</th>';
        dataserviceHeader += '<th>HVD Data Services</th>';
        licenseHeader += '<th>HVD Licenses</th>';

        for (var v = 0; v < data.viewHeader.length; ++v) {
            datasetHeader += '<th class="text-end">' + data.viewHeader[v] + '</th>';
            distributionHeader += '<th class="text-end">' + data.viewHeader[v] + '</th>';
            dataserviceHeader += '<th class="text-end">' + data.viewHeader[v] + '</th>';
            licenseHeader += '<th class="text-end">' + data.viewHeader[v] + '</th>';
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
            data.view.forEach((row) => datasetRows += getDatasetRow(row));
            data.view.forEach((row) => distributionRows += getDistributionRow(row));
            data.view.forEach((row) => dataserviceRows += getDataserviceRow(row));
            data.view.forEach((row) => licenseRows += getLicenseRow(row));

            var str = '';
            str += '<br>';
            str += '<span class="badge border border-success bg-success">CC 0</span>';
            str += '<span class="badge border border-success text-success ms-2">CC 0 comparable</span>';
            str += '<span class="badge border border-primary bg-primary ms-2">CC BY</span>';
            str += '<span class="badge border border-primary text-primary ms-2">CC BY comparable</span>';
            str += '<br>';
            str += '<span class="badge border border-danger bg-danger">More restrictive</span>';
            str += '<span class="badge border border-danger text-danger ms-2">Missing license</span>';
            str += '<br>';
            str += '<span class="badge border border-secondary bg-secondary">Unknown, parsing error</span>';

            datasetFooter += '<th>' + data.view.length + ' HVD suppliers</th>';
            distributionFooter += '<th>' + data.view.length + ' HVD suppliers</th>';
            dataserviceFooter += '<th>' + data.view.length + ' HVD suppliers</th>';
            licenseFooter += '<th>' + data.view.length + ' HVD suppliers' + str + '</th>';
        } else {
            datasetRows += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
            distributionRows += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
            dataserviceRows += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
            licenseRows += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
            datasetFooter += '<th></th>';
            distributionFooter += '<th></th>';
            dataserviceFooter += '<th></th>';
            licenseFooter += '<th></th>';
        }

        datasetHeader = '<tr style="border-bottom:1.5px solid #6C757D">' + datasetHeader + '</tr>';
        distributionHeader = '<tr style="border-bottom:1.5px solid #6C757D">' + distributionHeader + '</tr>';
        dataserviceHeader = '<tr style="border-bottom:1.5px solid #6C757D">' + dataserviceHeader + '</tr>';
        licenseHeader = '<tr style="border-bottom:1.5px solid #6C757D">' + licenseHeader + '</tr>';
        datasetFooter = '<tr style="border-top:1.5px solid #6C757D">' + datasetFooter + '</tr>';
        distributionFooter = '<tr style="border-top:1.5px solid #6C757D">' + distributionFooter + '</tr>';
        dataserviceFooter = '<tr style="border-top:1.5px solid #6C757D">' + dataserviceFooter + '</tr>';
        licenseFooter = '<tr style="border-top:1.5px solid #6C757D">' + licenseFooter + '</tr>';

        document.getElementById(idDatasetsTableHeader).innerHTML = datasetHeader;
        document.getElementById(idDistributionsTableHeader).innerHTML = distributionHeader;
        document.getElementById(idDataservicesTableHeader).innerHTML = dataserviceHeader;
        document.getElementById(idLicensesTableHeader).innerHTML = licenseHeader;
        document.getElementById(idDatasetsTableFooter).innerHTML = datasetFooter;
        document.getElementById(idDistributionsTableFooter).innerHTML = distributionFooter;
        document.getElementById(idDataservicesTableFooter).innerHTML = dataserviceFooter;
        document.getElementById(idLicensesTableFooter).innerHTML = licenseFooter;
        document.getElementById(idDatasetsTableBody).innerHTML = datasetRows;
        document.getElementById(idDistributionsTableBody).innerHTML = distributionRows;
        document.getElementById(idDataservicesTableBody).innerHTML = dataserviceRows;
        document.getElementById(idLicensesTableBody).innerHTML = licenseRows;

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