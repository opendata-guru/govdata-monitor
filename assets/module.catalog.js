var catalog = (function () {
    var initvalId = [],
        defaultId = [];
    var paramId = 'catalog';

    function funcSetId(id) {
        initvalId = id;

        if (catalog) {
            catalog.id = initvalId;
        }
    }

    function getObjectById(id) {
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

    function funcGet() {
        return getObjectById(catalog.id);
    }

    function funcGetBreadcrumb(id) {
        var ret = '';
        var catalogObject = getObjectById(id);

        if (catalogObject) {
            ret += catalog.getBreadcrumb(catalogObject.packagesInId);
            if (id === catalog.id) {
                ret += ' &gt; ' + catalogObject.title;
            } else {
                ret += ' &gt; <a class="text-primary" onclick="monitorSetCatalog(\'' + id + '\')">' + catalogObject.title + '</a>';
            }
        }

        return ret;
    }

    return {
        id: initvalId,
        getBreadcrumb: funcGetBreadcrumb,
        get: funcGet,
        setId: funcSetId,
    };
}());