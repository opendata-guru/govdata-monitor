var system = (function () {
    var baseURL = 'https://opendata.guru/govdata/assets/',
        uriToLoad = '',
        systemId = null;
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var idSystemBody = 'system-body',
        idImage1 = 'image-1',
        idImage2 = 'image-2',
        idImage3 = 'image-3';
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

    function loadSPARQL(qid) {
        var endpointUrl = 'https://query.wikidata.org/sparql';
        var sparqlQuery = 'SELECT ' +
            '?item ' +
            '(SAMPLE(?photo1) as ?photo1) ' +
            '(SAMPLE(?photo2) as ?photo2) ' +
            '(SAMPLE(?photo3) as ?photo3) ' +
            '' +
            'WHERE {' +
            '  BIND(wd:' + qid + ' as ?item)' +
            '' +
            '  OPTIONAL { ?item wdt:P18 ?photo1. }' +
            '  BIND(IF( BOUND( ?photo1), ?photo1, "") AS ?photo1)' +
            '' +
            '  OPTIONAL { ?item wdt:P18 ?photo2. FILTER ( ?photo1 != ?photo2) }' +
            '  BIND(IF( BOUND( ?photo2), ?photo2, "") AS ?photo2)' +
            '' +
            '  OPTIONAL { ?item wdt:P18 ?photo3. FILTER ( ?photo1 != ?photo3) FILTER ( ?photo2 != ?photo3) }' +
            '  BIND(IF( BOUND( ?photo3), ?photo3, "") AS ?photo3)' +
            '}' +
            'GROUP BY ?item';

        var uri = endpointUrl + '?query=' + encodeURIComponent(sparqlQuery);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', uri, true);

        xhr.setRequestHeader('Accept', 'application/sparql-results+json');
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var res = JSON.parse(this.responseText);
                var values = res.results.bindings[0];
                var photo1 = values.photo1.value;
                var photo2 = values.photo2.value;
                var photo3 = values.photo3.value;

                document.getElementById(idImage1).src = photo1;
                document.getElementById(idImage2).src = photo2;
                document.getElementById(idImage3).src = photo3;
            } else if (this.readyState == 4) {
                document.getElementById(idImage1).src = '';
                document.getElementById(idImage2).src = '';
                document.getElementById(idImage3).src = '';
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

    function formatImage(number) {
        return '<img src="" id="' + idImage1.slice(0, -1) + number + '" style="height:6rem">';
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
            body += '<div class="font-monospace"><span class="fw-bold">Images:</span>';
            body += formatImage(1);
            body += formatImage(2);
            body += formatImage(3);
            body += '</div>';

            loadSPARQL(sys.wikidata);
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