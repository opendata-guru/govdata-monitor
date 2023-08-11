var data = (function () {
    var baseURL = 'https://opendata.guru/govdata/assets/',
        dateToLoad = '',
        uriToLoad = '';
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var assets = [],
        view = [],
        viewHeader = [],
        layers = [];

    function init() {
        layers['country'] = 'Staat';
        layers['federal'] = 'Bund';
        layers['federalAgency'] = 'Bundesbehörde';
        layers['federalCooperation'] = 'Bund + Länder';
        layers['state'] = 'Land';
        layers['stateAgency'] = 'Landesamt';
        layers['governmentRegion'] = 'Regierungsbezirk';
        layers['regionalNetwork'] = 'Region';
        layers['district'] = 'Kreis';
        layers['districtAgency'] = 'Kreisverwaltung';
        layers['collectiveMunicipality'] = 'Amt / Verbandsgemeinde';
        layers['municipality'] = 'Stadt';
        layers['municipalityAgency'] = 'Stadtverwaltung';
    }

    function funcAddEventListenerStartLoading(func) {
        eventListenerStartLoading.push(func);
    }

    function funcAddEventListenerEndLoading(func) {
        eventListenerEndLoading.push(func);
    }

    function dispatchEventStartLoading() {
        eventListenerStartLoading.forEach(func => func());
    }

    function dispatchEventEndLoading() {
        eventListenerEndLoading.forEach(func => func());
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

        if (table.flatten) {
            var sameAsPackageId = catalog.getSameAs(packageId);

            data.getDate(dateString).filter(item => -1 !== sameAsPackageId.indexOf(item.id)).forEach((row) => {
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

    function getContributor(dataObj, item) {
        var itemParent = dataObj.filter(dataItem => dataItem.id === item.packagesInId);
        if (itemParent.length > 0) {
            return itemParent[0].link;
        }

        return '';
    }

    function funcGetTypeString(type) {
        var ret = '';
        Object.keys(layers).forEach(key => {
            if (type === key) {
                ret = layers[key];
            }
        });
        if (ret !== '') {
            return ret;
        }

        if (type === 'municipality+state') {
            return 'Land + Stadt';
        } else if (type === 'portal') {
            return 'Portal';
        } else if (type !== '') {
            return '?';
        }

        return '';
    }

    function analyzeRow(arrayData, id) {
        var showBadge = arrayData.length === 1;
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

        arrayData.forEach(processData => {
            var dataObj = processData ? processData.filter(item => item.id === id) : [];
            var highlight = false;

            if (dataObj.length > 0) {
                var obj = dataObj[0];
                var currentCount = parseInt(obj.packages ? obj.packages : 0, 10);

                title = obj.title ? obj.title : title;
                name = obj.name ? obj.name : name;
                type = obj.type ? obj.type : type;

                typeStr = funcGetTypeString(type);
                contributor = getContributor(processData, obj);

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

        if (table.layers.length > 0) {
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
        if (diff.hideEqual && (arrayData.length > 1) && (maxDiff < diff.threshold)) {
            return;
        }

        view.push({
            cols: packages,
            contributor: contributor,
            datasetCount: datasetCount,
            linkId: id,
            name: name,
            path: path,
            title: title,
            type: type,
            typeDE: typeStr,
        });
    }

    function createView() {
        var arrayData = [],
            rows = [];
        var sameAs = catalog.getSameAs(catalog.id);

        view = [];
        viewHeader = [];

        for (d = 0; d < date.selection.length; ++d) {
            var selectedDate = date.selection[d];
            viewHeader.push(selectedDate);
            arrayData.push(data.getDate(selectedDate));

            if (arrayData[d]) {
                arrayData[d].forEach((row) => {
                    if (isParent(row.packagesInId ? row.packagesInId : '', selectedDate, sameAs)) {
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

        table.update();
    }

    function funcGet() {
        return assets[monitor.displayDate];
    }

    function funcGetDate(dateString) {
        return assets[dateString]
    }

    function funcHas(dateString) {
        return assets[dateString] !== undefined;
    }

    function setDate(displayDate) {
        monitor.displayDate = displayDate;

        date.update();
        data.emitFilterChanged();
    }

    function setLoadingDate(loadingDate) {
        var dateString = loadingDate.toISOString().split('T')[0];
        var uri = baseURL + 'data-' + dateString.split('-')[0] + '/' + dateString + '-organizations.json';

        dateToLoad = dateString;
        uriToLoad = uri;
    }

    function store(payload) {
        assets[dateToLoad] = payload;

        if (Object.keys(assets).length === 1) {
            setDate(dateToLoad);
            catalog.set(catalog.id); // <-  this is a hack
        }

        var current = new Date(dateToLoad);
        current.setDate(current.getDate() - 1);

        setLoadingDate(current); 

        dispatchEventStartLoading(dateToLoad);
        monitorUpdateCatalogHistoryChart();

        load();
    }

    function load() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriToLoad, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                store(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                dispatchEventEndLoading();

                date.update();
                monitorUpdateCatalogHistoryChart();
            }
        }

        var start = new Date(Date.now());
        var current = new Date(dateToLoad);
        var diffs = start.getTime() - current.getTime();
        var days = Math.ceil(diffs / (1000 * 3600 * 24));

        if (days <= monitor.maxDays) {
            xhr.send();
        } else {
            dispatchEventEndLoading();

            date.update();
            monitorUpdateCatalogHistoryChart();
        }
    }

    function funcLoadData() {
        setLoadingDate(new Date(Date.now()));
        dispatchEventStartLoading(dateToLoad);

        load();
    }

    init();

    return {
        addEventListenerStartLoading: funcAddEventListenerStartLoading,
        addEventListenerEndLoading: funcAddEventListenerEndLoading,
        emitFilterChanged: funcEmitFilterChanged,
        get: funcGet,
        getDate: funcGetDate,
        getTypeString: funcGetTypeString,
        has: funcHas,
        layers: layers,
        loadData: funcLoadData,
        view: view,
        viewHeader: viewHeader,
    };
}());