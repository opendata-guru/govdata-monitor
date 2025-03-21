var data = (function () {
    var baseURL = 'https://opendata.guru/govdata/assets/',
        dateToLoad = '',
        uriToLoad = '';
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var assets = [],
        view = [],
        viewHeader = [],
        loadDays = 0,
        displayDate = '',
        layers = [];
    var dict = {
        de: {
            international: 'International',
            supranational: 'Europa',
            supranationalAgency: 'Europäische Behörde',
            country: 'Staat',
            countryAgency: 'Staatliche Behörde',
            federal: 'Bund',
            federalAgency: 'Bundesbehörde',
            state: 'Land',
            stateAgency: 'Landesamt',
            state_municipality: 'Land und Stadt',
            governmentRegion: 'Regierungsbezirk',
            regionalNetwork: 'Region',
            district: 'Kreis',
            districtAgency: 'Kreisverwaltung',
            collectiveMunicipality: 'Gemeindeverband',
            municipality: 'Stadt',
            municipalityAgency: 'Stadtverwaltung',
            business: 'Unternehmen',
            civilSociety: 'Zivilgesellschaft',
            research: 'Forschung',
            religiousCommunity: 'Religionsgemeinschaft',
        },
        en: {
            international: 'International',
            supranational: 'Europe',
            supranationalAgency: 'European authority',
            country: 'Country',
            countryAgency: 'Country authority',
            federal: 'Federal',
            federalAgency: 'Federal agency',
            state: 'State',
            stateAgency: 'State authority',
            state_municipality: 'State and municipality',
            governmentRegion: 'Government region',
            regionalNetwork: 'Regional network',
            district: 'District',
            districtAgency: 'District authority',
            collectiveMunicipality: 'Collective municipality',
            municipality: 'Municipality',
            municipalityAgency: 'Municipal authority',
            business: 'Business',
            civilSociety: 'Civil society',
            research: 'Research',
            religiousCommunity: 'Religious Community',
        },
    };

    function init() {
//        var lang = nav ? nav.lang : 'de';
        var lang = 'de';

        layers['international'] = dict[lang].international;
        layers['supranational'] = dict[lang].supranational;
        layers['supranationalAgency'] = dict[lang].supranationalAgency;
        layers['country'] = dict[lang].country;
        layers['countryAgency'] = dict[lang].countryAgency;
        layers['federal'] = dict[lang].federal;
        layers['federalAgency'] = dict[lang].federalAgency;
        layers['state'] = dict[lang].state;
        layers['stateAgency'] = dict[lang].stateAgency;
        layers['state+municipality'] = dict[lang].state_municipality;
        layers['governmentRegion'] = dict[lang].governmentRegion;
        layers['regionalNetwork'] = dict[lang].regionalNetwork;
        layers['district'] = dict[lang].district;
        layers['districtAgency'] = dict[lang].districtAgency;
        layers['collectiveMunicipality'] = dict[lang].collectiveMunicipality;
        layers['municipality'] = dict[lang].municipality;
        layers['municipalityAgency'] = dict[lang].municipalityAgency;
        layers['business'] = dict[lang].business;
        layers['civilSociety'] = dict[lang].civilSociety;
        layers['research'] = dict[lang].research;
        layers['religiousCommunity'] = dict[lang].religiousCommunity;
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

        if (table && table.flatten) {
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
                ret = dict[nav.lang][key];
            }
        });
        if (ret !== '') {
            return ret;
        }

        if ((type === 'state+municipality') || (type === 'municipality+state')) {
            return dict[nav.lang].state_municipality;
        } else if (type !== '') {
            return '?';
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

                typeStr = funcGetTypeString(type);
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
        var sameAs = catalog.getSameAs(catalog.id);
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

        if (map) {
            map.update();
        }
        system.update();
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

    function setDate(theDate) {
        displayDate = theDate;

        if (date) {
            date.update();
        }

        data.emitFilterChanged();
    }

    function setLoadingDate(loadingDate) {
//        var dateString = loadingDate.toISOString().split('T')[0];
        var dateString = loadingDate.toLocaleString('sv-SE').split(' ')[0];
        var uri = baseURL + 'data-' + dateString.split('-')[0] + '/' + dateString + '-organizations.json';

        dateToLoad = dateString;
        uriToLoad = uri;
    }

    function store(payload) {
        assets[dateToLoad] = payload;
        data.loadedDays = Object.keys(assets).length;

        if (data.loadedDays === 1) {
            setDate(dateToLoad);
            catalog.set(catalog.id); // <-  this is a hack
        } else {
            catalog.update();
        }

        var current = new Date(dateToLoad);
        current.setDate(current.getDate() - 1);

        setLoadingDate(current); 

        dispatchEventStartLoading(dateToLoad);

        if (charthistory) {
            charthistory.update();
        }

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
                charthistory.update();
            }
        }

        var start = new Date(Date.now());
        var current = new Date(dateToLoad);
        var diffs = start.getTime() - current.getTime();
        var days = Math.ceil(diffs / (1000 * 3600 * 24));

        if (days <= loadDays) {
            xhr.send();
        } else {
            dispatchEventEndLoading();

            if (date) {
                date.update();
            }
            if (charthistory) {
                charthistory.update();
            }
        }
    }

    function funcLoadData(maxDays) {
        data.loadedDays = 0;
        data.initalDays = maxDays;
        loadDays = maxDays;

        setLoadingDate(new Date(Date.now()));
        dispatchEventStartLoading(dateToLoad);

        load();
    }

    function funcLoadMoreData(days) {
        data.loadedDays = 0;

        var current = new Date(Date.now());
        current.setDate(current.getDate() - loadDays);

        loadDays += days;

        setLoadingDate(current);
        dispatchEventStartLoading(dateToLoad);

        load();
    }

    function funcRemoveLoadedData() {
        while (Object.keys(assets).length > data.initalDays) {
            var current = new Date(dateToLoad);
            current.setDate(current.getDate() + 1);
            setLoadingDate(current);

            delete assets[dateToLoad];
        }

        data.loadedDays = Object.keys(assets).length;
        loadDays = Object.keys(assets).length;

        catalog.update();
        date.update();
        charthistory.update();
    }

    function funcGetPortalTitle(id) {
        return id;
    }

    init();

    return {
        addEventListenerStartLoading: funcAddEventListenerStartLoading,
        addEventListenerEndLoading: funcAddEventListenerEndLoading,
        emitFilterChanged: funcEmitFilterChanged,
        get: funcGet,
        getDate: funcGetDate,
        getDisplayDate: funcGetDisplayDate,
        getPortalTitle: funcGetPortalTitle,
        getTypeString: funcGetTypeString,
        has: funcHas,
        initalDays: 0,
        isHVD: false,
        layers: layers,
        loadData: funcLoadData,
        loadedDays: 0,
        loadMoreData: funcLoadMoreData,
        removeLoadedData: funcRemoveLoadedData,
        view: view,
        viewHeader: viewHeader,
    };
}());