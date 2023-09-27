var catalog = (function () {
    var initvalId = '',
        defaultId = 'govdata';
    var idHistoryTitle = 'history-title';
    var paramId = 'catalog';

    function init() {
        var params = new URLSearchParams(window.location.search);

        if (params.has(paramId)) {
            initvalId = params.get(paramId);
        } else {
            initvalId = defaultId;
        }
    }

    function setId(id) {
        initvalId = id;

        if (catalog) {
            catalog.id = initvalId;
        }

        var params = new URLSearchParams(window.location.search);
        if (id === defaultId) {
            params.delete(paramId);
        } else {
            params.set(paramId, id);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);
    }

    function funcGet(id) {
        var dataObj = data.get();
        var obj = undefined; 

        if (dataObj && id) {
            dataObj.forEach((row) => {
                if (row.id === id) {
                    obj = row;
                }
            });
        }

        return obj;
    }

    function funcGetSameAs(id) {
        var catalogObject = funcGet(id);
        var dataObj = data.get();
        var ret = [];

        if (dataObj && id) {
            dataObj.forEach((row) => {
                if (catalogObject.wikidata && (catalogObject.wikidata !== '') && (row.wikidata === catalogObject.wikidata)) {
                    ret.push(row.id);
                } else if (catalogObject.contributor && (catalogObject.contributor !== '') && (row.contributor === catalogObject.contributor)) {
                    ret.push(row.id);
                } else if (catalogObject.linkTimestamp && (catalogObject.linkTimestamp !== '') && (row.linkTimestamp === catalogObject.linkTimestamp)) {
                    ret.push(row.id);
                }
            });
        }

        if (catalogObject && (ret.length === 0)) {
            ret.push(catalogObject.id);
        }

        return ret;
    }

    function getDownloadMenu() {
        var html = '';
        html += '<a title="Options" class="ms-3" style="text-decoration:none;float:right;color:#939ba2;border:1px solid #939ba2;border-radius:2rem;height:2rem;width:2rem;line-height:1.6rem;text-align:center" href="#" id="downloadDropdown" data-bs-toggle="dropdown">';
        html += '<span>...</span>';
        html += '</a>';
        html += '<div class="dropdown-menu dropdown-menu-lg dropdown-menu-start py-2" aria-labelledby="downloadDropdown" id="table-menu">';
        html += '<a onclick="monitorDownloadAsCSV()" class="d-block px-3 py-1 text-dark fw-normal">Download as CSV file</a>';
        html += '<div class="dropdown-divider"></div>';
        html += '<a onclick="monitorLoadMoreDays(7)" class="d-block px-3 py-1 text-dark fw-normal">Load more data (one week)</a>';
        html += '<a onclick="monitorLoadMoreDays(30)" class="d-block px-3 py-1 text-dark fw-normal">Load more data (one month)</a>';
        html += '<a onclick="monitorRemoveLoadedDays()" id="removeLoadedDays" class="d-block px-3 py-1 fw-normal" style="color:#ccc;pointer-events:none">Remove loaded data</a>';
        html += '<div class="dropdown-divider"></div>';
        html += '<a onclick="monitorZoomIn()" id="historyZoomIn" class="d-block px-3 py-1 text-dark fw-normal" style="color:#ccc">Maximize diagramm</a>';
        html += '<a onclick="monitorZoomOut()" id="historyZoomOut" class="d-block px-3 py-1 fw-normal" style="color:#ccc;pointer-events:none">Minimize diagramm</a>';
        html += '</div>';

        return html;
    }

    function funcSet(catalogId) {
        setId(catalogId);

        window.scrollTo(0, 0);

        var catalogObject = funcGet(catalogId);
        var strCatalog = catalogId;

        if (catalogObject) {
            strCatalog = catalogObject.title;
        }

        document.getElementById(idHistoryTitle).innerHTML = monitor.maxDays + ' days history ' + getDownloadMenu();

        parents.update();
        date.update();
        data.emitFilterChanged();
    }

    init();

    return {
        id: initvalId,
        get: funcGet,
        getSameAs: funcGetSameAs,
        set: funcSet,
    };
}());