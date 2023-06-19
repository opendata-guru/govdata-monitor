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
        idImage3 = 'image-3',
        idLogo1 = 'logo-1',
        idLogo2 = 'logo-2',
        idWikipedia = 'linkWikipedia';
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
//        var lang = 'en';
        var lang = 'de';
        var sparqlQuery = 'SELECT ' +
            '?item ' +
            '(SAMPLE(?photo1) as ?photo1) ' +
            '(SAMPLE(?photo2) as ?photo2) ' +
            '(SAMPLE(?photo3) as ?photo3) ' +
            '(SAMPLE(?logo) as ?logo) ' +
            '(SAMPLE(?map) as ?map) ' +
            '(SAMPLE(?flag) as ?flag) ' +
            '(SAMPLE(?coat) as ?coat) ' +
            '(SAMPLE(?article) as ?article) ' +
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
            '' +
            '  OPTIONAL { ?item wdt:P94 ?coat. }' +
            '  BIND(IF( BOUND( ?coat), ?coat, "") AS ?coat)' +
            '' +
            '  OPTIONAL {' +
            '    ?article schema:about ?item .' +
            '    ?article schema:inLanguage "' + lang + '" .' +
            '    ?article schema:isPartOf <https://' + lang + '.wikipedia.org/> .' +
            '  }' +
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
                var images = [];
                var logos = [];

                images.push(values.photo1.value);
                images.push(values.photo2.value);
                images.push(values.photo3.value);
                images.push(values.map.value);
                images = images.filter(n => n);

                logos.push(values.flag.value);
                logos.push(values.coat.value);
                logos.push(values.logo.value);
                logos = logos.filter(n => n);

                document.getElementById(idImage1).src = images.length > 0 ? images[0] : '';
                document.getElementById(idImage2).src = images.length > 1 ? images[1] : '';
                document.getElementById(idImage3).src = images.length > 2 ? images[2] : '';
                document.getElementById(idLogo1).src = logos.length > 0 ? logos[0] : '';
                document.getElementById(idLogo2).src = logos.length > 1 ? logos[1] : '';
                document.getElementById(idWikipedia).href = values.article.value;
            } else if (this.readyState == 4) {
                document.getElementById(idImage1).src = '';
                document.getElementById(idImage2).src = '';
                document.getElementById(idImage3).src = '';
                document.getElementById(idLogo1).src = '';
                document.getElementById(idLogo2).src = '';
                document.getElementById(idWikipedia).href = '';
            }
            document.getElementById(idImage1).style.display = document.getElementById(idImage1).getAttribute('src') == '' ? 'none' : 'inline-block';
            document.getElementById(idImage2).style.display = document.getElementById(idImage2).getAttribute('src') == '' ? 'none' : 'inline-block';
            document.getElementById(idImage3).style.display = document.getElementById(idImage3).getAttribute('src') == '' ? 'none' : 'inline-block';
            document.getElementById(idLogo1).style.display = document.getElementById(idLogo1).getAttribute('src') == '' ? 'none' : 'inline-block';
            document.getElementById(idLogo2).style.display = document.getElementById(idLogo2).getAttribute('src') == '' ? 'none' : 'inline-block';
            document.getElementById(idWikipedia).style.display = document.getElementById(idWikipedia).getAttribute('href') == '' ? 'none' : 'inline-block';
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
        return '<img src="" id="' + idImage1.slice(0, -1) + number + '" style="height:10rem;width:33%;object-fit:cover;display:none">';
    }

    function formatButton(key, link, id) {
        var addID = id ? ' id="' + id + '"' : '';
        return '<a href="' + link + '" style="text-align:center;display:inline-block;" target="_blank" class="me-3"' + addID + '><span style="display:block;width:3rem;height:3rem;border-radius:3rem;line-height:3rem;text-align:center;margin:auto;" class="bg-secondary text-white">' + key.substring(0, 1) + '</span>' + key + '</a>';
    }

    function funcUpdate() {
        if (systemId === catalog.id) {
            return;
        }
        systemId = catalog.id;

        var catalogObj = catalog.get(systemId);
        var sameAs = catalog.getSameAs(systemId);
        var sys = getSystem(systemId);
        var body = '';
        var images = '';
        var title = sys ? sys.title : catalogObj.title;
        var wikidata = sys ? sys.wikidata : catalogObj.wikidata;
        var type = data.getTypeString(sys ? sys.type : catalogObj.type);

        body += '<div class="border-bottom border-1 border-secondary mb-2 pb-2">';
        body += '<img src="" id="' + idLogo1 + '" style="height:3rem;width:50%;object-fit:contain;display:none">';
        body += '<img src="" id="' + idLogo2 + '" style="height:3rem;width:50%;object-fit:contain;display:none">';
        body += '</div>';
        body += '<h1 class="fw-light fs-3">' + title + '</h1>';
        body += '<div>' + type + '</div>';
        body += '<div class="mb-2"></div>';

        var datasetCount = catalogObj ? catalogObj.datasetCount : '';
        var minCount = (datasetCount === undefined) || (datasetCount === '') ? 9999999999 : datasetCount;
        var maxCount = (datasetCount === undefined) || (datasetCount === '') ? 0 : datasetCount;
        if (sameAs.length > 0) {
            sameAs.forEach((id) => {
                var sameAsObj = catalog.get(id);
                minCount = Math.min(minCount, sameAsObj.packages);
                maxCount = Math.max(maxCount, sameAsObj.packages);
            });
        }
        if (minCount === 0) {
            minCount = maxCount;
        }
        if (minCount === maxCount) {
            body += 'Has <strong>' + monitorFormatNumber(minCount) + '</strong> datasets';
        } else {
            body += 'Has <strong>' + monitorFormatNumber(minCount) + '</strong> to <strong>' + monitorFormatNumber(maxCount) + '</strong> datasets';
        }

        body += '<div class="border-bottom border-1 border-secondary my-3 pb-2">';
        if (wikidata) {
            body += formatButton('Wikipedia', '', idWikipedia);
            body += formatButton('Wikidata', 'https://www.wikidata.org/wiki/' + wikidata);
        }
        body += '</div>';

        if (sys && sys.server) {
            body += format('System', sys.server.system + ', version ' + sys.server.version);
            body += formatLink('API', sys.server.url, sys.server.url);
            if (sys.server.extensions.length > 0) {
                body += formatScroll('Extensions', sys.server.extensions.join(', '));
            } else {
                body += formatScroll('Extensions', JSON.stringify(sys.server.extensions));
            }
        }

        if (wikidata) {
            images += formatImage(1);
            images += formatImage(2);
            images += formatImage(3);

            loadSPARQL(wikidata);
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