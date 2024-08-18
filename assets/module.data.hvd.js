var data = (function () {
    var uriHVDStatistics = 'https://opendata.guru/api/2/hvd/statistics/',
        dateToLoad = '',
        uriToLoad = '';
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var assets = [],
        view = [],
        viewHeader = [],
        loadDays = 0,
        displayDate = '';

    function init() {
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

        view.sort((a, b) => {
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

        data.view = view;
        data.viewHeader = viewHeader;
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
        var uri = uriHVDStatistics + dateString;

        dateToLoad = dateString;
        uriToLoad = uri;
    }

    function store(payload) {
        assets[dateToLoad] = payload;
        data.loadedDays = Object.keys(assets).length;

        if (data.loadedDays === 1) {
            setDate(dateToLoad);
//            catalog.set(catalog.id); // <-  this is a hack
        } else {
//            catalog.update();
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

    init();

    return {
        addEventListenerStartLoading: funcAddEventListenerStartLoading,
        addEventListenerEndLoading: funcAddEventListenerEndLoading,
        emitFilterChanged: funcEmitFilterChanged,
        get: funcGet,
        getDate: funcGetDate,
        getDisplayDate: funcGetDisplayDate,
        has: funcHas,
        initalDays: 0,
        isHVD: true,
        loadData: funcLoadData,
        loadedDays: 0,
        loadMoreData: funcLoadMoreData,
        removeLoadedData: funcRemoveLoadedData,
        view: view,
        viewHeader: viewHeader,
    };
}());