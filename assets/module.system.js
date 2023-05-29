var system = (function () {
    var baseURL = 'https://opendata.guru/govdata/assets/',
        dateToLoad = '',
        uriToLoad = '';
    var assets = [];
    var idLoadingLabel = 'loading-description',
        classNameLoadingCard = 'card-loading',
        classNameBreadcrumbTitle = 'card-breadcrumb-and-catalog-title';

    function init() {
    }

    function setLoadingDate(loadingDate) {
        var dateString = loadingDate.toISOString().split('T')[0];
        var uri = baseURL + 'data-' + dateString.split('-')[0] + '/' + dateString + '-systems.json';

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
        assets = payload;

        showDateDone();
    }

    function load() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriToLoad, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                store(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                showDateDone();
            }
        }

        xhr.send();
    }

    init();

    document.addEventListener('DOMContentLoaded', function() {
        setLoadingDate(new Date(Date.now()));
        showDate();

        load();
    });

    return {
    };
}());