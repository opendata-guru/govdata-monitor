var system = (function () {
    var baseURL = 'https://opendata.guru/govdata/assets/',
        uriToLoad = '',
        systemId = null;
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var idSystemBody = 'system-body';
    var assets = [];

    function init() {
    }

    function funcAddEventListenerStartLoading(func) {
        eventListenerStartLoading.push(func);
    }

    function funcAddEventListenerEndLoading(func) {
        eventListenerEndLoading.push(func);
    }

    function dispatchEventStartLoading() {
        eventListenerStartLoading.forEach((func) => func());
    }

    function dispatchEventEndLoading() {
        eventListenerEndLoading.forEach((func) => func());
    }

    function setLoadingDate(loadingDate) {
        var dateString = loadingDate.toISOString().split('T')[0];
        var uri = baseURL + 'data-' + dateString.split('-')[0] + '/' + dateString + '-systems.json';

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

        dispatchEventStartLoading();

        load();
    }

    function getSystem(catalogId) {
        var catalogObj = catalog.get(catalogId);
        var ret = null;
        // contributor, gml, link, title, type, wikidata

        assets.forEach(asset => {
            if (asset.link === catalogObj.link) {
                ret = asset;
            }
        });

        return ret;
    }

    function format(key, value) {
        return '<div class="font-monospace"><span class="fw-bold">' + key + ':</span> ' + value + '</div>';
    }

    function formatScroll(key, value) {
        return '<div class="font-monospace" style="overflow-y:scroll;max-height:3.25rem;"><span class="fw-bold">' + key + ':</span> ' + value + '</div>';
    }

    function formatLink(key, value, link) {
        return '<div class="font-monospace"><span class="fw-bold">' + key + ':</span> <a href="' + link + '" target="_blank">' + value + '</a></div>';
    }

    function funcUpdate() {
        if (systemId === catalog.id) {
            return;
        }
        systemId = catalog.id;

        var sys = getSystem(systemId);
        var body = '';

        if (sys) {
            body += format('Title', sys.title);
            body += format('Type', sys.type);
            body += formatLink('Wikidata', sys.wikidata, 'https://www.wikidata.org/wiki/' + sys.wikidata);
            if (sys.server) {
                body += format('System', sys.server.system + ', version ' + sys.server.version);
                body += formatLink('API', sys.server.url, sys.server.url);
                if (sys.server.extensions.length > 0) {
                    body += formatScroll('Extensions', sys.server.extensions.join(', '));
                } else {
                    body += formatScroll('Extensions', JSON.stringify(sys.server.extensions));
                }
            }
        }

        document.getElementById(idSystemBody).innerHTML = body;
    }

    init();

    return {
        addEventListenerStartLoading: funcAddEventListenerStartLoading,
        addEventListenerEndLoading: funcAddEventListenerEndLoading,
        loadData: funcLoadData,
        update: funcUpdate,
    };
}());