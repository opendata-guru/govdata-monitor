var monitoring = (function () {
    var uriPIssues = 'https://opendata.guru/api/2/p/issues/today',
        uriPIssuesAlt = 'https://opendata.guru/api/2/p/issues/yesterday';
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var pIssues = [];

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

    function storePIssues(payload) {
        pIssues = payload;

        dispatchEventEndLoading();
    }

    function loadPIssues() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriPIssues, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storePIssues(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                if (uriPIssues === uriPIssuesAlt) {
                    dispatchEventEndLoading();
                } else {
                    uriPIssues = uriPIssuesAlt;
                    loadPIssues();
                }
            }
        }

        xhr.send();
    }

    function funcLoadData() {
        dispatchEventStartLoading('monitoring');

        loadPIssues();
    }

    function funcGet(pObject) {
        var pid = pObject.pid;

        if (pIssues[pid]) {
            return pIssues[pid];
        }

        return null;
    }

    init();

    return {
        addEventListenerStartLoading: funcAddEventListenerStartLoading,
        addEventListenerEndLoading: funcAddEventListenerEndLoading,
        get: funcGet,
        loadData: funcLoadData,
    };
}());