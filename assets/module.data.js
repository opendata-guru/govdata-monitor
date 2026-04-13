var data = (function () {
    var assets = [],
        view = [],
        viewHeader = [],
        displayDate = '';

    function init() {
    }

    function isParent(packageId, dateString) {
        var found = false;
        if (packageId === catalog.id) {
            found = true;
        }
        if (found) {
            return true;
        }

        if (table && table.flatten) {
/*            var sameAsPackageId = catalog.getSameAs(packageId);

            data.getDate(dateString).filter(item => -1 !== sameAsPackageId.indexOf(item.id)).forEach((row) => {
                if (row.packagesInId) {
                    found |= isParent(row.packagesInId, dateString);
                }
            });
            return found;*/
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

    function getContributor(dataObj, item) {
        var itemParent = dataObj.filter(dataItem => dataItem.id === item.packagesInId);
        if (itemParent.length > 0) {
            return itemParent[0].link;
        }

        return '';
    }

    function analyzeRow(arrayData, id) {
        var showBadge = arrayData.length === 1;
        var sid = '';
        var str = '';
        var name = '';
        var path = '';
        var type = '';
        var title = '';
        var typeStr = '';
        var packages = [];
        var contributor = '';
        var datasetCount = undefined;
        var lastCount = undefined;
        var maxDiff = 0;
        var parts = undefined;

        arrayData.forEach(processData => {
            var dataObj = processData ? processData.filter(item => item.id === id) : [];
            var highlight = false;

            if (dataObj.length > 0) {
                var obj = dataObj[0];
                var currentCount = parseInt(obj.packages ? obj.packages : 0, 10);

                title = obj.title ? obj.title : title;
                name = obj.name ? obj.name : name;
                type = obj.type ? obj.type : type;
                sid = obj.sid ? obj.sid : sid;

                typeStr = basics.layer.getTypeString(type);
                contributor = getContributor(processData, obj);

                parts = obj.parts;
                if (showBadge) {
                    datasetCount = obj.datasetCount ? obj.datasetCount : null;
                }
                if (obj.packagesInId != catalog.id) {
                    path = getParentPath(processData, obj);
                }
                if (lastCount !== undefined) {
                    var difference = lastCount === null ? currentCount : Math.abs(lastCount - currentCount);
                    maxDiff = Math.max(maxDiff, difference);
                    highlight = diff.highlight && (difference >= diff.threshold);
                }

                lastCount = currentCount;
            } else {
                var highlight = false;

                if (showBadge) {
                    datasetCount = null;
                }
                if ((lastCount !== undefined) && (lastCount !== null)) {
                    var difference = lastCount;
                    maxDiff = Math.max(maxDiff, difference);
                    highlight = diff.highlight && (difference >= diff.threshold);
                }

                lastCount = null;
            }

            packages.push({
                count: lastCount,
                highlight: highlight
            });
        });

        if (table && table.layers.length > 0) {
            var show = false;
            table.layers.forEach(layer => {
                if (layer === table.layerNameOfUndefined) {
                    show |= type === '';
                } else {
                    show |= (-1 !== type.split('+').indexOf(layer));
                }
            });
            if (!show) {
                return;
            }
        }
        if (diff && diff.hideEqual && (arrayData.length > 1) && (maxDiff < diff.threshold)) {
            return;
        }

        view.push({
            children: parts || [],
            cols: packages,
            contributor: contributor,
            datasetCount: datasetCount,
            linkId: id,
            name: name,
            path: path,
            sid: sid,
            title: title,
            type: type,
            typeDE: typeStr,
        });
    }

    function createView() {
        var arrayData = [],
            rows = [];
        var selection = [];

        if (date) {
            selection = date.selection;
        } else {
            selection.push(data.getDisplayDate());
        }

        view = [];
        viewHeader = [];

        for (d = 0; d < selection.length; ++d) {
            var selectedDate = selection[d];
            viewHeader.push(selectedDate);
            arrayData.push(data.getDate(selectedDate));

            if (arrayData[d]) {
                arrayData[d].forEach((row) => {
                    if (isParent(row.packagesInId ? row.packagesInId : '', selectedDate)) {
                        if (rows.indexOf(row.id) < 0) {
                            rows.push(row.id);
                        }
                    }
                });
            }
        }

        if (rows.length > 0) {
            rows.forEach((id) => analyzeRow(arrayData, id));
        }

        data.view = view;
        data.viewHeader = viewHeader;
    }

    function funcEmitFilterChanged() {
        createView();

        if (table) {
            table.update();
        }

        if (catalog) {
            catalog.rebuildAllPortalTables();
        }

        monitorUpdateCatalogPieChart();

        if (charthistory) {
            charthistory.update();
        }

//        system.update();
    }

    function funcGet() {
        return assets[displayDate];
    }

    function funcGetDate(dateString) {
        return assets[dateString]
    }

    function funcGetDisplayDate() {
        return displayDate;
    }

    function funcHas(dateString) {
        return assets[dateString] !== undefined;
    }

    function funcGetPortalTitle(id) {
        return id;
    }

    init();

    return {
        emitFilterChanged: funcEmitFilterChanged,
        get: funcGet,
        getDate: funcGetDate,
        getDisplayDate: funcGetDisplayDate,
        getPortalTitle: funcGetPortalTitle,
        has: funcHas,
        initalDays: 0,
        isHVD: false,
        loadedDays: 0,
        view: view,
        viewHeader: viewHeader,
    };
}());