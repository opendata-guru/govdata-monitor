var catalog = (function () {
    var initvalId = '',
        defaultId = 'govdata';
    var idDisplayCatalog = 'display-catalog',
        idHistoryTitle = 'history-title',
        idBreadcrumb = 'breadcrumb';
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

    function get(id) {
        var data = monitor.data[monitor.displayDate];
        var obj = undefined; 
    
        if (data && id) {
            data.forEach((row) => {
                if (row.id === id) {
                    obj = row;
                }
            });
        }

        return obj;
    }

    function funcSet(catalogId) {
        setId(catalogId);

        window.scrollTo(0, 0);

        var text = '';
        var catalogObject = get(catalogId);
        var strCatalog = catalogId;
        var strDatasetCount = '';

        if (catalogObject) {
            strCatalog = catalogObject.title;
            strDatasetCount = catalogObject.datasetCount;
        }

        text = strCatalog + ' have ' + '<strong>' + monitorFormatNumber(strDatasetCount) + '</strong> datasets';
        document.getElementById(idDisplayCatalog).innerHTML = text;
        document.getElementById(idHistoryTitle).innerHTML = strCatalog + ' History';
        document.getElementById(idBreadcrumb).innerHTML = getBreadcrumb(catalogId);

        date.update();
        monitorUpdateCatalogTable();
    }

    function getBreadcrumb(id) {
        var ret = '';
        var catalogObject = get(id);

        if (catalogObject) {
            ret += getBreadcrumb(catalogObject.packagesInId);
            if (id === catalog.id) {
                ret += ' &gt; ' + catalogObject.title;
            } else {
                ret += ' &gt; <a class="text-primary" onclick="catalog.set(\'' + id + '\')">' + catalogObject.title + '</a>';
            }
        }

        return ret;
    }

    init();

    return {
        id: initvalId,
        set: funcSet,
    };
}());