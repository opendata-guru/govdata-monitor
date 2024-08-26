var system = (function () {
    var baseURL = 'https://opendata.guru/govdata/assets/',
        uriToLoad = '',
        uriPSystems = 'https://opendata.guru/api/2/p/systems/today',
        uriPSystemsAlt = 'https://opendata.guru/api/2/p/systems/yesterday',
        uriChangelogCKAN = 'https://opendata.guru/api/2/system/changelog?system=CKAN',
        systemId = null;
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var idSystemBody = 'system-body',
        idCKANSystemsHead = 'ckan-systems-thead',
        idCKANSystemsBody = 'ckan-systems-tbody',
        idCKANSystemsFoot = 'ckan-systems-tfoot',
        idDKANSystemsHead = 'dkan-systems-thead',
        idDKANSystemsBody = 'dkan-systems-tbody',
        idDKANSystemsFoot = 'dkan-systems-tfoot',
        idPiveauSystemsHead = 'piveau-systems-thead',
        idPiveauSystemsBody = 'piveau-systems-tbody',
        idPiveauSystemsFoot = 'piveau-systems-tfoot',
        idODSSystemsHead = 'ods-systems-thead',
        idODSSystemsBody = 'ods-systems-tbody',
        idODSSystemsFoot = 'ods-systems-tfoot',
        idEntryScapeSystemsHead = 'entryscape-systems-thead',
        idEntryScapeSystemsBody = 'entryscape-systems-tbody',
        idEntryScapeSystemsFoot = 'entryscape-systems-tfoot',
        idArcGISHubSystemsHead = 'arcgishub-systems-thead',
        idArcGISHubSystemsBody = 'arcgishub-systems-tbody',
        idArcGISHubSystemsFoot = 'arcgishub-systems-tfoot',
        idSPARQLSystemsHead = 'sparql-systems-thead',
        idSPARQLSystemsBody = 'sparql-systems-tbody',
        idSPARQLSystemsFoot = 'sparql-systems-tfoot',
        idOtherSystemsHead = 'other-systems-thead',
        idOtherSystemsBody = 'other-systems-tbody',
        idOtherSystemsFoot = 'other-systems-tfoot',
        idImage1 = 'image-1',
//        idImage2 = 'image-2',
//        idImage3 = 'image-3',
        idLogo1 = 'logo-1',
        idLogo2 = 'logo-2',
        idWikipedia = 'linkWikipedia';
    var localDict = {
        noLinkFound: 'No link found',
        noOrganisationFound: 'No organisation found',
//        duplicateOrganisationEntriesFound: 'Duplicate organisation entries found',
        couldNotCountDatasets: 'Could not count datasets',
    };
    var assets = [];
    var pSystems = [];
    var assetsChangelogCKAN = [];

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

    function storeSystemFile(payload) {
        assets = payload;

        loadPSystems();
    }

    function storePSystems(payload) {
        pSystems = payload;

        loadChangelog();
    }

    function storeChangelog(payload) {
        assetsChangelogCKAN = payload;

        dispatchEventEndLoading();
    }

    function loadSystemFile() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriToLoad, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storeSystemFile(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                dispatchEventEndLoading();
            }
        }

        xhr.send();
    }

    function loadPSystems() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriPSystems, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storePSystems(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                if (uriPSystems === uriPSystemsAlt) {
                    dispatchEventEndLoading();
                } else {
                    uriPSystems = uriPSystemsAlt;
                    loadPSystems();
                }
            }
        }

        xhr.send();
    }

    function loadChangelog() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriChangelogCKAN, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storeChangelog(JSON.parse(this.responseText));
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

        loadSystemFile();
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

    function getSystemTitle(sys) {
        return sys.sobject ? (sys.sobject.title.de ? sys.sobject.title.de : sys.sobject.title.en) : '';
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
            ret += '<div class="ext-left"><a class="d-block" onclick="system.onExpandExtension(this)">Expand ' + extensions.length + ' extensions</a></div><div class="ext-right" style="display:none">';
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
                ret += '<span style="font-size:1.5rem">🗳️</span> ' + strMetadata + '<br>';
            }
            if (arr.length > 0) {
                ret += '<span style="font-size:1.5rem">🏴‍☠️</span> ' + arr.join(', ');
            }
            ret += '</div>';
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
        head += '<th>CMS</th>';

        return '<tr>' + head + '</tr>';
    }

    function getOtherSystemsRow(sys) {
        var monitoringObj = monitoring.get(sys.pobject.deepLink);
        var catalogObj = catalog.getBySID(sys.sobject.sid);

        var title = getSystemTitle(sys);
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';
        var image = (sys.sobject.image && sys.sobject.image.url !== '') ? '<img src="' + sys.sobject.image.url + '" style="height:1em;margin-right:.5em">' : '';

        if (title === '') {
            title = sys.url;
        }

        var cols = '';
        cols += '<td>' + image + '<a href="catalogs.html?sid=' + sys.sobject.sid + '">' + title + '</a></td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys) {
            sys.version = sys.version === null ? '-' : sys.version;
            sys.system = sys.system === null ? '-' : sys.system;
            sys.cms = sys.cms === null ? '-' : sys.cms;
            cols += '<td class="align-middle">' + sys.system + '</td>';
            cols += '<td class="align-middle">' + sys.version + '</td>';
            cols += '<td class="align-middle"><a href="' + sys.url + '" target="_blank">API</a></td>';
            cols += '<td class="align-middle">' + (sys.extensions ? JSON.stringify(sys.extensions) : '-') + '</td>';
            cols += '<td class="align-middle">' + sys.cms + '</td>';
        } else {
            var url = catalogObj ? '<a href="' + catalogObj.link + '" target="_blank">API</a>' : '-';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">' + url + '</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr ><td></td><td colspan=6 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
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
        head += '<th>CMS</th>';

        return '<tr>' + head + '</tr>';
    }

    function getCKANSystemsRow(sys) {
        var monitoringObj = monitoring.get(sys.pobject.deepLink);
        var catalogObj = catalog.getBySID(sys.sobject.sid);

        var title = getSystemTitle(sys);
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';
        var image = (sys.sobject.image && sys.sobject.image.url !== '') ? '<img src="' + sys.sobject.image.url + '" style="height:1em;margin-right:.5em">' : '';

        if (title === '') {
            title = sys.url;
        }

        var cols = '';
        cols += '<td>' + image + '<a href="catalogs.html?sid=' + sys.sobject.sid + '">' + title + '</a></td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys) {
            sys.cms = sys.cms === null ? '-' : sys.cms;
            if (sys.version) {
                var version = '<span style="display:inline-block;width:4em">' + sys.version + '</span>';
                assetsChangelogCKAN.history.forEach(item => {
                    if (item.version === sys.version) {
                        var color = item.color === 'green' ? 'bg-success' : item.color === 'yellow' ? 'bg-warning' : item.color === 'red' ? 'bg-danger' : 'bg-secondary';
                        version += '<span class="badge ' + color + '" style="width:7em">' + item.date + '</span>';
                    }
                });
                cols += '<td class="align-middle">' + version + '</td>';
            } else {
                cols += '<td class="align-middle">-</td>';
            }
            if (sys.url) {
                cols += '<td class="align-middle"><a href="' + sys.url + '" target="_blank">API</a></td>';
            } else {
                cols += '<td class="align-middle">-</td>';
            }
            cols += '<td class="align-middle" style="line-height:1.5rem">' + formatExtensions(sys.extensions) + '</td>';
            cols += '<td class="align-middle">' + sys.cms + '</td>';
        } else {
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr ><td></td><td colspan=6 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
        }

        return '<tr>' + cols + '</tr>' + error;
    }

    function getDKANSystemsHead() {
        var head = '';

        head += '<th>Title</th>';
        head += '<th>Datasets</th>';
        head += '<th>API</th>';
        head += '<th>CMS</th>';

        return '<tr>' + head + '</tr>';
    }

    function getDKANSystemsRow(sys) {
        var monitoringObj = monitoring.get(sys.pobject.deepLink);
        var catalogObj = catalog.getBySID(sys.sobject.sid);

        var title = getSystemTitle(sys);
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';
        var image = (sys.sobject.image && sys.sobject.image.url !== '') ? '<img src="' + sys.sobject.image.url + '" style="height:1em;margin-right:.5em">' : '';

        if (title === '') {
            title = sys.url;
        }

        var cols = '';
        cols += '<td>' + image + '<a href="catalogs.html?sid=' + sys.sobject.sid + '">' + title + '</a></td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys) {
            sys.cms = sys.cms === null ? '-' : sys.cms;
            cols += '<td class="align-middle"><a href="' + sys.url + '" target="_blank">API</a></td>';
            cols += '<td class="align-middle">' + sys.cms + '</td>';
        } else {
            var url = catalogObj ? '<a href="' + catalogObj.link + '" target="_blank">API</a>' : '-';
            cols += '<td class="align-middle">' + url + '</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr ><td></td><td colspan=6 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
        }

        return '<tr>' + cols + '</tr>' + error;
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

    function getPiveauSystemsRow(sys) {
        var monitoringObj = monitoring.get(sys.pobject.deepLink);
        var catalogObj = catalog.getBySID(sys.sobject.sid);

        var title = getSystemTitle(sys);
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';
        var image = (sys.sobject.image && sys.sobject.image.url !== '') ? '<img src="' + sys.sobject.image.url + '" style="height:1em;margin-right:.5em">' : '';

        if (title === '') {
            title = sys.url;
        }

        var cols = '';
        cols += '<td>' + image + '<a href="catalogs.html?sid=' + sys.sobject.sid + '">' + title + '</a></td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys) {
            cols += '<td class="align-middle">' + (sys.extensions.search || '-') + '</td>';
            cols += '<td class="align-middle">' + (sys.extensions.registry || '-') + '</td>';
            cols += '<td class="align-middle">' + (sys.extensions.MQA || '-') + '</td>';
            cols += '<td class="align-middle">' + (sys.extensions['SHACL metadata validation'] || '-') + '</td>';
            cols += '<td class="align-middle"><a href="' + sys.url + '" target="_blank">API</a></td>';
        } else {
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr ><td></td><td colspan=6 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
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

    function getODSSystemsRow(sys) {
        var monitoringObj = monitoring.get(sys.pobject.deepLink);
        var catalogObj = catalog.getBySID(sys.sobject.sid);

        var title = getSystemTitle(sys);
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';
        var image = (sys.sobject.image && sys.sobject.image.url !== '') ? '<img src="' + sys.sobject.image.url + '" style="height:1em;margin-right:.5em">' : '';

        if (title === '') {
            title = sys.url;
        }

        var cols = '';
        cols += '<td>' + image + '<a href="catalogs.html?sid=' + sys.sobject.sid + '">' + title + '</a></td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys) {
            cols += '<td class="align-middle">' + sys.version + '</td>';
            cols += '<td class="align-middle"><a href="' + sys.url + '" target="_blank">API</a></td>';
        } else {
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr ><td></td><td colspan=5 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
        }

        return '<tr>' + cols + '</tr>' + error;
    }

    function getEntryScapeSystemsHead() {
        var head = '';

        head += '<th>Title</th>';
        head += '<th>Datasets</th>';
        head += '<th>EntryScape Version</th>';
        head += '<th>API</th>';
        head += '<th>Extensions</th>';

        return '<tr>' + head + '</tr>';
    }

    function getEntryScapeSystemsRow(sys) {
        var monitoringObj = monitoring.get(sys.pobject.deepLink);
        var catalogObj = catalog.getBySID(sys.sobject.sid);

        var title = getSystemTitle(sys);
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';
        var image = (sys.sobject.image && sys.sobject.image.url !== '') ? '<img src="' + sys.sobject.image.url + '" style="height:1em;margin-right:.5em">' : '';

        if (title === '') {
            title = sys.url;
        }

        var cols = '';
        cols += '<td>' + image + '<a href="catalogs.html?sid=' + sys.sobject.sid + '">' + title + '</a></td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys) {
            cols += '<td class="align-middle">' + sys.version + '</td>';
            cols += '<td class="align-middle"><a href="' + sys.url + '" target="_blank">API</a></td>';
            cols += '<td class="align-middle" style="line-height:1.5rem">' + formatExtensions(sys.extensions) + '</td>';
        } else {
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr ><td></td><td colspan=6 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
        }

        return '<tr>' + cols + '</tr>' + error;
    }

    function getArcGISHubSystemsHead() {
        var head = '';

        head += '<th>Title</th>';
        head += '<th>Datasets</th>';
        head += '<th>ArcGIS Hub Version</th>';
        head += '<th>API</th>';

        return '<tr>' + head + '</tr>';
    }

    function getArcGISHubSystemsRow(sys) {
        var monitoringObj = monitoring.get(sys.pobject.deepLink);
        var catalogObj = catalog.getBySID(sys.sobject.sid);

        var title = getSystemTitle(sys);
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';
        var image = (sys.sobject.image && sys.sobject.image.url !== '') ? '<img src="' + sys.sobject.image.url + '" style="height:1em;margin-right:.5em">' : '';

        if (title === '') {
            title = sys.url;
        }

        var cols = '';
        cols += '<td>' + image + '<a href="catalogs.html?sid=' + sys.sobject.sid + '">' + title + '</a></td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys) {
            cols += '<td class="align-middle">' + sys.version + '</td>';
            cols += '<td class="align-middle"><a href="' + sys.url + '" target="_blank">API</a></td>';
        } else {
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr ><td></td><td colspan=5 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
        }

        return '<tr>' + cols + '</tr>' + error;
    }

    function getSPARQLSystemsHead() {
        var head = '';

        head += '<th>Title</th>';
        head += '<th>Datasets</th>';
        head += '<th>System</th>';
        head += '<th>Version</th>';
        head += '<th>API</th>';
        head += '<th>Build date</th>';
        head += '<th>OS</th>';

        return '<tr>' + head + '</tr>';
    }

    function getSPARQLSystemsRow(sys) {
        var monitoringObj = monitoring.get(sys.pobject.deepLink);
        var catalogObj = catalog.getBySID(sys.sobject.sid);

        var title = getSystemTitle(sys);
        var datasetCount = catalogObj ? catalogObj.datasetCount : 'unknown';
        var error = '';
        var image = (sys.sobject.image && sys.sobject.image.url !== '') ? '<img src="' + sys.sobject.image.url + '" style="height:1em;margin-right:.5em">' : '';

        if (title === '') {
            title = sys.url;
        }

        var cols = '';
        cols += '<td>' + image + '<a href="catalogs.html?sid=' + sys.sobject.sid + '">' + title + '</a></td>';
        cols += '<td>' + monitorFormatNumber(datasetCount) + '</td>';

        if (sys) {
            sys.version = sys.version === null ? '-' : sys.version;
            sys.name = sys.name === null ? '-' : sys.name;
            sys.build.os = sys.build.os === null ? '-' : sys.build.os;
            sys.build.date = sys.build.date === null ? '-' : sys.build.date;
            cols += '<td class="align-middle">' + sys.name + '</td>';
            cols += '<td class="align-middle">' + sys.version + '</td>';
            cols += '<td class="align-middle"><a href="' + sys.url + '" target="_blank">API</a></td>';
            cols += '<td class="align-middle">' + sys.build.date + '</td>';
            cols += '<td class="align-middle">' + sys.build.os + '</td>';
        } else {
            var url = catalogObj ? '<a href="' + catalogObj.link + '" target="_blank">API</a>' : '-';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">' + url + '</td>';
            cols += '<td class="align-middle">-</td>';
            cols += '<td class="align-middle">-</td>';
        }

        if (monitoringObj) {
            error = '<tr ><td></td><td colspan=6 class="bg-danger text-white px-3 py-1" style="border-radius:0 0 1rem 1rem">' + title + ': ' + localDict[monitoringObj.message] + '</td></tr>';
        }

        return '<tr>' + cols + '</tr>' + error;
    }

    function updateSystemTable() {
        var ckanTableHead = document.getElementById(idCKANSystemsHead);
        var ckanTableBody = document.getElementById(idCKANSystemsBody);
        var ckanTableFoot = document.getElementById(idCKANSystemsFoot);
        var dkanTableHead = document.getElementById(idDKANSystemsHead);
        var dkanTableBody = document.getElementById(idDKANSystemsBody);
        var dkanTableFoot = document.getElementById(idDKANSystemsFoot);
        var piveauTableHead = document.getElementById(idPiveauSystemsHead);
        var piveauTableBody = document.getElementById(idPiveauSystemsBody);
        var piveauTableFoot = document.getElementById(idPiveauSystemsFoot);
        var odsTableHead = document.getElementById(idODSSystemsHead);
        var odsTableBody = document.getElementById(idODSSystemsBody);
        var odsTableFoot = document.getElementById(idODSSystemsFoot);
        var entryScapeTableHead = document.getElementById(idEntryScapeSystemsHead);
        var entryScapeTableBody = document.getElementById(idEntryScapeSystemsBody);
        var entryScapeTableFoot = document.getElementById(idEntryScapeSystemsFoot);
        var arcGISHubTableHead = document.getElementById(idArcGISHubSystemsHead);
        var arcGISHubTableBody = document.getElementById(idArcGISHubSystemsBody);
        var arcGISHubTableFoot = document.getElementById(idArcGISHubSystemsFoot);
        var sparqlTableHead = document.getElementById(idSPARQLSystemsHead);
        var sparqlTableBody = document.getElementById(idSPARQLSystemsBody);
        var sparqlTableFoot = document.getElementById(idSPARQLSystemsFoot);
        var otherTableHead = document.getElementById(idOtherSystemsHead);
        var otherTableBody = document.getElementById(idOtherSystemsBody);
        var otherTableFoot = document.getElementById(idOtherSystemsFoot);

        if (!otherTableHead) {
            return;
        }

        var ckanBody = '';
        var dkanBody = '';
        var piveauBody = '';
        var odsBody = '';
        var entryScapeBody = '';
        var arcGISHubBody = '';
        var sparqlBody = '';
        var otherBody = '';

        pSystems.sort((a, b) => {
            return getSystemTitle(a).localeCompare(getSystemTitle(b));
        });

        pSystems.forEach(sys => {
            var system = sys.system;

            if ('CKAN' === system) {
                ckanBody += getCKANSystemsRow(sys);
            } else if ('DKAN' === system) {
                dkanBody += getDKANSystemsRow(sys);
            } else if ('Piveau' === system) {
                piveauBody += getPiveauSystemsRow(sys);
            } else if ('Opendatasoft' === system) {
                odsBody += getODSSystemsRow(sys);
            } else if ('entryscape' === system) {
                entryScapeBody += getEntryScapeSystemsRow(sys);
            } else if ('ArcGIS Hub' === system) {
                arcGISHubBody += getArcGISHubSystemsRow(sys);
            } else if ('SPARQL' === system) {
                sparqlBody += getSPARQLSystemsRow(sys);
            } else {
                otherBody += getOtherSystemsRow(sys);
            }
        });

        if (ckanBody.length === 0) {
            ckanBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }
        if (dkanBody.length === 0) {
            dkanBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }
        if (piveauBody.length === 0) {
            piveauBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }
        if (odsBody.length === 0) {
            odsBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }
        if (entryScapeBody.length === 0) {
            entryScapeBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }
        if (arcGISHubBody.length === 0) {
            arcGISHubBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }
        if (sparqlBody.length === 0) {
            sparqlBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }
        if (otherBody.length === 0) {
            otherBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }

        ckanTableHead.innerHTML = getCKANSystemsHead();
        ckanTableBody.innerHTML = ckanBody;
        ckanTableFoot.innerHTML = '<tr><td style="border:none">' + (ckanBody.split('<tr>').length - 1) + ' systems</td></tr>';
        dkanTableHead.innerHTML = getDKANSystemsHead();
        dkanTableBody.innerHTML = dkanBody;
        dkanTableFoot.innerHTML = '<tr><td style="border:none">' + (dkanBody.split('<tr>').length - 1) + ' systems</td></tr>';
        piveauTableHead.innerHTML = getPiveauSystemsHead();
        piveauTableBody.innerHTML = piveauBody;
        piveauTableFoot.innerHTML = '<tr><td style="border:none">' + (piveauBody.split('<tr>').length - 1) + ' systems</td></tr>';
        odsTableHead.innerHTML = getODSSystemsHead();
        odsTableBody.innerHTML = odsBody;
        odsTableFoot.innerHTML = '<tr><td style="border:none">' + (odsBody.split('<tr>').length - 1) + ' systems</td></tr>';
        entryScapeTableHead.innerHTML = getEntryScapeSystemsHead();
        entryScapeTableBody.innerHTML = entryScapeBody;
        entryScapeTableFoot.innerHTML = '<tr><td style="border:none">' + (entryScapeBody.split('<tr>').length - 1) + ' systems</td></tr>';
        arcGISHubTableHead.innerHTML = getArcGISHubSystemsHead();
        arcGISHubTableBody.innerHTML = arcGISHubBody;
        arcGISHubTableFoot.innerHTML = '<tr><td style="border:none">' + (arcGISHubBody.split('<tr>').length - 1) + ' systems</td></tr>';
        sparqlTableHead.innerHTML = getSPARQLSystemsHead();
        sparqlTableBody.innerHTML = sparqlBody;
        sparqlTableFoot.innerHTML = '<tr><td style="border:none">' + (sparqlBody.split('<tr>').length - 1) + ' systems</td></tr>';
        otherTableHead.innerHTML = getOtherSystemsHead();
        otherTableBody.innerHTML = otherBody;
        otherTableFoot.innerHTML = '<tr><td style="border:none">' + (otherBody.split('<tr>').length - 1) + ' systems</td></tr>';
    }

    function funcUpdate() {
        updateSingleSystem();
        updateSystemTable();
    }

    init();

    function funcOnExpandExtension(link) {
        var parent = link.parentElement.parentElement;
        var divLeft = parent.getElementsByClassName('ext-left')[0];
        var divRight = parent.getElementsByClassName('ext-right')[0];

        divLeft.style.display = 'none';
        divRight.style.display = 'block';
    }

    return {
        addEventListenerStartLoading: funcAddEventListenerStartLoading,
        addEventListenerEndLoading: funcAddEventListenerEndLoading,
        get: funcGet,
        loadData: funcLoadData,
        onExpandExtension: funcOnExpandExtension,
        update: funcUpdate,
    };
}());