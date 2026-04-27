var system = (function () {
    var initvalSelection = '',
        defaultSelection = '',
        paramSelection = 'text';
    var baseURL = 'https://opendata.guru/govdata/assets/',
        uriToLoad = '',
        uriPSystems = 'https://opendata.guru/api/2/p/systems/today',
        uriPSystemsAlt = 'https://opendata.guru/api/2/p/systems/yesterday',
        uriChangelogCKAN = 'https://opendata.guru/api/2/live/systemchangelog?system=CKAN',
        uriChangelogEntryScape = 'https://opendata.guru/api/2/live/systemchangelog?system=EntryStore',
        uriChangelogPiveau = 'https://opendata.guru/api/2/live/systemchangelog?system=Piveau';
    var eventListenerStartLoading = [],
        eventListenerEndLoading = [];
    var idSystemBar = 'system-bar',
        idSystemRow = 'system-row',
        idOtherSystemsHead = 'other-systems-thead',
        idOtherSystemsBody = 'other-systems-tbody',
        idOtherSystemsFoot = 'other-systems-tfoot';
    var dict = {
        de: {
            countSystemNone: 'Kein System gefunden',
            countSystemOne: '1 System gefunden',
            countSystems: '{number} Systeme gefunden',
            couldNotCountPObject: 'Datensätze konnten nicht gezählt werden',
            extensions: 'mit {number} Erweiterungen',
            linkAPI: 'API',
            linkOpen: 'Anzeigen',
            linkOrigin: 'Webseite',
            noLObjectsFound: 'Keine Datenliefernde gefunden',
            noSObjectFound: 'Kein semantischer Titel gefunden',
            missingSObjects: 'Fehlende semantische Objekte. %sObjects% von %lObjects% vorhanden',
            placeholder: 'Durchsuche die Systeme…',
            profiles: 'mit {number} Profilen',
            snapshot: 'Es wird eine unvollständige Version verwendet.',
            systemException: 'Es ist ein Fehler aufgetreten',
            systemsLoading: 'Systeminformationen werden geladen',
            tryCity: 'Du kannst nach einer Stadt suchen:',
            trySoftware: 'Du kannst nach Software suchen:',
            unknownSystem: 'Unbekanntes System',
            unknownVersion: 'Es wird eine unbekannte Version verwendet.',
        },
        en: {
            countSystemNone: 'No system found',
            countSystemOne: '1 system found',
            countSystems: '{number} systems found',
            couldNotCountPObject: 'Datasets could not be counted',
            extensions: 'with {number} extensions',
            linkAPI: 'API',
            linkOpen: 'Show',
            linkOrigin: 'Website',
            noLObjectsFound: 'No suppliers found',
            noSObjectFound: 'No semantic title found',
            missingSObjects: 'Missing semantic objects. %sObjects% of %lObjects% present',
            placeholder: 'Search the systems…',
            profiles: 'with {number} profiles',
            snapshot: 'An incomplete version is being used.',
            systemException: 'An error has occurred',
            systemsLoading: 'System information is loading',
            tryCity: 'You can search for a city:',
            trySoftware: 'You can search for software:',
            unknownSystem: 'Unknown system',
            unknownVersion: 'An unknown version is being used.',
        },
    };
    var assets = [];
    var pSystems = [];
    var assetsChangelogCKAN = [],
        assetsChangelogEntryScape = [],
        assetsChangelogPiveau = [];

    function init() {
        var systemBar = document.getElementById(idSystemBar);
        if (systemBar) {
            var params = new URLSearchParams(window.location.search);

            if (params.has(paramSelection)) {
                initvalSelection = params.get(paramSelection).split(',');
            } else {
                initvalSelection = defaultSelection;
            }

            systemBar.innerHTML = getSystemFilter();

            setupSystemFilterEvents();
        }
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
        funcUpdate();

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

        loadChangelogCKAN();
    }

    function storeChangelogCKAN(payload) {
        assetsChangelogCKAN = payload;

        loadChangelogEntryScape();
    }

    function storeChangelogEntryScape(payload) {
        assetsChangelogEntryScape = payload;

        loadChangelogPiveau();
    }

    function storeChangelogPiveau(payload) {
        assetsChangelogPiveau = payload;

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

    function loadChangelogCKAN() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriChangelogCKAN, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storeChangelogCKAN(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                loadChangelogEntryScape();
            }
        }

        xhr.send();
    }

    function loadChangelogEntryScape() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriChangelogEntryScape, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storeChangelogEntryScape(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                loadChangelogPiveau();
            }
        }

        xhr.send();
    }

    function loadChangelogPiveau() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', uriChangelogPiveau, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storeChangelogPiveau(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                dispatchEventEndLoading();
            }
        }

        xhr.send();
    }

    function funcLoadData() {
        setLoadingDate(new Date(Date.now()));

        dispatchEventStartLoading();

        loadSystemFile();
    }

    function getSystemTitle(sobject) {
        if (sobject && sobject.title) {
            if (sobject.title[nav.lang]) {
                return sobject.title[nav.lang];
            }
            if (sobject.title.en) {
                return sobject.title.en;
            }
            return sobject.title[Object.keys(sobject.title)[0]];
        }

        return '';
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

    function getIssueRow(sys, cols) {
        var monitoringObj = monitoring.get(sys.pobject);
        var str = '';

        if (monitoringObj) {
            str += '<tr class="issues"><td colspan=' + cols + ' class="px-3 py-1" style="background:#ddd;border-radius:0 0 1rem 1rem">';

            monitoringObj.forEach((issue) => {
                var silent = [
                    'pNlz' /* https://avoindata.suomi.fi */,
                    'pHbA' /* https://data.gov.ie */,
                    'pXSc' /* https://data.gov.il */,
                    'pjP8' /* https://dati.gov.it/opendata */,
                    'pFuv' /* https://data.overheid.nl/data */,
                    'pSU6' /* https://data.gov.hr/ckan */,
                    'p6VB' /* https://data.gov.lv/dati/lv */,
                    'poLl' /* https://data.gov.ua */,
                    'pJmr' /* https://dataset.gov.md */,
                    'ptfz' /* https://ckan.opendata.swiss */,
                    'pFzk' /* https://ckan.publishing.service.gov.uk */,
                    'p000' /* https://data.europa.eu */,
                    'pQLS' /* https://data.bl.ch */,
                    'pKZE' /* https://data.bs.ch */,
                    'p1Y3' /* https://data.tg.ch */,
                    'pNgX' /* https://data.zg.ch */,
                    'pGBx' /* https://catalog.opendata.li */,
                    'p1tT' /* https://admin.dataportal.se */,
                ];
                if ((issue.message === 'missingSObjects') && silent.includes(sys.pobject.pid)) {
                    return;
                }
                if (issue.severity === 'info') {
                    str += '<span class="bg-info text-white text-center me-2" style="display:inline-block;height:1.5em;width:1.5em;border-radius:1em">i</span>';
                } else if (issue.severity === 'warning') {
                    str += '<span class="bg-warning text-center me-2" style="display:inline-block;height:1.5em;width:1.5em;border-radius:1em">!</span>';
                } else {
                    str += '<span class="bg-danger text-white text-center me-2" style="display:inline-block;height:1.5em;width:1.5em;border-radius:1em">x</span>';
                }

                var translated = dict[nav.lang][issue.message];
                translated = translated.replace('%sObjects%', issue.sObjects);
                translated = translated.replace('%lObjects%', issue.lObjects);
                str += translated;
                str += '<br>';
            });

            str += '</td></tr>';
        }

        return str;
    }

    function getIssueInfo(sys) {
        var monitoringObj = monitoring.get(sys.pobject);
        var ret = {
            error: [],
            info: [],
            warning: [],
        };

        if (monitoringObj) {
            monitoringObj.forEach((issue) => {
                var silent = [
                    'pNlz' /* https://avoindata.suomi.fi */,
                    'pHbA' /* https://data.gov.ie */,
                    'pXSc' /* https://data.gov.il */,
                    'pjP8' /* https://dati.gov.it/opendata */,
                    'pFuv' /* https://data.overheid.nl/data */,
                    'pSU6' /* https://data.gov.hr/ckan */,
                    'p6VB' /* https://data.gov.lv/dati/lv */,
                    'poLl' /* https://data.gov.ua */,
                    'pOxT' /* https://data.gov.jm/ */,
                    'psd5' /* https://data.gov.cy/ */ ,
                    'pJmr' /* https://dataset.gov.md */,
                    'ptfz' /* https://ckan.opendata.swiss */,
                    'pFzk' /* https://ckan.publishing.service.gov.uk */,
                    'p000' /* https://data.europa.eu */,
                    'pQLS', 'pKZE', 'pPI9', 'p1Y3', 'pNgX', 'p9v3', 'pZ0u', 'pVFC', 'pwT0', /* ...ch */
                    'pvyO', /* ...es */
                    'pGBx' /* https://catalog.opendata.li */,
                    'p1tT' /* https://admin.dataportal.se */,
                    'pPaA' /* https://www.data.gv.at/ */,
                    'pQd8' /* https://www.opendataportal.at/ */,
                    'pihM' /* https://hub.huwise.com/ */,
                    'pZEz' /* https://data.sbb.ch */,
                    'p5lL' /* https://ressources.data.sncf.com */,
                ];
                if ((issue.message === 'missingSObjects') && silent.includes(sys.pobject.pid)) {
                    return;
                }

                var translated = dict[nav.lang][issue.message];
                translated = translated.replace('%sObjects%', issue.sObjects);
                translated = translated.replace('%lObjects%', issue.lObjects);

                if (issue.severity === 'info') {
                    ret.info.push(translated);
                } else if (issue.severity === 'warning') {
                    ret.warning.push(translated);
                } else {
                    ret.error.push(translated);
                }
            });
        }

        return ret;
    }

    function getOtherSystemsHead() {
        var head = '';

        head += '<th>Title</th>';
        head += '<th>System</th>';
        head += '<th>Version</th>';
        head += '<th>API</th>';
        head += '<th>Extensions</th>';
        head += '<th>CMS</th>';

        return '<tr>' + head + '</tr>';
    }

    function getOtherSystemsRow(sys) {
        var title = getSystemTitle(sys.sobject);
        var image = (sys.sobject && sys.sobject.image && sys.sobject.image.url !== '') ? '<img src="' + sys.sobject.image.url + '" style="height:1em;margin-right:.5em">' : '';

        if (title === '') {
            title = sys.url || sys.pobject.deepLink;
        }

        var cols = '';
        cols += '<td>' + image + '<a href="catalogs.html?sid=' + (sys.sobject ? sys.sobject.sid : '-') + '&lang=' + nav.lang + '">' + title + '</a></td>';

        sys.version = sys.version === null ? '-' : sys.version;
        sys.system = sys.system === null ? '-' : sys.system;
        sys.cms = sys.cms === null ? '-' : sys.cms;
        cols += '<td class="align-middle">' + sys.system + '</td>';
        cols += '<td class="align-middle">' + sys.version + '</td>';
        cols += '<td class="align-middle"><a href="' + sys.pobject.deepLink + '" target="_blank">API</a></td>';
        cols += '<td class="align-middle">' + (sys.extensions ? JSON.stringify(sys.extensions) : '-') + '</td>';
        cols += '<td class="align-middle">' + sys.cms + '</td>';

        return '<tr>' + cols + '</tr>' + getIssueRow(sys, 6);
    }

    function getChangeBadge(item) {
        var color = 'bg-dark';
        var title = '&bigstar;';

        if (item.color === 'green') {
            color = 'bg-success';
            title = '&check;';
        } else if (item.color === 'yellow') {
            color = 'bg-warning text-dark';
            title = '~';
        } else if (item.color === 'red') {
            color = 'bg-danger';
            title = '&cross;';
        }

        return ' <span class="badge ' + color + '" style="display:inline-block;height:.9rem;margin-left:.1rem;width:1.15rem;border-radius:.45rem;cursor:help" title="' + item.date + '">' + title + '</span>';
    }

    function getSystemArcGISHubItem(sys) {
        var str = '';

        if (sys.version) {
            var v = sys.version.split('-');
            str += ' ' + v[0].split('+')[0];

            var d = new Date(v[1]);
			var date = d.toLocaleString('sv-SE', {timeZone: 'Europe/Berlin'}).split(' ')[0];
            var dateString = date.toLocaleString('sv-SE').split(' ')[0];
            var dateStringDE = date.toLocaleString('de-DE').split(',')[0];
            str += '<br>(' + (nav.lang === 'de' ? dateStringDE : dateString) + ')';
        }

        return str;
    }

    function getSystemCKANItem(sys) {
        var str = '';

        if (sys.version) {
            var badge = '';
            if (assetsChangelogCKAN.ckan) {
                assetsChangelogCKAN.ckan.forEach(item => {
                    if (item.version === sys.version) {
                        badge += ' ' + getChangeBadge(item);
                    }
                });
                if (badge === '') {
                    badge += ' ' + getChangeBadge({color: 'dark', date: dict[nav.lang].unknownVersion});
                }
            }
            str += ' ' + sys.version + badge;
        }

        if (sys.extensions && Array.isArray(sys.extensions)) {
            var tooltip = sys.extensions.join(', ');
            tooltip = tooltip.replace(/"/g, '&quot;');
            var num = '<span title="' + tooltip + '" style="background:#ddd;padding:.1rem .3rem;cursor:help">';
            num += sys.extensions.length + '</span>';
            str += '<br>' + dict[nav.lang].extensions.replace('{number}', num);
        }

        if (sys.cms !== '') {
            str += '<br>@ ' + sys.cms;
        }

        return str;
    }

    function getSystemConterraItem(sys) {
        var str = '';

        str += ' ' + sys.version;

        if (sys.extensions && Array.isArray(sys.extensions)) {
            var tooltip = sys.extensions.join(', ');
            tooltip = tooltip.replace(/"/g, '&quot;');
            var num = '<span title="' + tooltip + '" style="background:#ddd;padding:.1rem .3rem;cursor:help">';
            num += sys.extensions.length + '</span>';
            str += '<br>' + dict[nav.lang].extensions.replace('{number}', num);
        }

        return str;
    }

    function getSystemDKANItem(sys) {
        var str = '';

        if (sys.cms !== '') {
            str += '<br>@ ' + sys.cms;
        }

        return str;
    }

    function getSystemDuvaItem(sys) {
        var str = '';

        str += ' ' + sys.version;

        return str;
    }

    function getSystemEKANItem(sys) {
        var str = '';

        if (sys.cms !== '') {
            str += '<br>@ ' + sys.cms;
        }

        return str;
    }

    function getSystemEntryScapeItem(sys) {
        var str = '';

        if (sys.version) {
            var hasPatch = sys.version.split('.').length === 3;
            var badge = '';
            if (assetsChangelogEntryScape.entrystore) {
                assetsChangelogEntryScape.entrystore.forEach(item => {
                    var version = item.version;
                    if (!hasPatch) {
                        var temp = item.version.split('.');
                        temp.pop();;
                        version = temp.join('.');
                    }
                    if ((badge === '') && (version === sys.version)) {
                        badge += ' ' + getChangeBadge(item);
                    }
                });
                if (badge === '') {
                    badge += ' ' + getChangeBadge({color: 'dark', date: dict[nav.lang].unknownVersion});
                }
            }
            str += ' ' + sys.version + badge;
        }

        if (sys.extensions) {
            var ext = [];
            sys.extensions.forEach(extension => {
                var text = extension.split('/').slice(-1)[0];
                var parts = text.split('.');

                if ('json' === parts.slice(-1)[0]) {
                    parts.pop();
                }

                ext.push(parts.join('.'));
            });

            var tooltip = ext.join(', ');
            tooltip = tooltip.replace(/"/g, '&quot;');
            var num = '<span title="' + tooltip + '" style="background:#ddd;padding:.1rem .3rem;cursor:help">';
            num += ext.length + '</span>';
            str += '<br>' + dict[nav.lang].profiles.replace('{number}', num);
        }

        return str;
    }

    function getSystemHuwiseItem(sys) {
        var str = '';

        if (sys.version) {
            str += ' ' + sys.version;
        }

        return str;
    }

    function getSystemPiveauItem(sys) {
        var str = '';

        var badgeMetrics = '';
        if (assetsChangelogPiveau.metrics) {
            if ((sys.extensions.MQA + '').includes('SNAPSHOT')) {
                badgeMetrics += ' ' + getChangeBadge({color: 'dark', date: dict[nav.lang].snapshot});
            }
            assetsChangelogPiveau.metrics.forEach(item => {
                if (item.version === sys.extensions.MQA) {
                    badgeMetrics += ' ' + getChangeBadge(item);
                }
            });
            if (badgeMetrics === '') {
                badgeMetrics += ' ' + getChangeBadge({color: 'dark', date: dict[nav.lang].unknownVersion});
            }
        }

        var badgeRegistry = '';
        if (assetsChangelogPiveau.registry) {
            if ((sys.extensions.registry + '').includes('SNAPSHOT')) {
                badgeRegistry += ' ' + getChangeBadge({color: 'dark', date: dict[nav.lang].snapshot});
            }
            assetsChangelogPiveau.registry.forEach(item => {
                if (item.version === sys.extensions.registry) {
                    badgeRegistry += ' ' + getChangeBadge(item);
                }
            });
            if (badgeRegistry === '') {
                badgeRegistry += ' ' + getChangeBadge({color: 'dark', date: dict[nav.lang].unknownVersion});
            }
        }

        var badgeSearch = '';
        if (assetsChangelogPiveau.search) {
            if ((sys.extensions.search + '').includes('SNAPSHOT')) {
                badgeSearch += ' ' + getChangeBadge({color: 'dark', date: dict[nav.lang].snapshot});
            }
            assetsChangelogPiveau.search.forEach(item => {
                if (item.version === sys.extensions.search) {
                    badgeSearch += ' ' + getChangeBadge(item);
                }
            });
            if (badgeSearch === '') {
                badgeSearch += ' ' + getChangeBadge({color: 'dark', date: dict[nav.lang].unknownVersion});
            }
        }

        var badgeSHACL = '';
        if (assetsChangelogPiveau.shacl) {
            if ((sys.extensions['SHACL metadata validation'] + '').includes('SNAPSHOT')) {
                badgeSHACL += ' ' + getChangeBadge({color: 'dark', date: dict[nav.lang].snapshot});
            }
            assetsChangelogPiveau.shacl.forEach(item => {
                if (item.version === sys.extensions['SHACL metadata validation']) {
                    badgeSHACL += ' ' + getChangeBadge(item);
                }
            });
            if (badgeSHACL === '') {
                badgeSHACL += ' ' + getChangeBadge({color: 'dark', date: dict[nav.lang].unknownVersion});
            }
        }

        if (assetsChangelogPiveau.store) {
            // todo
        }

        if (sys.extensions && sys.extensions.search !== '') {
            str += '<br>&raquo; Search ' + sys.extensions.search + badgeSearch;
        }
        if (sys.extensions && sys.extensions.registry !== '') {
            str += '<br>&raquo; Registry ' + sys.extensions.registry + badgeRegistry;
        }
        if (sys.extensions && sys.extensions.MQA !== '') {
            str += '<br>&raquo; Metrics ' + sys.extensions.MQA + badgeMetrics;
        }
        if (sys.extensions && sys.extensions['SHACL metadata validation'] !== '') {
            str += '<br>&raquo; SHACL Validator ' + sys.extensions['SHACL metadata validation'] + badgeSHACL;
        }

        return str;
    }

    function getSystemSPARQLItem(sys) {
        var str = '';

        var badgeOpenLinkVirtuosoServer = '';

        if (sys.version !== '') {
            str += '<br>&raquo; ' + sys.name + ' ' + sys.version + badgeOpenLinkVirtuosoServer;
        }

        return str;
    }

    function getSystemOtherItem(sys) {
        var str = '';

        str += ' ' + sys.version;

        if (sys.cms !== '') {
            str += '<br><br>@ ' + sys.cms;
        }

        return str;
    }

    function getSystemIssues(info) {
        var str = '';

        var infoCount = info.error.length + info.warning.length + info.info.length;
        if (infoCount > 0) {
            str += '<div class="content p-0">';

            info.error.forEach((issue) => {
                str += '<div class="p-1" style="background:#dc344540"><span class="bg-danger text-white text-center me-2" style="display:inline-block;height:1.5em;width:1.5em;border-radius:1em">&cross;</span>';
                str += issue;
                str += '</div>';
            });
            info.warning.forEach((issue) => {
                str += '<div class="p-1" style="background:#fcb92b40"><span class="bg-warning text-center me-2" style="display:inline-block;height:1.5em;width:1.5em;border-radius:1em">!</span>';
                str += issue;
                str += '</div>';
            });
            info.info.forEach((issue) => {
//                str += '<div class="p-1" style="background:#3a7ddd40"><span class="bg-primary text-white text-center me-2" style="display:inline-block;height:1.5em;width:1.5em;border-radius:1em">i</span>';
                str += '<div class="p-1" style="background:#fcb92b40"><span class="bg-warning text-center me-2" style="display:inline-block;height:1.5em;width:1.5em;border-radius:1em">!</span>';
                str += issue;
                str += '</div>';
            });

            str += '</div>';
        }

        return str;
    }

    function getSystemFilter() {
        var str = '';

        str += '<div class="col-12">';
        str += '<div class="py-5 text-center overflow-hidden">';

        str += '<span class="search-control">';
        str += '<span class="search-icon"><svg style="height:1rem" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.9 19.7"><g class="path" fill="none" stroke="#17a2b8" stroke-width="2"><path stroke-linecap="square" d="M18.5 18.3l-5.4-5.4"/><circle cx="8" cy="8" r="7"/></g></svg></span>';
        str += '<input type="search" placeholder="' + dict[nav.lang].placeholder + '" value="' + initvalSelection + '" />';
        str += '</span>';

        str += '<br><span id="system-count">' + dict[nav.lang].systemsLoading + '</span>';
        str += '</div>';
        str += '</div>';

        str += '<div class="col-12">';
        str += '<div class="row" id="system-list">';
        str += '</div>';
        str += '</div>';

        return str;
    }

    function setupSystemFilterEvents() {
        var input = document.querySelector('.search-control input');
        input.addEventListener('change', debounceEvent);
        input.addEventListener('input', debounceEvent);
        input.addEventListener('keyup', debounceEvent);
        input.addEventListener('focus', updateFilterGetFocus);
        input.addEventListener('blur', updateFilterLostFocus);

        var debounceDelay = 100;
        var debounceTimer = null;
        var debounceValue = null;

        function debounceEvent(e) {
            clearTimeout(debounceTimer);
            debounceValue = e.target.value;
            debounceTimer = setTimeout(function() {
                updateFilterValue(debounceValue);
            }, debounceDelay);
        }
    }

    function updateFilterGetFocus(e) {
        e.target.parentElement.classList.add('focus');
    }

    function updateFilterLostFocus(e) {
        e.target.parentElement.classList.remove('focus');
    }

    function funcSearch(value) {
        var input = document.querySelector('.search-control input');
        input.value = value;

        updateFilterValue(input.value);
    }

    function fixSystemTitle(title) {
        if (title) {
            title = title.replace('conterra', 'con terra');
            title = title.replace('ckan', 'CKAN');
            title = title.replace('dkan', 'DKAN');
            title = title.replace('ekan', 'EKAN');
            title = title.replace('entryscape', 'EntryScape');
            title = title.replace('ingrid', 'InGrid');
            title = title.replace('mobilithek', 'Mobilithek');
            title = title.replace('Opendatasoft', 'Huwise');
            title = title.replace('sparql', 'SPARQL');
        }

        return title;
    }

    function updateSystemFilter(pSystems) {
        var input = document.querySelector('.search-control input');
        updateFilterValue(input.value);

        var elem = document.getElementById('system-list');
        var str = '';

        pSystems.sort((a, b) => {
            if (!a.system) {
                return 1;
            }
            if (!b.system) {
                return -1;
            }
            return a.system.localeCompare(b.system);
        });

        var systems = [];
        var cities = [];
        pSystems.forEach(sys => {
            var s = sys.system;
            s = fixSystemTitle(s);

            if (!systems.includes(s)) {
                systems.push(s);
            }
            if (['p000', 'pQeY', 'paIS', 'pDjX', 'pBTP', 'ptXx'].includes(sys.pobject.pid)) {
                var title = sys.sobject.title;

                if (title[nav.lang]) {
                    title = title[nav.lang];
                } else {
                    title = title.en;
                }
                cities.push(title);
            }
        });

        var list;

        list = [];
        cities.forEach(title => {
            title = title.replace(/['"]+/g, '');
            list.push ('<a href="systems.html?text=' + encodeURIComponent(title) + '&lang=' + nav.lang + '" onclick="system.search(\'' + title + '\');event.preventDefault()">' + title + '</a>');
        });
        str += '<div class="col-12" style="font-size:.75rem">';
        str += '<b>' + dict[nav.lang].tryCity + '</b> ' + list.join(' | ');
        str += '</div>';

        list = [];
        systems.forEach(title => {
            if (!title) {
                title = dict[nav.lang].unknownSystem;
            }
            title = title.replace(/['"]+/g, '');
            list.push ('<a href="systems.html?text=' + encodeURIComponent(title) + '&lang=' + nav.lang + '" onclick="system.search(\'' + title + '\');event.preventDefault()">' + title + '</a>');
        });
        str += '<div class="col-12" style="font-size:.75rem">';
        str += '<b>' + dict[nav.lang].trySoftware + '</b> ' + list.join(' | ');
        str += '</div>';

        elem.innerHTML = str;
    }

    function updateFilterValue(value) {
        var filter = value.trim();
        var all = document.querySelectorAll('.systemItem');
        var query = document.querySelectorAll('.systemItem:has(.title[title*="' + filter + '" i])');
        var count = document.getElementById('system-count');
        var visible = 0;

        if (filter === '') {
            query = all;
        }

        all.forEach(function(elem) {
            elem.style.display = 'none';
        });
        query.forEach(function(elem) {
            if (elem.style.display !== 'block') {
                ++visible;
            }
            elem.style.display = 'block';
        });

        query = document.querySelectorAll('.systemItem:has(.pobject[data-pid="' + filter + '"])');
        query.forEach(function(elem) {
            if (elem.style.display !== 'block') {
                ++visible;
            }
            elem.style.display = 'block';
        });

        query = document.querySelectorAll('.systemItem:has(.content[data-system*="' + filter + '" i])');
        query.forEach(function(elem) {
            if (elem.style.display !== 'block') {
                ++visible;
            }
            elem.style.display = 'block';
        });

        if (visible === 0) {
            count.innerHTML = dict[nav.lang].countSystemNone;
        } else if (visible === 1) {
            count.innerHTML = dict[nav.lang].countSystemOne;
        } else {
            count.innerHTML = dict[nav.lang].countSystems.replace('{number}', visible);
        }

        var params = new URLSearchParams(window.location.search);
        if (value === defaultSelection) {
            params.delete(paramSelection);
        } else {
            params.set(paramSelection, value);
        }
        window.history.replaceState({}, '', `${location.pathname}?${params}`);
    }

    function getSystemItem(sys) {
        var info = getIssueInfo(sys);

        sys.version = sys.version === null || sys.version === undefined ? '' : sys.version;
        sys.system = sys.system === null || sys.system === undefined ? '' : sys.system;
        sys.cms = sys.cms === null || sys.cms === undefined ? '' : sys.cms.replace('(http://drupal.org)', '').replace('(https://www.drupal.org)', '').trim();

        var classTitle = '';
        var classBorder = ' border-blue';
        if (info.error.length > 0) {
            classTitle = ' bg-danger text-white';
            classBorder = ' border-danger';
        } else if (info.warning.length > 0) {
            classTitle = ' bg-warning text-dark';
            classBorder = ' border-warning';
        } else if (info.info.length > 0) {
//            classTitle = ' bg-primary text-white';
//            classBorder = ' border-primary';
            classTitle = ' bg-warning text-dark';
            classBorder = ' border-warning';
        }

        var str = '';
        str += '<div class="systemItem col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2 pt-3">';
        str += '<div class="border overflow-hidden system' + classBorder + '">';

        var title = getSystemTitle(sys.sobject);
        if (title === '') {
            title = sys.url || sys.pobject.deepLink;
        }

        var image = (sys.sobject && sys.sobject.image && sys.sobject.image.url !== '') ? '<img src="' + sys.sobject.image.url + '">' : '';

        str += '<div class="title' + classTitle + '" title="' + title + '">' + title + '</div>';

        str += '<div class="content" style="height:calc(2.5rem + 1px);border-top:none">';
        str += '<div class="pobject" data-pid="' + sys.pobject.pid + '">' + sys.pobject.pid + '</div>';
        str += image;
        str += '</div>';

        var system = sys.system;
        if (system) {
            system = fixSystemTitle(system);
        } else {
            system = dict[nav.lang].unknownSystem;
        }

        str += '<div class="content" data-system="' + system + '">';
        str += system;

        try {
            if ('ArcGIS Hub' === system) {
                str += getSystemArcGISHubItem(sys);
            } else if ('CKAN' === system) {
                str += getSystemCKANItem(sys);
            } else if ('con terra' === system) {
                str += getSystemConterraItem(sys);
            } else if ('DKAN' === system) {
                str += getSystemDKANItem(sys);
            } else if ('EKAN' === system) {
                str += getSystemEKANItem(sys);
            } else if ('EntryScape' === system) {
                str += getSystemEntryScapeItem(sys);
            } else if ('Huwise' === system) {
                str += getSystemHuwiseItem(sys);
            } else if ('Piveau' === system) {
                str += getSystemPiveauItem(sys);
            } else if ('DUVA' === system) {
                str += getSystemDuvaItem(sys);
            } else if ('SPARQL' === system) {
                str += getSystemSPARQLItem(sys);
            } else {
                str += getSystemOtherItem(sys);
            }
        } catch (x) {
            str += '<br><span class="badge text-dark" style="display:table;height:.9rem;margin:0 auto;padding:.2rem .4rem;border-radius:.45rem;background:#dc344540;font-style:italic">' + dict[nav.lang].systemException + '</span>';
        }

        str += '</div>';
        str += '<div class="content p-0">';

        if (sys.sobject) {
            str += '<a href="catalogs.html?sid=' + sys.sobject.sid + '&lang=' + nav.lang + '"><div class="bottom">' + dict[nav.lang].linkOpen + '</div></a>';
        }
        str += '<a href="' + sys.pobject.url + '" target="_blank"><div class="bottom white">' + dict[nav.lang].linkOrigin + '</div></a>';
        str += '<a href="' + sys.pobject.deepLink + '" target="_blank"><div class="bottom white">' + dict[nav.lang].linkAPI + '</div></a>';

        str += '</div>';

        str += getSystemIssues(info);

        str += '</div>';
        str += '</div>';

        return str;
    }

    function updateSystemTable() {
        var systemRow = document.getElementById(idSystemRow);

        var otherTableHead = document.getElementById(idOtherSystemsHead);
        var otherTableBody = document.getElementById(idOtherSystemsBody);
        var otherTableFoot = document.getElementById(idOtherSystemsFoot);

        if (!otherTableHead) {
            return;
        }

        var systemCanvas = '';
        var otherBody = '';

        pSystems.sort((a, b) => {
            return getSystemTitle(a.sobject).localeCompare(getSystemTitle(b.sobject));
        });

        pSystems.forEach(sys => {
            var system = sys.system;

            if (['ArcGIS Hub', 'ckan','conterra','dkan','DUVA','ekan','entryscape','geoportal.de','ingrid','mobilithek','Opendatasoft','Piveau','sparql'].indexOf(system) !== -1) {
systemCanvas += getSystemItem(sys);
            } else {
                otherBody += getOtherSystemsRow(sys);
            }

//            systemCanvas += getSystemItem(sys);
        });

        if (otherBody.length === 0) {
            otherBody += '<tr><td class="fst-italic" style="color:#888">No data available</td></tr>';
        }

        systemRow.innerHTML = systemCanvas;

        updateSystemFilter(pSystems);

        otherTableHead.innerHTML = getOtherSystemsHead();
        otherTableBody.innerHTML = otherBody;
        otherTableFoot.innerHTML = '<tr><td style="border:none">' + (otherBody.split('<tr>').length - 1) + ' systems</td></tr>';
    }

    function funcUpdate() {
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
        getTitle: getSystemTitle,
        loadData: funcLoadData,
        onExpandExtension: funcOnExpandExtension,
        search: funcSearch,
        update: funcUpdate,
    };
}());