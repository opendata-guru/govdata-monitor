var data = (function () {
    var uriHVDStatistics = 'https://opendata.guru/api/2/hvd/statistics/',
        uriHVDChanges = 'https://opendata.guru/api/2/hvd/accessurls/{date}/change',
        dateToLoad = '',
        dateToLoadChanges = '',
        uriToLoad = '';
        uriToLoadChanges = '';
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var assets = [],
        assetsChange = [],
        view = [],
        viewHeader = [],
        loadDays = 0,
        displayDate = '';
    var portalMapping = {
        'data-gv-at':        {de: 'Österreich',  en: 'Austria'},
        'data-gov-be':       {de: 'Belgien',     en: 'Belgium'},
        'bg':{de: 'Bulgarien', en: 'Bulgaria'},
        'hr':{de: 'Kroatien', en: 'Croatia'},
        'cy':{de: 'Zypern', en: 'Cyprus'},
        'nkod-opendata-cz':  {de: 'Tschechien',  en: 'Czechia'},
        'dk':{de: 'Dänemark', en: 'Denmark'},
        'ee':{de: 'Estland', en: 'Estonia'},
        'fi':{de: 'Finnland', en: 'Finland'},
        'plateforme-ouverte-des-donnees-publiques-francaises':{de: 'Frankreich', en: 'France'},
        'govdata':           {de: 'Deutschland', en: 'Germany'},
        'gr':{de: 'Griechenland', en: 'Greece'},
        'hu':{de: 'Ungarn', en: 'Hungary'},
        'data-gov-ie':       {de: 'Irland',      en: 'Ireland'},
        'it':{de: 'Italien', en: 'Italy'},
        'lv':{de: 'Lettland', en: 'Latvia'},
        'data-gov-lt':       {de: 'Litauen',     en: 'Lithuania'},
        'lu':{de: 'Luxemburg', en: 'Luxembourg'},
        'mt':{de: 'Malta', en: 'Malta'},
        'nl':{de: 'Niederlande', en: 'Netherlands'},
        'pl':{de: 'Polen', en: 'Poland'},
        'pt':{de: 'Portugal', en: 'Portugal'},
        'ro':{de: 'Rumänien', en: 'Romania'},
        'sk':{de: 'Slowakei', en: 'Slovakia'},
        'si':{de: 'Slowenien', en: 'Slovenia'},
        'es':{de: 'Spanien', en: 'Spain'},
        'oppnadata':         {de: 'Schweden',    en: 'Sweden'},
    };

    function init() {
        setLoadingDateChanges(new Date(Date.now()));
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

    function analyzeRow(arrayData, catalogURI) {
        var sid = null;
        var title = '';
        var packages = [];
        var lastDatasetCount = undefined;
        var maxDiff = 0;

        arrayData.forEach(processData => {
            var dataObj = processData ? processData.filter(item => item.catalogURI === catalogURI) : [];
            var currentDistributionCount = null;
            var currentDataServiceCount = null;
            var currentLicenseCount = null;
            var highlight = false;

            if (dataObj.length > 0) {
                var obj = dataObj[0];

                var currentDatasetCount = parseInt(obj.datasets ? obj.datasets : 0, 10);
                currentDistributionCount = parseInt(obj.distributions ? obj.distributions : 0, 10);
                currentDataServiceCount = parseInt(obj.dataservices ? obj.dataservices : 0, 10);
                currentLicenseCount = obj.licenses ? obj.licenses : {};

                if (obj.sObject) {
                    title = obj.sObject.title.en ? obj.sObject.title.en : obj.sObject.title.de;
                    sid = obj.sObject.sid;
                } else {
                    title = obj.catalogURI.split('/').slice(-1)[0];
                }

                if (lastDatasetCount !== undefined) {
                    var difference = lastDatasetCount === null ? currentDatasetCount : Math.abs(lastDatasetCount - currentDatasetCount);
                    maxDiff = Math.max(maxDiff, difference);
//                    highlight = diff.highlight && (difference >= diff.threshold);
                }

                lastDatasetCount = currentDatasetCount;
            } else {
                var highlight = false;

                if ((lastDatasetCount !== undefined) && (lastDatasetCount !== null)) {
                    var difference = lastDatasetCount;
                    maxDiff = Math.max(maxDiff, difference);
//                    highlight = diff.highlight && (difference >= diff.threshold);
                }

                lastDatasetCount = null;
            }

            packages.push({
                count: lastDatasetCount, // depricated
                datasetCount: lastDatasetCount,
                distributionCount: currentDistributionCount,
                dataServiceCount: currentDataServiceCount,
                licenseCount: currentLicenseCount,
                highlight: highlight
            });
        });

        if (diff && diff.hideEqual && (arrayData.length > 1) && (maxDiff < diff.threshold)) {
            return;
        }

        var last = packages.slice(-1)[0];
        view.push({
            cols: packages,
            datasetCount: last.datasetCount,
            distributionCount: last.distributionCount,
            dataServiceCount: last.dataServiceCount,
            sid: sid,
            title: title,
            linkId: 'http://data.europa.eu/88u/catalogue/' + title, // temp for chartsupplier
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
                    if (rows.indexOf(row.catalogURI) < 0) {
                        rows.push(row.catalogURI);
                    }
                });
            }
        }

        if (rows.length > 0) {
            rows.forEach((catalogURI) => analyzeRow(arrayData, catalogURI));
        }

        view = view.filter((item) => 0 < item.cols.reduce((partialSum, a) => partialSum + a.datasetCount + a.distributionCount + a.dataServiceCount, 0));

        data.view = view;
        data.viewHeader = viewHeader;

        funcSortByDatasets();
    }

    function funcSortByDatasets() {
        data.view.sort((a, b) => {
            if (a.datasetCount < b.datasetCount) {
                return 1;
            } else if (a.datasetCount > b.datasetCount) {
                return -1;
            }

            if (a.title < b.title) {
                return -1;
            } else if (a.title > b.title) {
                return 1;
            }
            return 0;
        });
    }

    function funcSortByDistributions() {
        data.view.sort((a, b) => {
            if (a.distributionCount < b.distributionCount) {
                return 1;
            } else if (a.distributionCount > b.distributionCount) {
                return -1;
            }

            if (a.title < b.title) {
                return -1;
            } else if (a.title > b.title) {
                return 1;
            }
            return 0;
        });
    }

    function funcSortByDataServices() {
        data.view.sort((a, b) => {
            if (a.distributionCount < b.distributionCount) {
                return 1;
            } else if (a.distributionCount > b.distributionCount) {
                return -1;
            }

            if (a.title < b.title) {
                return -1;
            } else if (a.title > b.title) {
                return 1;
            }
            return 0;
        });
    }

    function funcEmitFilterChanged() {
        createView();

        tableHVD.update();

        if (charthistory) {
            charthistory.update();
        }
    }

    function funcGet() {
        return assets[displayDate];
    }

    function funcGetDate(dateString) {
        return assets[dateString]
    }

    function funcGetChangesDate() {
        return dateToLoadChanges;
    }

    function funcGetDisplayDate() {
        return displayDate;
    }

    function funcGetChanges() {
        return assetsChange;
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
        var uri = uriHVDStatistics + dateString;

        dateToLoad = dateString;
        uriToLoad = uri;
    }

    function funcAddChangesDate(diff) {
        var current = new Date(dateToLoadChanges);
        current.setDate(current.getDate() + diff);

        setLoadingDateChanges(current);
    }

    function setLoadingDateChanges(loadingDate) {
        var dateString = loadingDate.toLocaleString('sv-SE').split(' ')[0];
        var uri = uriHVDChanges.replace('{date}', dateString);

        dateToLoadChanges = dateString;
        uriToLoadChanges = uri;
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

    function storeChanges(payload) {
        assetsChange = payload;
    }

    function load() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriToLoad, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                store(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                if (data.loadedDays === 0) {
                    var current = new Date(Date.now());
                    var dateString = current.toLocaleString('sv-SE').split(' ')[0];

                    if (dateString === dateToLoad) {
                        // data of today not finished yet
                        current.setDate(current.getDate() - 1);
                        setLoadingDate(current); 
                        dispatchEventStartLoading(dateToLoad);

                        load();

                        return;
                    }
                }

                loadChanges();

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
            loadChanges();

            if (date) {
                date.update();
            }
            if (charthistory) {
                charthistory.update();
            }
        }
    }

    function loadChanges() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriToLoadChanges, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storeChanges(JSON.parse(this.responseText));
                dispatchEventEndLoading();
            } else if (this.readyState == 4) {
                dispatchEventEndLoading();
            }
        }

        xhr.send();
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
        var title = portalMapping[id];
        if (title) {
            return title[nav.lang];
        }

        return id;
    }

    function funcGetPortalTitleList() {
        return JSON.parse(JSON.stringify(portalMapping));
    }

    init();

    return {
        addChangesDate: funcAddChangesDate,
        addEventListenerStartLoading: funcAddEventListenerStartLoading,
        addEventListenerEndLoading: funcAddEventListenerEndLoading,
        emitFilterChanged: funcEmitFilterChanged,
        get: funcGet,
        getDate: funcGetDate,
        getChangesDate: funcGetChangesDate,
        getDisplayDate: funcGetDisplayDate,
        getChanges: funcGetChanges,
        getPortalTitle: funcGetPortalTitle,
        getPortalTitleList: funcGetPortalTitleList,
        has: funcHas,
        initalDays: 0,
        isHVD: true,
        loadData: funcLoadData,
        loadedDays: 0,
        loadMoreData: funcLoadMoreData,
        loadMoreChangesDate: loadChanges,
        removeLoadedData: funcRemoveLoadedData,
        sortByDataServices: funcSortByDataServices,
        sortByDatasets: funcSortByDatasets,
        sortByDistributions: funcSortByDistributions,
        view: view,
        viewHeader: viewHeader,
    };
}());