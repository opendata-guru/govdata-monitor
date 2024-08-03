var dataHVD = (function () {
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
        var datasetCount = undefined;
        var distributionCount = undefined;
        var lastCount = undefined;
        var maxDiff = 0;

        arrayData.forEach(processData => {
            var dataObj = processData ? processData.filter(item => item.catalogURI === catalogURI) : [];
            var highlight = false;

            if (dataObj.length > 0) {
                var obj = dataObj[0];
                var currentCount = parseInt(obj.datasets ? obj.datasets : 0, 10);

                if (obj.sObject) {
                    title = obj.sObject.title.en ? obj.sObject.title.en : obj.sObject.title.de;
                    sid = obj.sObject.sid;
                } else {
                    title = obj.catalogURI.split('/').slice(-1)[0];
                }

                if (lastCount !== undefined) {
                    var difference = lastCount === null ? currentCount : Math.abs(lastCount - currentCount);
                    maxDiff = Math.max(maxDiff, difference);
//                    highlight = diff.highlight && (difference >= diff.threshold);
                }

                lastCount = currentCount;
            } else {
                var highlight = false;

                if ((lastCount !== undefined) && (lastCount !== null)) {
                    var difference = lastCount;
                    maxDiff = Math.max(maxDiff, difference);
//                    highlight = diff.highlight && (difference >= diff.threshold);
                }

                lastCount = null;
            }

            packages.push({
                count: lastCount,
                highlight: highlight
            });
        });

        if (diff && diff.hideEqual && (arrayData.length > 1) && (maxDiff < diff.threshold)) {
            return;
        }

        view.push({
            cols: packages,
            datasetCount: datasetCount,
            distributionCount: distributionCount,
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
            selection.push(dataHVD.getDisplayDate());
        }

        view = [];
        viewHeader = [];

        for (d = 0; d < selection.length; ++d) {
            var selectedDate = selection[d];
            viewHeader.push(selectedDate);
            arrayData.push(dataHVD.getDate(selectedDate));

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

        view.sort((a, b) => {
            if (a.cols[0].count < b.cols[0].count) {
                return 1;
            } else if (a.cols[0].count > b.cols[0].count) {
                return -1;
            }

            if (a.title < b.title) {
                return -1;
            } else if (a.title > b.title) {
                return 1;
            }
            return 0;
        });

        dataHVD.view = view;
        dataHVD.viewHeader = viewHeader;
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

        dataHVD.emitFilterChanged();
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
        dataHVD.loadedDays = Object.keys(assets).length;

        if (dataHVD.loadedDays === 1) {
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
        dataHVD.loadedDays = 0;
        dataHVD.initalDays = maxDays;
        loadDays = maxDays;

        setLoadingDate(new Date(Date.now()));
        dispatchEventStartLoading(dateToLoad);

        load();
    }

    function funcLoadMoreData(days) {
        dataHVD.loadedDays = 0;

        var current = new Date(Date.now());
        current.setDate(current.getDate() - loadDays);

        loadDays += days;

        setLoadingDate(current);
        dispatchEventStartLoading(dateToLoad);

        load();
    }

    function funcRemoveLoadedData() {
        while (Object.keys(assets).length > dataHVD.initalDays) {
            var current = new Date(dateToLoad);
            current.setDate(current.getDate() + 1);
            setLoadingDate(current);

            delete assets[dateToLoad];
        }

        dataHVD.loadedDays = Object.keys(assets).length;
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
        loadData: funcLoadData,
        loadedDays: 0,
        loadMoreData: funcLoadMoreData,
        removeLoadedData: funcRemoveLoadedData,
        view: view,
        viewHeader: viewHeader,
    };
}());