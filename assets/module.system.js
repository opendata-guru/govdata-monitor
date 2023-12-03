var system = (function () {
    var baseURL = 'https://opendata.guru/govdata/assets/',
        uriToLoad = '',
        systemId = null;
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var idSystemBody = 'system-body',
        idCKANSystemsHead = 'ckan-systems-thead',
        idCKANSystemsBody = 'ckan-systems-tbody',
        idPiveauSystemsHead = 'piveau-systems-thead',
        idPiveauSystemsBody = 'piveau-systems-tbody',
        idODSSystemsHead = 'ods-systems-thead',
        idODSSystemsBody = 'ods-systems-tbody',
        idOtherSystemsHead = 'other-systems-thead',
        idOtherSystemsBody = 'other-systems-tbody',
        idImage1 = 'image-1',
//        idImage2 = 'image-2',
//        idImage3 = 'image-3',
        idLogo1 = 'logo-1',
        idLogo2 = 'logo-2',
        idWikipedia = 'linkWikipedia';
    var localDict = {
        noLinkFound: 'No link found',
        noOrganisationFound: 'No organisation found',
        duplicateOrganisationEntriesFound: 'Duplicate organisation entries found',
        couldNotCountDatasets: 'Could not count datasets',
    };
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
//            '(SAMPLE(?photo2) as ?photo2) ' +
//            '(SAMPLE(?photo3) as ?photo3) ' +
            '(SAMPLE(?banner) as ?banner) ' +
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
//            '  OPTIONAL { ?item wdt:P18 ?photo2. FILTER ( ?photo1 != ?photo2) }' +
//            '  BIND(IF( BOUND( ?photo2), ?photo2, "") AS ?photo2)' +
            '' +
//            '  OPTIONAL { ?item wdt:P18 ?photo3. FILTER ( ?photo1 != ?photo3) FILTER ( ?photo2 != ?photo3) }' +
//            '  BIND(IF( BOUND( ?photo3), ?photo3, "") AS ?photo3)' +
            '' +
            '  OPTIONAL { ?item wdt:P948 ?banner. }' +
            '  BIND(IF( BOUND( ?banner), ?banner, "") AS ?banner)' +
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

                images.push(values.banner.value);
                images.push(values.photo1.value);
//                images.push(values.photo2.value);
//                images.push(values.photo3.value);
                images.push(values.map.value);
                images = images.filter(n => n);

                logos.push(values.flag.value);
                logos.push(values.coat.value);
                logos.push(values.logo.value);
                logos = logos.filter(n => n);

                document.getElementById(idImage1).src = images.length > 0 ? images[0] : '';
//                document.getElementById(idImage2).src = images.length > 1 ? images[1] : '';
//                document.getElementById(idImage3).src = images.length > 2 ? images[2] : '';
                document.getElementById(idLogo1).src = logos.length > 0 ? logos[0] : '';
                document.getElementById(idLogo2).src = logos.length > 1 ? logos[1] : '';
                document.getElementById(idWikipedia).href = values.article ? values.article.value : '';
            } else if (this.readyState == 4) {
                document.getElementById(idImage1).src = '';
//                document.getElementById(idImage2).src = '';
//                document.getElementById(idImage3).src = '';
                document.getElementById(idLogo1).src = '';
                document.getElementById(idLogo2).src = '';
                document.getElementById(idWikipedia).href = '';
            }
            document.getElementById(idImage1).style.opacity = document.getElementById(idImage1).getAttribute('src') == '' ? 0 : 1;
//            document.getElementById(idImage2).style.opacity = document.getElementById(idImage2).getAttribute('src') == '' ? 0 : 1;
//            document.getElementById(idImage3).style.opacity = document.getElementById(idImage3).getAttribute('src') == '' ? 0 : 1;
            document.getElementById(idLogo1).style.opacity = document.getElementById(idLogo1).getAttribute('src') == '' ? 0 : 1;
            document.getElementById(idLogo2).style.opacity = document.getElementById(idLogo2).getAttribute('src') == '' ? 0 : 1;
            document.getElementById(idWikipedia).style.display = document.getElementById(idWikipedia).getAttribute('href') == '' ? 'none' : 'inline-block';
    }

        xhr.send();
    }

    function funcLoadData() {
        setLoadingDate(new Date(Date.now()));

        dispatchEventStartLoading();

        load();
    }

    function funcGet(catalogId) {
        var catalogObj = catalog.get(catalogId);
        var ret = null;
        // contributor, link, title, type, wikidata

        if (catalogObj) {
            assets.forEach(asset => {
                if (asset.link === catalogObj.link) {
                    ret = asset;
                }
            });
        }

        return ret;
    }

    function getId(system) {
        var dataObj = data.get();
        var ret = null;

        if (dataObj && system) {
            dataObj.forEach((row) => {
                if (row.link === system.link) {
                    ret = row.id;
                }
            });
        }

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

    function formatButton(key, link, id) {
        var addID = id ? ' id="' + id + '"' : '';
        return '<a href="' + link + '" style="text-align:center;display:inline-block;" target="_blank" class="me-3"' + addID + '><span style="display:block;width:3rem;height:3rem;border-radius:3rem;line-height:3rem;text-align:center;margin:auto;" class="bg-secondary text-white">' + key.substring(0, 1) + '</span>' + key + '</a>';
    }

    function formatExtensions(extensions) {
        var ret = '';

        if (extensions && (extensions.length > 0)) {
            var arr = [];
            var strBasics = '', strViews = '', strMaps = '', strMetadata = '';

            extensions.forEach(extension => {
                if ((-1 !== extension.indexOf('_view')) && (extension.indexOf('_view') === (extension.length - 5))) {
                    strViews += (strViews === '' ? '' : ', ') + extension;
                } else if (extension.endsWith('theme')) {
                    strViews = extension + (strViews === '' ? '' : ', ') + strViews;
                } else if (-1 !== ['spatial_metadata','spatial_query','spatial_harvest_metadata_api','navigablemap','choroplethmap'].indexOf(extension)) {
                    strMaps += (strMaps === '' ? '' : ', ') + extension;
                } else if (-1 !== ['harvest','ckan_harvester','stats','structured_data','resource_proxy','pages','datastore','datapusher','xloader','showcase'].indexOf(extension)) {
                    strBasics += (strBasics === '' ? '' : ', ') + extension;
                } else if (-1 !== ['dcat','dcatde','hro_dcatapde','dcat_json_harvester','dcat_json_interface','dcat_rdf_harvester','dcatde_rdf_harvester','scheming_datasets','scheming_groups','scheming_organizations'].indexOf(extension)) {
                    strMetadata += (strMetadata === '' ? '' : ', ') + extension;
                } else {
                    arr.push(extension);
                }
            });

            ret = '';
            if (strBasics !== '') {
                ret += '<span style="font-size:1.5rem">🧰</span> ' + strBasics + '<br>';
            }
            if (strViews !== '') {
                ret += '<span style="font-size:1.5rem">🎨</span> ' + strViews + '<br>';
            }
            if (strMaps !== '') {
                ret += '<span style="font-size:1.5rem">🗺️</span> ' + strMaps + '<br>';
            }
            if (strMetadata !== '') {
                ret += '<span style="font-size:1.5rem">*️⃣</span> ' + strMetadata + '<br>';
            }
            if (arr.length > 0) {
                ret += '<span style="font-size:1.5rem">🏴‍☠️</span> ' + arr.join(', ');
            }
        } else if (extensions === null) {
            ret += '-'
        } else {
            ret += JSON.stringify(extensions);
        }

        return ret;
    }

    function updateSingleSystem() {
        if (systemId === catalog.id) {
            return;
        }
        systemId = catalog.id;

        var elemBody = document.getElementById(idSystemBody);
        if (!elemBody) {
            return;
        }

        var catalogObj = catalog.get(systemId);
        var sameAs = catalog.getSameAs(systemId);
        var sys = funcGet(systemId);
        var body = '';
        var title = sys ? sys.title : catalogObj ? catalogObj.title : '';
        var wikidata = sys ? sys.wikidata : catalogObj ? catalogObj.wikidata : '';
        var type = data.getTypeString(sys ? sys.type : catalogObj ? catalogObj.type : '');

        body += '<div class="border-bottom border-1 border-secondary mb-2 pb-2">';
        body += '<img src="" id="' + idLogo1 + '" style="height:3rem;width:50%;object-fit:contain;opacity:0">';
        body += '<img src="" id="' + idLogo2 + '" style="height:3rem;width:50%;object-fit:contain;opacity:0">';
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

        body += '<div class="border-bottom border-1 border-secondary my-3" style="text-align:center">';
        if (wikidata) {
            body += formatButton('Wikipedia', '', idWikipedia);
            body += formatButton('Wikidata', 'https://www.wikidata.org/wiki/' + wikidata);
            body += '<img src="" id="' + idImage1 + '" class="bg-light mt-2" style="height:6rem;width:100%;object-fit:cover;opacity:0">';
        }
        body += '</div>';

        if (sys && sys.server) {
            body += format('System', sys.server.system + ', version ' + sys.server.version);
            body += formatLink('API', sys.server.url, sys.server.url);
            body += formatScroll('Extensions', (Array.isArray(sys.server.extensions) ? sys.server.extensions.length : 0));
        }

        if (wikidata) {
            loadSPARQL(wikidata);
        }

        elemBody.innerHTML = body;
    }

    function getOtherSystemsHead() {
        var head = '';

        head += '<th>Title</th>';
        head += '<th>Datasets</th>';
        head += '<th>System</th>';
        head += '<th>Version</th>';
        head += '<th>API</th>';
        head += '<th>Extensions</th>';

        return '<tr>' + head + '</tr>';
    }

    function getOtherSystemsRow(id, sys) {
        var catalogObj = catalog.get(id);
        var monitoringObj = monitoring.get(sys.link);

        var title = sys ? sys.title : catalogObj ? catalogObj.title : '';
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';

        var cols = '';
        cols += '<td>' + title + '</td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys && sys.server) {
            cols += '<td class="align-middle">' + sys.server.system + '</td>';
            cols += '<td class="align-middle">' + sys.server.version + '</td>';
            cols += '<td class="align-middle"><a href="' + sys.server.url + '" target="_blank">API</a></td>';
            cols += '<td class="align-middle">' + JSON.stringify(sys.server.extensions) + '</td>';
        } else {
            var url = catalogObj ? '<a href="' + catalogObj.link + '" target="_blank">API</a>' : '-';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">' + url + '</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr><td></td><td colspan=5 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
        }

        return '<tr>' + cols + '</tr>' + error;
    }

    function getCKANSystemsHead() {
        var head = '';

        head += '<th>Title</th>';
        head += '<th>Datasets</th>';
        head += '<th>CKAN Version</th>';
        head += '<th>API</th>';
        head += '<th>Extensions</th>';

        return '<tr>' + head + '</tr>';
    }

    function getCKANSystemsRow(id, sys) {
        var catalogObj = catalog.get(id);
        var monitoringObj = monitoring.get(sys.link);

        var title = sys ? sys.title : catalogObj ? catalogObj.title : '';
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';

        var cols = '';
        cols += '<td>' + title + '</td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys && sys.server) {
            cols += '<td class="align-middle">' + (sys.server.version || '-') + '</td>';
            if (sys.server.url) {
                cols += '<td class="align-middle"><a href="' + sys.server.url + '" target="_blank">API</a></td>';
            } else {
                cols += '<td class="align-middle">-</td>';
            }
            cols += '<td class="align-middle" style="line-height:1.5rem">' + formatExtensions(sys.server.extensions) + '</td>';
        } else {
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr><td></td><td colspan=5 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
        }

        var cssClass = '';
        if (datasetCount === null) {
            cssClass ='bg-danger text-white';
        }

        return '<tr class="' + cssClass + '">' + cols + '</tr>' + error;
//        return '<tr>' + cols + '</tr>' + error;
    }

    function getPiveauSystemsHead() {
        var head = '';

        head += '<th>Title</th>';
        head += '<th>Datasets</th>';
        head += '<th>Search Version</th>';
        head += '<th>Registry Version</th>';
        head += '<th>MQA Version</th>';
        head += '<th>SHACL Validator Version</th>';
        head += '<th>API</th>';

        return '<tr>' + head + '</tr>';
    }

    function getPiveauSystemsRow(id, sys) {
        var catalogObj = catalog.get(id);
        var monitoringObj = monitoring.get(sys.link);

        var title = sys ? sys.title : catalogObj ? catalogObj.title : '';
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';

        var cols = '';
        cols += '<td>' + title + '</td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys && sys.server) {
            cols += '<td class="align-middle">' + (sys.server.extensions.search || '-') + '</td>';
            cols += '<td class="align-middle">' + (sys.server.extensions.registry || '-') + '</td>';
            cols += '<td class="align-middle">' + (sys.server.extensions.MQA || '-') + '</td>';
            cols += '<td class="align-middle">' + (sys.server.extensions['SHACL metadata validation'] || '-') + '</td>';
            cols += '<td class="align-middle"><a href="' + sys.server.url + '" target="_blank">API</a></td>';
        } else {
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr><td></td><td colspan=5 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
        }

        return '<tr>' + cols + '</tr>' + error;
    }

    function getODSSystemsHead() {
        var head = '';

        head += '<th>Title</th>';
        head += '<th>Datasets</th>';
        head += '<th>ODS Version</th>';
        head += '<th>API</th>';

        return '<tr>' + head + '</tr>';
    }

    function getODSSystemsRow(id, sys) {
        var catalogObj = catalog.get(id);
        var monitoringObj = monitoring.get(sys.link);

        var title = sys ? sys.title : catalogObj ? catalogObj.title : '';
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';

        var cols = '';
        cols += '<td>' + title + '</td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys && sys.server) {
            cols += '<td class="align-middle">' + sys.server.version + '</td>';
            cols += '<td class="align-middle"><a href="' + sys.server.url + '" target="_blank">API</a></td>';
        } else {
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr><td></td><td colspan=5 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
        }

        return '<tr>' + cols + '</tr>' + error;
    }

    function updateSystemTable() {
        var ckanTableHead = document.getElementById(idCKANSystemsHead);
        var ckanTableBody = document.getElementById(idCKANSystemsBody);
        var piveauTableHead = document.getElementById(idPiveauSystemsHead);
        var piveauTableBody = document.getElementById(idPiveauSystemsBody);
        var odsTableHead = document.getElementById(idODSSystemsHead);
        var odsTableBody = document.getElementById(idODSSystemsBody);
        var otherTableHead = document.getElementById(idOtherSystemsHead);
        var otherTableBody = document.getElementById(idOtherSystemsBody);

        if (!otherTableHead) {
            return;
        }

        var ckanBody = '';
        var piveauBody = '';
        var odsBody = '';
        var otherBody = '';

        assets.forEach(sys => {
            var id = getId(sys);
            var system = '';
            if (sys && sys.server) {
                system = sys.server.system;
            }

            if ('CKAN' === system) {
                ckanBody += getCKANSystemsRow(id, sys);
            } else if ('Piveau' === system) {
                piveauBody += getPiveauSystemsRow(id, sys);
            } else if ('Opendatasoft' === system) {
                odsBody += getODSSystemsRow(id, sys);
            } else {
                otherBody += getOtherSystemsRow(id, sys);
            }
        });

        if (ckanBody.length === 0) {
            ckanBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }
        if (piveauBody.length === 0) {
            piveauBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }
        if (odsBody.length === 0) {
            odsBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }
        if (otherBody.length === 0) {
            otherBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }

        ckanTableHead.innerHTML = getCKANSystemsHead();
        ckanTableBody.innerHTML = ckanBody;
        piveauTableHead.innerHTML = getPiveauSystemsHead();
        piveauTableBody.innerHTML = piveauBody;
        odsTableHead.innerHTML = getODSSystemsHead();
        odsTableBody.innerHTML = odsBody;
        otherTableHead.innerHTML = getOtherSystemsHead();
        otherTableBody.innerHTML = otherBody;
    }

    function funcUpdate() {
        updateSingleSystem();
        updateSystemTable();
    }

    init();

    return {
        addEventListenerStartLoading: funcAddEventListenerStartLoading,
        addEventListenerEndLoading: funcAddEventListenerEndLoading,
        get: funcGet,
        loadData: funcLoadData,
        update: funcUpdate,
    };
}());