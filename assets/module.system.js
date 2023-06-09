var system = (function () {
    var baseURL = 'https://opendata.guru/govdata/assets/',
        uriToLoad = '',
        systemId = null;
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var idSystemBody = 'system-body',
        idSystemImage = 'system-image',
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
            '(SAMPLE(?logo) as ?logo) ' +
            '(SAMPLE(?map) as ?map) ' +
            '(SAMPLE(?flag) as ?flag) ' +
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
            '' +
            '  OPTIONAL { ?item wdt:P154 ?logo. }' +
            '  BIND(IF( BOUND( ?logo), ?logo, "") AS ?logo)' +
            '' +
            '  OPTIONAL { ?item wdt:P242 ?map. }' +
            '  BIND(IF( BOUND( ?map), ?map, "") AS ?map)' +
            '' +
            '  OPTIONAL { ?item wdt:P41 ?flag. }' +
            '  BIND(IF( BOUND( ?flag), ?flag, "") AS ?flag)' +
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
                var photos = [];

                photos.push(values.photo1.value);
                photos.push(values.photo2.value);
                photos.push(values.photo3.value);
                photos.push(values.logo.value);
                photos.push(values.map.value);
                photos.push(values.flag.value);
                photos = photos.filter(n => n);

                document.getElementById(idImage1).src = photos.length > 0 ? photos[0] : '';
                document.getElementById(idImage2).src = photos.length > 1 ? photos[1] : '';
                document.getElementById(idImage3).src = photos.length > 2 ? photos[2] : '';
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
        return '<img src="" id="' + idImage1.slice(0, -1) + number + '" style="height:8rem">';
    }

    function formatButton(key, link) {
        return '<div class=""><a href="' + link + '" style="text-align:center;display:inline-block;" target="_blank"><span style="display:block;width:3rem;height:3rem;border-radius:3rem;line-height:3rem;text-align:center;margin:auto;" class="bg-secondary text-white">' + key.substring(0, 1) + '</span>' + key + '</a></div>';
    }

    function funcUpdate() {
        if (systemId === catalog.id) {
            return;
        }
        systemId = catalog.id;

        var catalogObj = catalog.get(systemId);
        var sys = getSystem(systemId);
        var body = '';
        var images = '';
        var title = sys ? sys.title : catalogObj.title;
        var wikidata = sys ? sys.wikidata : catalogObj.wikidata;
        var type = data.getTypeString(sys ? sys.type : catalogObj.type);

        body += '<h1 class="fw-light fs-3">' + title + '</h1>';
        body += '<div>' + type + '</div>';
        body += '<div class="mb-2"></div>';

        if (wikidata) {
            body += formatButton('Wikidata', 'https://www.wikidata.org/wiki/' + wikidata);
        }

        if (sys) {
            if (sys.server) {
                body += format('System', sys.server.system + ', version ' + sys.server.version);
                body += formatLink('API', sys.server.url, sys.server.url);
                if (sys.server.extensions.length > 0) {
                    body += formatScroll('Extensions', sys.server.extensions.join(', '));
                } else {
                    body += formatScroll('Extensions', JSON.stringify(sys.server.extensions));
                }
            }

            images += formatImage(1);
            images += formatImage(2);
            images += formatImage(3);

            loadSPARQL(sys.wikidata);
        }

        document.getElementById(idSystemImage).innerHTML = images;
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