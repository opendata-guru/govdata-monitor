var data = (function () {
    var baseURL = 'https://opendata.guru/govdata/assets/',
        dateToLoad = '',
        uriToLoad = '';
    var assets = [];
    var idLoadingLabel = 'loading-description',
        classNameLoadingCard = 'card-loading',
        classNameBreadcrumbTitle = 'card-breadcrumb-and-catalog-title';

    function init() {
    }

    function funcEmitFilterChanged() {
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

    function showDate() {
        var text = '';
        text += '<span class="text-secondary">Loading data ... </span>';
        text += '<span class="text-info"> <i class="mdi mdi-arrow-bottom-right"></i> ' + dateToLoad + ' </span>';

        document.getElementById(idLoadingLabel).innerHTML = text;

        document.getElementsByClassName(classNameBreadcrumbTitle)[0].style.display = 'none';
        document.getElementsByClassName(classNameLoadingCard)[0].style.display = 'block';
    }

    function showDateDone() {
        document.getElementsByClassName(classNameLoadingCard)[0].style.display = 'none';
        document.getElementsByClassName(classNameBreadcrumbTitle)[0].style.display = 'block';
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

        showDate();
        load();
    }

    function load() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriToLoad, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                store(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                showDateDone();
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
            showDateDone();
            date.update();
            monitorUpdateCatalogHistoryChart();
        }
    }

    init();

    document.addEventListener('DOMContentLoaded', function() {
        setLoadingDate(new Date(Date.now()));
        showDate();

        load();
    });

    return {
        emitFilterChanged: funcEmitFilterChanged,
        get: funcGet,
        getDate: funcGetDate,
        has: funcHas,
    };
}());