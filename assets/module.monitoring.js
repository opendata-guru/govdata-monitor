var monitoring = (function () {
    var baseURL = 'https://opendata.guru/govdata/assets/',
        uriToLoad = '';
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var assets = [];

    function init() {
    }

    function funcAddEventListenerStartLoading(func) {
        eventListenerStartLoading.push(func);
    }

    function funcAddEventListenerEndLoading(func) {
        eventListenerEndLoading.push(func);
    }

    function dispatchEventStartLoading(value) {
        eventListenerStartLoading.forEach((func) => func(value));
    }

    function dispatchEventEndLoading() {
        eventListenerEndLoading.forEach((func) => func());
    }

    function setLoadingDate(loadingDate) {
        var dateString = loadingDate.toISOString().split('T')[0];
        var uri = baseURL + 'monitoring-' + dateString.split('-')[0] + '/' + dateString + '.json';

        uriToLoad = uri;
    }

    function store(payload) {
        assets = payload;

        dispatchEventEndLoading();
    }

    function load() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriToLoad, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                store(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                dispatchEventEndLoading();
            }
        }

        xhr.send();
    }

    function funcLoadData() {
        setLoadingDate(new Date(Date.now()));

        dispatchEventStartLoading('monitoring');

        load();
    }

    function funcGet(link) {
        var ret = null;

        assets.errors.forEach(error => {
            if (error.object === link) {
                ret = error;
            }
        });

        return ret;
    }

    init();

    return {
        addEventListenerStartLoading: funcAddEventListenerStartLoading,
        addEventListenerEndLoading: funcAddEventListenerEndLoading,
        get: funcGet,
        loadData: funcLoadData,
    };
}());