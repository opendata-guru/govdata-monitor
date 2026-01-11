var catalog = (function () {
    var baseURL = 'https://opendata.guru/api/2';
    var oldInitvalId = '', // depricated
        oldDefaultId = 'govdata', // depricated
        sID = '',
        sObject = null;
        lObjects = [];
        lObjectsCount = [];
        pObjects = [];
        pObjectsLoadedLObjects = 0;
        defaultSID = 'smZ1A'; //GovData
    var idCatalogHistoryTitle = 'catalog-history-title',
        idParentTitle = 'parent-title',
        idSupplierHistoryTitle = 'supplier-history-title',
        idCardPObjects = 'card-portals',
        idChartPObjects = 'chart-portals',
        idSObjectBox = 'sobject-box';
        idSObjectIntro = 'sobject-intro';
        idSObjectSlideshow = 'sobject-slideshow';
        idCatalogList = 'catalog-list',
        idCatalogChart = 'catalog-chart';
    var paramId = 'sid',
        oldParamId = 'catalog'; // depricated
    var idInteractiveAddSupplier = 'interactive-add-sobject',
        idInteractiveAddSupplierType = 'add-supplier-type',
        idInteractiveAddSupplierRelation = 'add-supplier-relation',
        idInteractiveAddSupplierSameAs = 'add-supplier-same-as',
        idInteractiveAddSupplierPartOf = 'add-supplier-part-of',
        idInteractiveAddSupplierWikidata = 'add-supplier-wikidata',
        idInteractiveAddSupplierTitle = 'add-supplier-title',
        idInteractiveAddSupplierError = 'add-supplier-error',
        idInteractiveAddSupplierButton = 'add-supplier-button',
        idInteractiveAddSupplierButton2 = 'add-supplier-button-2';
    var idInteractiveEditSystem = 'interactive-edit-lobject',
        idInteractiveEditSystemLObject = 'edit-system-lobject',
        idInteractiveEditSystemSObject = 'edit-system-sobject',
        idInteractiveEditSystemLObjects = 'edit-system-lobjects',
        idInteractiveEditSystemSObjects = 'edit-system-sobjects',
        idInteractiveEditSystemSearch = 'edit-system-search',
        idInteractiveEditSystemSelection = 'edit-system-selection',
        idInteractiveEditSystemLoadSObjects = 'edit-system-load-sobjects',
        idInteractiveEditSystemButton = 'edit-system-button',
        idInteractiveEditSystemButton2 = 'edit-system-button-2',
        idInteractiveEditSystemError = 'edit-system-error';
    var classInteractiveHeader = 'ia-header',
        selectedModifyPortalLID = '',
        selectedModifySystemSID = '',
        loadedSObjects = [],
        filterSObjects = '',
        catalogList = [],
        showOnlyImperfectPObjects = true,
        slideIndex = 0,
        slideShowTimeout = 10000;
    var dict = {
            de: {
                catalogHistory: 'Historie der Daten in jedem Portal',
                dataFlow: 'Datenfluss',
                lastSeenMoreDays: 'Zuletzt gesehen vor {days} Tagen',
                lastSeenOneDay: 'Gestern zuletzt gesehen',
                lastSeenZeroDays: 'Heute zuletzt gesehen',
                linkToGeonames: 'Geografische Informationen auf {Geonames} anzeigen.',
                linkToGND: 'Zeige das Datenobjekt in der {GND} ("Gemeinsame Normdatei") an.',
                linkToOSM: 'Eine Karte auf {OSM} (OpenStreetMap) anzeigen.',
                linkToWikidata: 'Datenobjekt auf {Wikidata} anzeigen.',
                linkToWikipedia: 'Lese mehr auf {Wikipedia}.',
                portalLined: 'Die Daten werden im Portal {portal} {image} mit der Herkunft {id} veröffentlicht.',
                portalLinedShort: 'Im Portal {portal} ({id})',
                portalOutdated: 'Seit {days} Tagen werden dort aber keine Daten mehr angeboten.',
                portalOwn: 'Die Daten werden im eigenen Portal von {portal} {image} unter dem Namen {id} veröffentlicht.',
                portalMore: 'Für weitere Informationen und Statistiken gehe zu {link} oder gehe direkt zum Portal {externallink}.',
                portalMoreExternal: 'Gehe direkt zum Portal {externallink}.',
                portalPortal: 'Die Daten werden im eigenen Portal auf {url} {image} veröffentlicht.',
                portalPortalShort: 'Im Portal {url}',
                saveAsCSV: 'Als CSV herunterladen',
                suppliers: 'Datenliefernde',
                suppliersCountMore: '{count} Datenliefernde',
                suppliersCountMoreFilter: '{count} Datenliefernde (gefiltert aus {max} Datenliefernden)',
                suppliersCountOne: '1 Datenliefernde:r',
                suppliersCountOneFilter: '1 Datenliefernde:r (gefiltert aus {max} Datenliefernden)',
                suppliersCountZero: 'Keine Datenliefernde',
                suppliersCountZeroFilter: 'Keine Datenliefernde (gefiltert aus {max} Datenliefernden)',
                suppliersError: 'Beim Ermitteln, wer die Daten bereitgestellt hat, ist ein Fehler aufgetreten',
                suppliersHistory: '{days} Tage Datenliefernde Historie',
                unknownPortal: 'Portal',
                unknownSupplier: 'Unbekannte Datenquelle',
            },
            en: {
                catalogHistory: 'History of the data in each portal',
                dataFlow: 'Data flow',
                lastSeenMoreDays: 'Last seen {days} days ago',
                lastSeenOneDay: 'Last seen yesterday',
                lastSeenZeroDays: 'Last seen today',
                linkToGeonames: 'Display geographic information on {Geonames}.',
                linkToGND: 'Display the data object in the {GND} ("Common Authority File").',
                linkToOSM: 'Display a map on {OSM} (OpenStreetMap).',
                linkToWikidata: 'Display data object on {Wikidata}.',
                linkToWikipedia: 'Read more on {Wikipedia}.',
                portalLined: 'The data will be published in the portal {portal} {image} with the origin {id}.',
                portalLinedShort: 'In portal {portal} ({id})',
                portalOutdated: 'No data has been offered there for {days} days.',
                portalOwn: 'The data will be published on {portal}\'s {image} own portal under the name {id}.',
                portalMore: 'For more information and statistics go to {link} or go directly to the portal {externallink}.',
                portalMoreExternal: 'Go directly to the portal {externallink}.',
                portalPortal: 'The data will be published on own portal at {url} {image}.',
                portalPortalShort: 'In portal {url}',
                saveAsCSV: 'Download as CSV',
                suppliers: 'Data Suppliers',
                suppliersCountMore: '{count} data suppliers',
                suppliersCountMoreFilter: '{count} data suppliers (filtered from {max} data suppliers)',
                suppliersCountOne: '1 data supplier',
                suppliersCountOneFilter: '1 data supplier (filtered from {max} data suppliers)',
                suppliersCountZero: 'No data suppliers',
                suppliersCountZeroFilter: 'No data suppliers (filtered from {max} data suppliers)',
                suppliersError: 'An error occurred while determining who suppliered the data',
                suppliersHistory: '{days} days supplier history',
                unknownPortal: 'Portal',
                unknownSupplier: 'Unknown data supplier',
            },
        };

    function init() {
        var params = new URLSearchParams(window.location.search);

        if (params.has(paramId)) {
            sID = params.get(paramId);
        } else {
            sID = defaultSID;
        }

        if (params.has(oldParamId)) { // depricated
            oldInitvalId = params.get(oldParamId); // depricated
        } else { // depricated
            oldInitvalId = oldDefaultId; // depricated
        } // depricated

        startSlideshow();
    }

    function setId(id) { // depricated
        oldInitvalId = id; // depricated

        if (catalog) { // depricated
            catalog.id = oldInitvalId; // depricated
        } // depricated

        var params = new URLSearchParams(window.location.search); // depricated
        if (id === oldDefaultId) { // depricated
            params.delete(oldParamId); // depricated
        } else { // depricated
            params.set(oldParamId, id); // depricated
        } // depricated
        window.history.pushState({}, '', `${location.pathname}?${params}`); // depricated
    }

    function setSID_(id) {
        sID = id;

        if (catalog) {
            catalog.sID = sID;
        }

        var params = new URLSearchParams(window.location.search);
        if (id === defaultSID) {
            params.delete(paramId);
        } else {
            params.set(paramId, id);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);
    }

    function funcGet(id) {
        var dataObj = data.get();
        var obj = undefined; 

        if (dataObj && id) {
            dataObj.forEach((row) => {
                if (row.id === id) {
                    obj = row;
                }
            });
        }

        return obj;
    }

    function funcGetBySID(sid) {
        var dataObj = data.get();
        var obj = undefined; 

        if (dataObj && sid) {
            dataObj.forEach((row) => {
                if (row.sid === sid) {
                    obj = row;
                }
            });
        }

        return obj;
    }

    function funcGetSameAs(id) {
        var catalogObject = funcGet(id);
        var dataObj = data.get();
        var ret = [];

        if (catalogObject && dataObj && id) {
            dataObj.forEach((row) => {
                if (catalogObject.wikidata && (catalogObject.wikidata !== '') && (row.wikidata === catalogObject.wikidata)) {
                    ret.push(row.id);
                } else if (catalogObject.contributor && (catalogObject.contributor !== '') && (row.contributor === catalogObject.contributor)) {
                    ret.push(row.id);
                } else if (catalogObject.linkTimestamp && (catalogObject.linkTimestamp !== '') && (row.linkTimestamp === catalogObject.linkTimestamp)) {
                    ret.push(row.id);
                }
            });
        }

        if (catalogObject && (ret.length === 0)) {
            ret.push(catalogObject.id);
        }

        return ret;
    }

    function getDownloadMenu(chartObjectName) {
        var html = '';
        html += '<a title="Options" class="ms-3" style="text-decoration:none;float:right;color:#939ba2;border:1px solid #939ba2;border-radius:2rem;height:2rem;width:2rem;line-height:1.6rem;text-align:center" href="#" id="downloadDropdown" data-bs-toggle="dropdown">';
        html += '<span>...</span>';
        html += '</a>';
        html += '<div class="dropdown-menu dropdown-menu-lg dropdown-menu-start py-2" aria-labelledby="downloadDropdown" id="table-menu">';
        html += '<a onclick="monitorDownloadAsCSV(\'' + chartObjectName + '\')" class="d-block px-3 py-1 text-dark fw-normal">Download as CSV table</a>';
//        html += '<a onclick="monitorDownloadAsPNG()" class="d-block px-3 py-1 text-dark fw-normal">Download as PNG image</a>';
        html += '<div class="dropdown-divider"></div>';
        html += '<a onclick="monitorLoadMoreDays(7)" class="d-block px-3 py-1 text-dark fw-normal">Load more data (one week)</a>';
        html += '<a onclick="monitorLoadMoreDays(30)" class="d-block px-3 py-1 text-dark fw-normal">Load more data (one month)</a>';
        html += '<a onclick="monitorRemoveLoadedDays()" id="removeLoadedDays" class="d-block px-3 py-1 fw-normal" style="color:#ccc;pointer-events:none">Remove loaded data</a>';
        html += '<div class="dropdown-divider"></div>';
        html += '<a onclick="monitorZoomIn()" id="historyZoomIn" class="d-block px-3 py-1 text-dark fw-normal" style="color:#ccc">Maximize diagramm</a>';
        html += '<a onclick="monitorZoomOut()" id="historyZoomOut" class="d-block px-3 py-1 fw-normal" style="color:#ccc;pointer-events:none">Minimize diagramm</a>';
        html += '</div>';

        return html;
    }

    function funcUpdate() {
        var elemHistory = document.getElementById(idCatalogHistoryTitle);
        if (elemHistory) {
            elemHistory.innerHTML = data.loadedDays + ' days catalog history ' + getDownloadMenu('charthistory');
        }

        elemHistory = document.getElementById(idSupplierHistoryTitle);
        if (elemHistory) {
            elemHistory.innerHTML = data.loadedDays + ' days supplier history ' + getDownloadMenu('chartsupplier');
        }

        elemHistory = document.getElementById(idParentTitle);
        if (elemHistory) {
            elemHistory.innerHTML = dict[nav.lang].dataFlow;
        }

        if (data.loadedDays > data.initalDays) {
            if (document.getElementById('removeLoadedDays')) {
                document.getElementById('removeLoadedDays').style.pointerEvents = '';
                document.getElementById('removeLoadedDays').classList.add('text-dark');
            }
        }
    }

    function funcSet(catalogId) {
        if ((catalogId === oldDefaultId) && (sID !== defaultSID)) { // depricated
            // fix old id
            var catalogObj = funcGetBySID(sID);
            if (catalogObj) {
                catalogId = catalogObj.id;
            }
        }

        setId(catalogId); // depricated
//        setSID_(catalogId);
//        updateSID();

        window.scrollTo(0, 0);

        var catalogObject = funcGet(catalogId);

        if (catalogObject) {
            setSID_(catalogObject.sid);
            updateSID();
        }

        catalog.update();
        if (date) {
            date.update();
        }
        data.emitFilterChanged();
    }

    function funcSetLID(lid) {
        // todo

        window.scrollTo(0, 0);

        catalog.update();
//        if (parents) {
//            parents.updateSID();
//        }
        if (date) {
            date.update();
        }
        data.emitFilterChanged();
    }

    function funcSetSID(sID) {
        // fix old id
        var catalogObj = funcGetBySID(sID); // depricated
        if (catalogObj) { // depricated
            var catalogId = catalogObj.id; // depricated
            setId(catalogId); // depricated
        } // depricated

        setSID_(sID);
        updateSID();

        window.scrollTo(0, 0);

        catalog.update();
        if (date) {
            date.update();
        }
        data.emitFilterChanged();
    }

    function buildCatalogChart() {
        var displayDays = 30;

        if (chartCatalogObjects) {
            var dateFirst = null;
            var dateLast = null;

            catalogList.forEach((item) => {
                var first = (new Date(item.dateFirst)).getTime();
                var last = (new Date(item.dateLast)).getTime();

                dateFirst = dateFirst ? Math.min(first, dateFirst) : first;
                dateLast = dateLast ? Math.max(last, dateLast) : last;
            });

            if (dateFirst && dateLast) {
                var selectionBegin = new Date(dateLast);
                var selectionEnd = new Date(dateLast);
                selectionBegin.setDate(selectionBegin.getDate() - displayDays);
                selectionBegin = new Date(Math.max(selectionBegin, dateFirst));

                dateFirst = (new Date(dateFirst)).toLocaleString('sv-SE').split(' ')[0];
                dateLast = (new Date(dateLast)).toLocaleString('sv-SE').split(' ')[0];
                selectionBegin = selectionBegin.toLocaleString('sv-SE').split(' ')[0];
                selectionEnd = selectionEnd.toLocaleString('sv-SE').split(' ')[0];

                chartCatalogObjects.build({
                    catalogList: catalogList,
                    dateFirst: dateFirst,
                    dateLast: dateLast,
                    days: displayDays,
                    dict: dict,
                    lObjects: lObjects,
                    pObjects: pObjects,
                    selectionBegin: selectionBegin,
                    selectionEnd: selectionEnd,
                    sObject: sObject,
                });
            }
        }
    }

    function buildPortalChart(pObject) {
        var loadedDays = 20;

        chartLObjects.build({
            days: loadedDays,
            dict: dict,
            lObjectsCount: lObjectsCount,
            pObject: pObject,
        });
    }

    function buildPortalTable(pObject, dates) {
        tableLObjects.build({
            dates: dates,
            dict: dict,
            lObjectsCount: lObjectsCount,
            pObject: pObject,
        });
    }

    function funcRebuildAllPortalTables() {
        buildCatalogChart();

        pObjects.forEach((pObject) => {
            buildPortalChart(pObject);

//            var current = new Date(Date.now());
//            var currentDate = current.toLocaleString('sv-SE').split(' ')[0];
//
//            buildPortalTable(pObject, [currentDate]);
            buildPortalTable(pObject, date.selection);
        });
    }

    function updateSID_storeLObjectsCount(payload, dateString) {
        if (payload) {
            lObjectsCount[dateString] = payload;
        } else {
            lObjectsCount[dateString] = [];
        }

        funcRebuildAllPortalTables();
    }

    function updateSID_loadLObjectsCount(urlCountL, dateString) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', urlCountL, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                updateSID_storeLObjectsCount(JSON.parse(this.responseText), dateString);
            } else if (this.readyState == 4) {
                updateSID_storeLObjectsCount(null, dateString);
            }
        }

        if (dateString in lObjectsCount) {
            updateSID_storeLObjectsCount(lObjectsCount[dateString], dateString);
        } else {
            xhr.send();
        }
    }

    function storeCatalogObjectCount(payload) {
        if (payload) {
            catalogList.forEach((item) => {
                if ((item.pid && (item.pid === payload.pid) && !payload.lid) ||
                    (item.lid && (item.lid === payload.lid))) {
                    var keys = Object.keys(payload.count);
                    keys.sort();

                    item.count = payload.count;
                    item.dateFirst = keys.length === 0 ? null : keys[0];
                    item.dateLast = keys.length === 0 ? null : keys.slice(-1)[0];
                }
            });
        }

        buildCatalogChart();
    }

    function loadCatalogObjectCount(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storeCatalogObjectCount(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                storeCatalogObjectCount(null);
            }
        }

        xhr.send();
    }

    function fifth_load20Dates() {
        var current = new Date(Date.now());
        var dateString;

        for (var d = 0; d < 20; ++d) {
            dateString = current.toLocaleString('sv-SE').split(' ')[0];
            updateSID_loadLObjectsCount(baseURL + '/l/count/' + dateString, dateString);

            current.setDate(current.getDate() - 1);
        }
    }

    function fourth_storePObjectLObjects(payload, pid) {
        var pObjectLObjects = null;

        if (payload) {
            pid = payload.pid;
            pObjectLObjects = payload.lobjects;
        }

        pObjects.forEach((pObject) => {
            if (pObject.pid === pid) {
                pObject.lObjects = pObjectLObjects;

                buildPortalChart(pObject);
                buildPortalTable(pObject, []);

                ++pObjectsLoadedLObjects;
            }
        });

        if (pObjects.length === pObjectsLoadedLObjects) {
            fifth_load20Dates();            
        }
    }

    function fourth_loadPObjectLObjects(url, pid) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                fourth_storePObjectLObjects(JSON.parse(this.responseText), pid);
            } else if (this.readyState == 4) {
                fourth_storePObjectLObjects(null, pid);
            }
        }

        xhr.send();
    }

    function fillCatalogList() {
        var str = '';
        var serial = 0;
        var objectCount = pObjects.length + lObjects.length;
        var colClass = 'col-12';
        var swatch = chartGetColorSwatch();

        if (objectCount === 1) {
            colClass = 'col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12';
        } else if (objectCount === 2) {
            colClass = 'col-12 col-sm-6 col-md-6 col-lg-6 col-xl-6';
        } else if (objectCount === 3) {
            colClass = 'col-12 col-sm-6 col-md-4 col-lg-4 col-xl-4';
        } else if (objectCount === 4) {
            colClass = 'col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3';
        } else {
            colClass = 'col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2';
        }

        catalogList = [];
        if (pObjects.length > 0) {
            pObjects.forEach((pObject) => {
                var color = swatch[serial];

                str += '<div class="' + colClass + '">';
                str += '<div style="border-bottom: .2rem solid ' + color + ';height:1.4rem;margin-bottom:1.25rem">';
                str += '<span style="border: .2rem solid ' + color + ';background:#fff;border-radius:50%;font-weight:bolder;display:inline-block;width:2.5rem;height:2.5rem;line-height:2.3rem;text-align:center;margin-left:.5rem">' + (serial + 1) + '</span>';
                str += '</div>';
                str += '<div id="catalog-' + pObject.pid + '">';
                str += '<div class="loading-bar mb-2 pb-2" style="height:3rem"></div>';
                str += '</div>';
                str += '</div>';

                catalogList.push({
                    color: color,
                    id: 'catalog-' + pObject.pid,
                    pid: pObject.pid,
                    serial: serial,
                });

                ++serial;
            });
        }

        if (lObjects.length > 0) {
            lObjects.forEach((lObject) => {
                var parentTitle = lObject.title;
                var parentSID = lObject.sid;
                var portalTitle = system.getTitle(lObject?.pobject?.sobject);
                var portalURL = lObject?.pobject?.url;
                var portalSID = lObject?.pobject?.sid;
                var portalImage = lObject?.pobject?.sobject?.image?.url;
                var portalLink = '<a href="' + portalURL + '" target="_blank">' + portalTitle + '</a>';
                var internalURL = 'sid=' + portalSID + (nav.lang === 'en' ? '' : '&lang=' + nav.lang);
                var onClick = 'catalog.setSID(\'' + portalSID + '\')';
                var internalLink = '<a href="catalogs.html?' + internalURL + '" onclick="' + onClick + '";event.preventDefault()>' + portalTitle + '</a>';
                var lastseenMilliseconds = new Date((new Date(Date.now())).getTime() - (new Date(lObject.lastseen)).getTime());
                var lastseen = Math.floor(lastseenMilliseconds/(24*3600*1000));
                var color = swatch[serial];

                portalTitle = '<span style="border-bottom: .1rem solid ' + color + ';background:' + color + '40;padding:.1rem .3rem">' + portalTitle + '</span>';
                parentTitle = '<span style="border-bottom: .1rem solid ' + color + ';background:' + color + '40;padding:.1rem .3rem;word-break:break-word">' + parentTitle + '</span>';
                portalImage = '<img src="' + portalImage + '" style="height:1.25rem">';

                str += '<div class="' + colClass + '">';
                str += '<div style="border-bottom: .2rem solid ' + color + ';height:1.4rem;margin-bottom:1.25rem">';
                str += '<span style="border: .2rem solid ' + color + ';background:#fff;border-radius:50%;font-weight:bolder;display:inline-block;width:2.5rem;height:2.5rem;line-height:2.3rem;text-align:center;margin-left:.5rem">' + (serial + 1) + '</span>';
                str += '</div>';
                str += '<div>';
                if (parentSID === portalSID) {
                    str += dict[nav.lang].portalOwn.replace('{portal}',portalTitle).replace('{image}',portalImage).replace('{id}',parentTitle) + ' ';
                    if (lastseen > 1) {
                        str += dict[nav.lang].portalOutdated.replace('{days}',lastseen) + ' ';
                    }
                    str += '</div>';
                    str += '<div class="mt-3 pb-4" style="font-size:.8em;color:#777">';
                    str += dict[nav.lang].portalMoreExternal.replace('{externallink}', portalLink);
                } else {
                    str += dict[nav.lang].portalLined.replace('{portal}',portalTitle).replace('{image}',portalImage).replace('{id}',parentTitle) + ' ';
                    if (lastseen > 1) {
                        str += dict[nav.lang].portalOutdated.replace('{days}',lastseen) + ' ';
                    }
                    str += '</div>';
                    str += '<div class="mt-3 pb-4" style="font-size:.8em;color:#777">';
                    str += dict[nav.lang].portalMore.replace('{link}', internalLink).replace('{externallink}', portalLink);
                }
                str += '</div>';
                str += '</div>';

                catalogList.push({
                    color: color,
                    lid: lObject.lid,
                    serial: serial,
                });

                ++serial;
            });
        }

        str += '<div id="' + idCatalogChart + '" class="col-12 col-sm-12 col-md-12 col-xl-12">';
        str += '  <div>&nbsp;</div>';
        str += '  <div class="loading-bar my-3 pb-2" style="height:16rem"></div>';
        str += '</div>';

        elem = document.getElementById(idCatalogList);
        elem.innerHTML = str;

        buildCatalogChart();

        catalogList.forEach((item) => {
            if (item.pid) {
                loadCatalogPObject(item.id, baseURL + '/p/' + item.pid, item.color);
            }

            if (item.pid) {
                loadCatalogObjectCount(baseURL + '/p/' + item.pid + '/count');
            } else {
                loadCatalogObjectCount(baseURL + '/l/' + item.lid + '/count');
            }
        });
    }

    function fillCatalogListPObject(id, pObject, color) {
        var str = '';

        var portalTitle = system.getTitle(pObject.sobject);
        var portalURL = pObject.url;
        var portalImage = pObject.sobject?.image?.url;
        var portalLink = '<a href="' + portalURL + '" target="_blank">' + portalTitle + '</a>';

        portalURL = portalURL.replace(/^(https:\/\/)/,"");
        portalURL = portalURL.replace(/^(http:\/\/)/,"");
        portalURL = portalURL.replace(/^(www\.)/,"");

        portalURL = '<span style="border-bottom: .1rem solid ' + color + ';background:' + color + '40;padding:.1rem .3rem;word-break:break-word">' + portalURL + '</span>';
        portalImage = '<img src="' + portalImage + '" style="height:1.25rem">';

        str += '<div>';
        str += dict[nav.lang].portalPortal.replace('{url}',portalURL).replace('{image}',portalImage) + ' ';
        str += '</div>';
        str += '<div class="mt-3 pb-4" style="font-size:.8em;color:#777">';
        str += dict[nav.lang].portalMoreExternal.replace('{externallink}', portalLink);
        str += '</div>';

        var elem = document.getElementById(id);
        elem.innerHTML = str;
    }

    function third_storePObjects(payload) {
        pObjects = [];
        pObjectsLoadedLObjects = 0;

        if (payload && payload.pobjects) {
            pObjects = payload.pobjects;
        }

        fillCatalogList();

        var strChart = '';
        var strCard = '';
        pObjects.forEach((pObject) => {
            strChart += '<div id="portal-chart-' + pObject.pid + '">';
            strChart += '  <div>&nbsp;</div>';
            strChart += '  <div class="loading-bar my-3 pb-2" style="height:16rem"></div>';
            strChart += '</div>';

            strCard += '<div class="col">';
            strCard += '  <div id="portal-' + pObject.pid + '">';
            strCard += '    <div class="loading-bar mb-2 pb-2" style="height:6.5rem"></div>';
            strCard += '  </div>';
            strCard += '</div>';
        });

        elem = document.getElementById(idChartPObjects);
        elem.innerHTML = strChart;

        elem = document.getElementById(idCardPObjects);
        elem.innerHTML = strCard;

        if (pObjects.length > 0) {
            pObjects.forEach((pObject) => {
                fourth_loadPObjectLObjects(baseURL + '/p/' + pObject.pid + '/l', pObject.pid);
            });
        } else {
            if (pObjects.length === pObjectsLoadedLObjects) {
                fifth_load20Dates();            
            }
        }
    }

    function loadCatalogPObject(id, url, color) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storeCatalogPObject(id, JSON.parse(this.responseText), color);
            } else if (this.readyState == 4) {
                storeCatalogPObject(id, null, color);
            }
        }

        xhr.send();
    }

    function storeCatalogPObject(id, payload, color) {
        var pObject = payload;

        fillCatalogListPObject(id, pObject, color);
    }

    function third_loadPObjects(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                third_storePObjects(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                third_storePObjects(null);
            }
        }

        xhr.send();
    }

    function second_storeLObjects(payload) {
        lObjects = [];

        if (payload && payload.lobjects) {
            lObjects = payload.lobjects;
        }

        if (sObject) {
            third_loadPObjects(baseURL + '/s/' + sObject.sid + '/p');
        } else {
            third_storePObjects(null);
        }
    }

    function second_loadLObjects(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                second_storeLObjects(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                second_storeLObjects(null);
            }
        }

        xhr.send();
    }

    function funcGetSObject() {
        return sObject;
    }

    function updateElementsSObject(sObject) {
        var title = sObject ? sObject.title[nav.lang] : dict[nav.lang].unknownSupplier;
        var type = sObject ? data.getTypeString(sObject.type) : '';

        var str = '';
        str += '<div class="pb-2" style="height:3.5rem">';
        str += '<h1 class="fw-light fs-3 my-0">' + title + '</h1>';
        str += '<div>' + type + '</div>';
        str += '</div>';

        var elem = document.getElementById(idSObjectBox);
        if (elem) {
            elem.innerHTML = str;
        }

        var partOf = sObject.partOf?.wikidata;
        var sameAs = sObject.sameAs?.wikidata;
        var wikidata = sameAs ? sameAs : partOf;

        if (wikidata) {
            loadWikidata(wikidata);
        } else {
            storeWikidata(null);
        }
    }

    function first_storeSObject(payload) {
        sObject = payload;

        updateElementsSObject(sObject);

        if (sObject) {
            second_loadLObjects(baseURL + '/s/' + sObject.sid + '/l');
        } else {
            second_storeLObjects(null);
        }

        if (parents) {
            parents.updateSID();
        }
    }

    function first_loadSObject(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        sObject = null;

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                first_storeSObject(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                first_storeSObject(null);
            }
        }

        xhr.send();
    }

    function updateSID() {
        var elem = document.getElementById(idSObjectBox);
        if (!elem) {
            return;
        }

        if ((sID === '') || (sID === 'undefined') || (sID === undefined)) {
            first_storeSObject(null);
        } else {
            if ((sObject === null) || (sObject.sid !== sID)) {
                var str = '';
                str += '<div class="loading-bar mb-2 pb-2" style="height:18rem"></div>';

                elem = document.getElementById(idChartPObjects);
                elem.innerHTML = str;

                str = '';
                str += '<div class="col-12">';
                str += '  <div class="loading-bar mb-2 pb-2" style="height:6.5rem"></div>';
                str += '</div>';

                elem = document.getElementById(idCardPObjects);
                elem.innerHTML = str;

                str = '';
                str += '<div class="loading-bar pb-2" style="height:3.5rem"></div>';

                elem = document.getElementById(idSObjectBox);
                elem.innerHTML = str;

                str = '';
                str += '<div class="loading-bar pb-2" style="height:10rem"></div>';

                elem = document.getElementById(idSObjectIntro);
                elem.innerHTML = str;

                str = '';
                str += '<div class="loading-bar pb-2" style="height:12rem"></div>';

                elem = document.getElementById(idSObjectSlideshow);
                elem.innerHTML = str;

                str = '';
                str += '<div class="loading-bar pb-2" style="height:12rem"></div>';

                elem = document.getElementById(idCatalogList);
                elem.innerHTML = str;

                first_loadSObject(baseURL + '/s/' + sID);
            }
        }
    }

    function getWikidataSPARQL(wikipediaURL) {
        var  qid = wikipediaURL.split('/').pop();
        var sparqlQuery = 'SELECT ' +
            '?item ' +
            '(SAMPLE(?gnd) as ?gnd) ' +
            '(SAMPLE(?osm) as ?osm) ' +
            '(SAMPLE(?geonames) as ?geonames) ' +
            '(SAMPLE(?photo1) as ?photo1) ' +
            '(SAMPLE(?photo2) as ?photo2) ' +
            '(SAMPLE(?photo3) as ?photo3) ' +
            '(SAMPLE(?banner) as ?banner) ' +
//            '(SAMPLE(?logo) as ?logo) ' +
            '(SAMPLE(?map) as ?map) ' +
//            '(SAMPLE(?flag) as ?flag) ' +
//            '(SAMPLE(?coat) as ?coat) ' +
            '(SAMPLE(?article) as ?article) ' +
            '' +
            'WHERE {' +
            '  BIND(wd:' + qid + ' as ?item)' +
            '' +
            '  OPTIONAL { ?item wdt:P227 ?gnd. }' +
            '' +
            '  OPTIONAL { ?item wdt:P402 ?osm. }' +
            '' +
            '  OPTIONAL { ?item wdt:P1566 ?geonames. }' +
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
            '  OPTIONAL { ?item wdt:P948 ?banner. }' +
            '  BIND(IF( BOUND( ?banner), ?banner, "") AS ?banner)' +
            '' +
//            '  OPTIONAL { ?item wdt:P154 ?logo. }' +
//            '  BIND(IF( BOUND( ?logo), ?logo, "") AS ?logo)' +
            '' +
            '  OPTIONAL { ?item wdt:P242 ?map. }' +
            '  BIND(IF( BOUND( ?map), ?map, "") AS ?map)' +
            '' +
//            '  OPTIONAL { ?item wdt:P41 ?flag. }' +
//            '  BIND(IF( BOUND( ?flag), ?flag, "") AS ?flag)' +
            '' +
//            '  OPTIONAL { ?item wdt:P94 ?coat. }' +
//            '  BIND(IF( BOUND( ?coat), ?coat, "") AS ?coat)' +
            '' +
            '  OPTIONAL {' +
            '    ?article schema:about ?item .' +
            '    ?article schema:inLanguage "' + nav.lang + '" .' +
            '    ?article schema:isPartOf <https://' + nav.lang + '.wikipedia.org/> .' +
            '  }' +
            '}' +
            'GROUP BY ?item';

        return sparqlQuery;
    }

    function loadWikidata(wikidataURL) {
        var endpointUrl = 'https://query.wikidata.org/sparql';
        var sparqlQuery = getWikidataSPARQL(wikidataURL);
        var uri = endpointUrl + '?query=' + encodeURIComponent(sparqlQuery);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', uri, true);

        xhr.setRequestHeader('Accept', 'application/sparql-results+json');
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storeWikidata(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                storeWikidata(null);
            }
        }

        xhr.send();
    }

    function storeWikidata(payload) {
        var values = payload?.results?.bindings[0];
        var slideshow = '';
        var images = [];
        var footer = '';

        var wikipedia = values?.article?.value;
        if (wikipedia) {
            footer += ' ' + dict[nav.lang].linkToWikipedia.replace('{Wikipedia}', '<a href="' + wikipedia + '" target="_blank">Wikipedia</a>');
        }

        var wikidata = values?.item?.value;
        if (wikidata) {
            footer += ' ' + dict[nav.lang].linkToWikidata.replace('{Wikidata}', '<a href="' + wikidata + '" target="_blank">Wikidata</a>');
        }

        var gnd = values?.gnd?.value;
        if (gnd) {
            footer += ' ' + dict[nav.lang].linkToGND.replace('{GND}', '<a href="https://d-nb.info/gnd/' + gnd + '" target="_blank">GND</a>');
        }

        var osm = values?.osm?.value;
        if (osm) {
            footer += ' ' + dict[nav.lang].linkToOSM.replace('{OSM}', '<a href="https://www.openstreetmap.org/relation/' + osm + '" target="_blank">OSM</a>');
        }

        var geonames = values?.geonames?.value;
        if (geonames) {
            footer += ' ' + dict[nav.lang].linkToGeonames.replace('{Geonames}', '<a href="https://www.geonames.org/' + geonames + '" target="_blank">Geonames</a>');
        }

        images.push(values?.photo1?.value);
        images.push(values?.photo2?.value);
        images.push(values?.photo3?.value);
        images.push(values?.banner?.value);
        images.push(values?.map?.value);

        images.forEach((image) => {
            if (image) {
                slideshow += '<div class="imgSlides animate"><img src="' + image + '"></div>';
            }
        });
        slideshow += '<a class="prev" onclick="catalog.navigateSlides(-1)">&#10094;</a>';
        slideshow += '<a class="next" onclick="catalog.navigateSlides(1)">&#10095;</a>';

        elem = document.getElementById(idSObjectSlideshow);
        if (elem) {
            elem.innerHTML = slideshow;
            gotoSlide(0);
        }

        if (wikipedia) {
            loadWikipedia(wikipedia, footer);
        } else {
            storeWikipedia(footer, null);
        }
    }

    function loadWikipedia(wikipediaURL, footer) {
        var parts = wikipediaURL.split('/wiki/');
        var uri = parts[0] + '/w/api.php';
        uri += '?action=parse';
        uri += '&page=' + parts[1];
        uri += '&format=json';
        uri += '&origin=*';
        uri += '&section=0';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', uri, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                storeWikipedia(footer, JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                storeWikipedia(footer, null);
            }
        }

        xhr.send();
    }

    function storeWikipedia(footer, payload) {
        var str = '';

        if (payload) {
            var text = payload?.parse?.text['*'];
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;

            var p = tempDiv.querySelector('div > p');

            var remove = p.getElementsByClassName('navigation-not-searchable');
            while(remove[0]) {
                remove[0].parentNode.removeChild(remove[0]);
            }
            remove = p.getElementsByClassName('reference');
            while(remove[0]) {
                remove[0].parentNode.removeChild(remove[0]);
            }

            var links = p.getElementsByTagName('a');
            for (var i = 0; i < links.length; ++i) {
                links[i].removeAttribute('class');
                links[i].removeAttribute('href');
                links[i].removeAttribute('title');
            }

            str = p.innerHTML;

            str = str.replace(/(<a)/igm, '<span').replace(/<\/a>/igm, '</span>');
            str = str.replace(/\[.+?\]/g, "");
            str = str.replace(/\(.+?\)/g, "");
            str = str.split(' ').splice(0, 30).join(' ') + '...';

            str += '<div class="mt-3" style="font-size:.8em;color:#777">' + footer + '</div>';
        } else {
            str += '<div style="font-size:.8em;color:#777">' + footer + '</div>';
        }

        var elem = document.getElementById(idSObjectIntro);
        if (elem) {
            elem.innerHTML = str;
        }
    }

    function startSlideshow() {
        var slideshow = document.getElementById(idSObjectSlideshow);

        if (slideshow) {
            var slides = slideshow.getElementsByClassName('imgSlides');

            if (slides.length > 0) {
                funcNavigateSlides(1);
            }

            setTimeout(startSlideshow, slideShowTimeout);
        }
    }

    function gotoSlide(slide) {
        var slideshow = document.getElementById(idSObjectSlideshow);
        var slides = slideshow.getElementsByClassName('imgSlides');

        if (slides.length === 0) {
            return;
        }

        slideIndex = slide;
        if (slideIndex >= slides.length) {
            slideIndex = 0;
        }
        if (slideIndex < 0) {
            slideIndex = slides.length - 1;
        }

        for (var i = 0; i < slides.length; ++i) {
            slides[i].style.display = 'none';
        }
        slides[slideIndex].style.display = 'block';
    }

    function funcNavigateSlides(slides) {
        gotoSlide(slideIndex + slides);
    }

    // ----------------------------------------------------------------------------

    function prepareInteracticeElem(elem) {
        elem.classList.add('flex-fill');
        elem.classList.add('w-100');
        elem.classList.add('p-3');
        elem.classList.add('pt-0');
        elem.classList.add('overflow-auto');

        var str = '';
        str += '<div class="ps-4 border border-info border-2 bg-info">';
        str += '  <div class="mb-0 p-2 bg-white" style="position: relative;">';
        str += '    <strong class="' + classInteractiveHeader + ' text-white" style="position: absolute;transform: rotate(90deg);left: 0;top: 0"></strong>';
        str += '    <div class="row"></div>';
        str += '  </div>';
        str += '</div>';

        elem.innerHTML = str;
    }

    function onAddSupplier() {
        var button = document.getElementById(idInteractiveAddSupplierButton2);
        button.classList.remove('d-none');

        document.getElementById(idInteractiveAddSupplierError).innerHTML = '';

        setTimeout(() => {
            button.classList.add('d-none');
        }, 3000);
    }

    function onAddSupplier2() {
        document.getElementById(idInteractiveAddSupplierButton2).classList.add('d-none');
        var elemType = document.getElementById(idInteractiveAddSupplierType);
        var elemError = document.getElementById(idInteractiveAddSupplierError);
        var elemTitle = document.getElementById(idInteractiveAddSupplierTitle);
        var elemSameAs = document.getElementById(idInteractiveAddSupplierSameAs);
        var elemWikidata = document.getElementById(idInteractiveAddSupplierWikidata);
        var type = elemType.value;
        var error = '';
        var title = elemTitle.value;
        var sameAs = elemSameAs.checked;
        var wikidata = elemWikidata.value;

        if ((title === '') && (wikidata.split('/').slice(-1)[0].toLocaleLowerCase().indexOf('q') !== 0)) {
            error = 'Link to Wikidata is invalid';
        }
        elemError.innerHTML = error;

        if (error === '') {
            var url = 'https://opendata.guru/api/2/s';

            account.sendRequest(url, {
                type: type,
                title: title,
                sameaswikidata: sameAs ? wikidata : '',
                partofwikidata: !sameAs ? wikidata : ''
            }, (result) => {
                if (type === result.type) {
                    elemError.innerHTML = 'Done: ' + result.sid;
                    elemWikidata.value = '';

                    reloadSObjects(result.sid);
                } else {
                    console.log(result);
                    elemError.innerHTML = 'Something went wrong';

                    reloadSObjects('');
                }
            }, (error) => {
                elemError.innerHTML = error === '' ? 'Unknown error' : error.error + ' ' + error.message;

                reloadSObjects('');
            });
        }
    }

    function onModifySystem() {
        var button1 = document.getElementById(idInteractiveEditSystemButton);
        if (button1.classList.contains('bg-secondary')) {
            // button is disabled
            return;
        }

        var button = document.getElementById(idInteractiveEditSystemButton2);
        button.classList.remove('d-none');

        document.getElementById(idInteractiveEditSystemError).innerHTML = '';

        setTimeout(() => {
            button.classList.add('d-none');
        }, 3000);
    }

    function onModifySystem2() {
        document.getElementById(idInteractiveEditSystemButton2).classList.add('d-none');
        document.getElementById(idInteractiveEditSystemError).innerHTML = '';

        var url = 'https://opendata.guru/api/2/l/' + selectedModifyPortalLID;

        account.sendRequest(url, {
            sID: selectedModifySystemSID
        }, (result) => {
            if (selectedModifySystemSID === result.sobject.sid) {
                reloadLObjects('');
            } else {
                console.log(result);
                document.getElementById(idInteractiveEditSystemError).innerHTML = 'Something went wrong';
            }
        }, (error) => {
            document.getElementById(idInteractiveEditSystemError).innerHTML = error === '' ? 'Unknown error' : error.error + ' ' + error.message;
        });
    }

    function funcModifyFilterSObjects(element) {
        filterSObjects = element.value;
        fillModifySObjectTable();
    }

    function funcModifySetLID(lid) {
        selectModifyLID(lid);

        pObjects.forEach((pObject) => {
            pObject.lObjects.forEach((lObject) => {
                if ((lObject.lid === lid) && (lObject.sid)) {
                    selectModifyPortalSID(lObject.sid);
                }
            });
        });
    }

    function reloadLObjects(selectLID) {
        pObjects = [];
//        fillModifyPObjectTable();
//        onModifyLoadPObjects(selectLID);
        third_loadPObjects(baseURL + '/s/' + sObject.sid + '/p');

        updateModifyPortalSelection();
        enableModifyPortalButton();
    }

    function reloadSObjects(selectSID) {
        loadedSObjects = [];
        fillModifySObjectTable();
        onModifyLoadSObjects(selectSID);

        updateModifyPortalSelection();
        enableModifyPortalButton();
    }

    function onModifyPortalSID(event) {
        var element = event.target;
        var sID = element.value;

        selectModifyPortalSID(sID);
    }

    function selectModifyLID(lid) {
        if (selectedModifyPortalLID === lid) {
            return;
        }

        if (lid !== '') {
            var elem = document.getElementById(idInteractiveEditSystemLObjects);
            var str = '';

            pObjects.forEach((pObject) => {
                pObject.lObjects.forEach((lObject) => {
                    if (lObject.lid === lid) {
						var titleSplit = lObject.title.trim().split(' ');
						var titleStart = titleSplit[0];

						if ((titleSplit.length > 0) && (
							   (titleSplit[0] === 'Stadt')
							|| (titleSplit[0] === 'Gemeinde')
							|| (titleSplit[0] === 'Flecken')
							|| (titleSplit[0] === 'Amt')
							|| (titleSplit[0] === 'Samtgemeinde')
							|| (titleSplit[0] === 'Verwaltungsgemeinschaft')
							|| (titleSplit[0] === 'Kreis')
							|| (titleSplit[0] === 'Landkreis')
						)) {
							titleSplit.shift();
							if (titleSplit.length > 0) {
								titleStart = titleSplit[0];
							}
						}
						if (lObject.sobject) {
                            var title = system.getTitle(lObject.sobject);
							str += '<b>' + system.getTitle(lObject.sobject) + '</b><br><br>';
                        }
                        str += '<b>Title:</b> ' + lObject.title;
						str += '<span class="badge mt-1 bg-info" style="margin:0 0 0 .5rem;cursor:pointer;" onclick="catalog.setSearchSupplier(\'' + titleStart + '\')">→</span>';
						str += '<br>';
                        str += '<b>Identifier:</b> ' + lObject.identifier + '<br>';
                        str += '<b>lid:</b> ' + lObject.lid + '<br>';
                    }
                });
            });

            elem.innerHTML = str;

            selectedModifyPortalLID = lid;
            elem = document.getElementById(idInteractiveEditSystem);
            elem.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        }

        updateModifyPortalSelection();
        enableModifyPortalButton();
    }

    function selectModifyPortalSID(sid) {
        if (selectedModifySystemSID === sid) {
            return;
        }

        if (sid !== '') {
            var selection = document.getElementById('edit-system-sid-' + sid);
            if (selection) {
                selectedModifySystemSID = sid;
                selection.checked = true;
                selection.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
            }
        }

        updateModifyPortalSelection();
        enableModifyPortalButton();
    }

    function enableModifyPortalButton() {
        var button = document.getElementById(idInteractiveEditSystemButton);
        var text = 'Link';

        var lText = '-';
        if (selectedModifyPortalLID) {
            pObjects.forEach((pObject) => {
                pObject.lObjects.forEach((lObject) => {
                    if (lObject.lid === selectedModifyPortalLID) {
                        if (lObject.sobject) {
                            lText = system.getTitle(lObject.sobject);
                        } else {
                            lText = lObject.title;
                        }
                    }
                });
            });
        }

        var sText = '-';
        if (selectedModifySystemSID) {
            loadedSObjects.forEach(sObject => {
                if (sObject.sid === selectedModifySystemSID) {
                    sText = system.getTitle(sObject); 
                }
            });
        }

        text += ' ' + lText +  ' to ' + sText;

        button.innerHTML = text;

        if ((lText !== '-') && (sText !== '-')) {
            button.classList.remove('bg-secondary');
            button.classList.add('bg-info');
        } else {
            button.classList.add('bg-secondary');
            button.classList.remove('bg-info');
        }
    }

    function updateModifyPortalSelection() {
        var element = document.getElementById(idInteractiveEditSystemSelection);
        var sObjects = Object.values(loadedSObjects).filter((sObject) => sObject.sid === selectedModifySystemSID);
        var text = '';

        if (sObjects.length > 0) {
            var sObject = sObjects[0];

            text += '<img src="' + sObject.image.url + '" style="height: 3em;position: absolute; right: 1em;background: #fff;border:2px solid #fff;">';
            text += '<strong>sid</strong>: ' + sObject.sid + '<br>';
            text += '<strong>title</strong>: ' + system.getTitle(sObject) + '<br>';
            text += '<strong>type</strong>: ' + data.getTypeString(sObject.type) + '<br>';
            text += '<strong>sameAs</strong>: ' + (sObject.sameAs.wikidata ? ('<a href="' + sObject.sameAs.wikidata + '" target="_blank">' + sObject.sameAs.wikidata.split('/').slice(-1)[0] + '</a>') : '') + '<br>';
            text += '<strong>partOf</strong>: ' + (sObject.partOf.wikidata ? ('<a href="' + sObject.partOf.wikidata + '" target="_blank">' + sObject.partOf.wikidata.split('/').slice(-1)[0] + '</a>') : '') + '<br>';
            text += '<strong>geocoding</strong>: ' + sObject.geocoding.germanRegionalKey + '<br>';
        }

        element.innerHTML = text;
    }

    function fillModifySObjectTable() {
        var listElem = document.getElementById(idInteractiveEditSystemSObjects);
        var list = '';
        var first = true;
        var lowerFilter = filterSObjects.toLocaleLowerCase();

        list += '<fieldset>';
        loadedSObjects.forEach(sObject => {
            var title = system.getTitle(sObject);

            if ((lowerFilter !== '') && (-1 === title.toLocaleLowerCase().indexOf(lowerFilter))) {
                return;
            }

            list += '<div style="overflow-x: hidden;white-space: nowrap;">';
            list += '<input type="radio" id="edit-system-sid-' + sObject.sid + '" value="' + sObject.sid + '" name="' + idInteractiveEditSystemSObject + '" class="mx-2" ' + (first ? 'checked' : '') + '>';
            list += '<label for="edit-system-sid-' + sObject.sid + '">' + title + '</label>';
            list += '</div>';

            first = false;
        });
        list += '</fieldset>';

        listElem.classList.remove('text-center');
        listElem.innerHTML = list;

        document.querySelector('#' + idInteractiveEditSystemSObjects + ' fieldset').addEventListener('change', onModifyPortalSID);

        var selected = document.querySelector('#' + idInteractiveEditSystemSObjects + ' fieldset input:checked');
        if (selected) {
            onModifyPortalSID({
                target: selected
            });
        } else {
            selectedModifySystemSID = '';
            updateModifyPortalSelection();
            enableModifyPortalButton();
        }
    }

    function loadSObjects(loadedCB, errorCB) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://opendata.guru/api/2/s', true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                loadedCB(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                errorCB(JSON.parse(this.responseText));
            }
        }

        xhr.send();
    }

    function onModifyLoadSObjects(selectSID) {
        loadSObjects((result) => {
            loadedSObjects = result;
            loadedSObjects.sort(function(a, b) {
                return system.getTitle(a).localeCompare(system.getTitle(b));
            });
            fillModifySObjectTable();
            selectModifyPortalSID(selectSID);
        }, (error) => {
            loadedSObjects = [];
            fillModifySObjectTable();

            console.warn(error);
        });
    }

    function funcSetSearchSupplier(titleStart) {
        var element = document.getElementById(idInteractiveEditSystemSearch);

        element.value = titleStart;
        filterSObjects = titleStart;

        fillModifySObjectTable();
    }

    function installAddSupplier(elem) {
        prepareInteracticeElem(elem);

        var header = elem.getElementsByClassName(classInteractiveHeader)[0];
        header.innerHTML = 'Add supplier';
        header.style.left = '-4em';
        header.style.top = '2.75em';

        var row = elem.getElementsByClassName('row')[0];
        var str = '';
        str += '<div class="col-12 col-md-12">';

        str += '  <div>';
        str += '    <label for="' + idInteractiveAddSupplierType + '">Choose a type:</label>';
        str += '    <select name="' + idInteractiveAddSupplierType + '" id="' + idInteractiveAddSupplierType + '">';
        Object.keys(data.layers).forEach((key) => {
            str += '      <option value="' + key + '">' + data.layers[key] + '</option>';
        });
        str += '    </select>';
        str += '  </div>';

        str += '</div>';
        str += '<div class="col-12 col-md-6">';

        str += '  <fieldset>';
        str += '    <legend class="fs-5 mb-0">Select a Wikidata relationship:</legend>';
        str += '    <div class="ps-3">';
        str += '      <input type="radio" id="' + idInteractiveAddSupplierSameAs + '" name="' + idInteractiveAddSupplierRelation + '" value="sameas" checked />';
        str += '      <label for="' + idInteractiveAddSupplierSameAs + '">Same as</label>';
        str += '    </div>';
        str += '    <div class="ps-3">';
        str += '      <input type="radio" id="' + idInteractiveAddSupplierPartOf + '" name="' + idInteractiveAddSupplierRelation + '" value="partof" />';
        str += '      <label for="' + idInteractiveAddSupplierPartOf + '">Part of</label>';
        str += '    </div>';
        str += '  </fieldset>';

        str += '  <div>';
        str += '    <label for="' + idInteractiveAddSupplierWikidata + '">Set link to Wikidata:</label>';
        str += '    <input type="text" id="' + idInteractiveAddSupplierWikidata + '" name="' + idInteractiveAddSupplierWikidata + '" value="" />';
        str += '  </div>';

        str += '</div>';
        str += '<div class="col-12 col-md-6">';

        str += '  <div>';
        str += '    <label for="' + idInteractiveAddSupplierTitle + '">Or set title:</label>';
        str += '    <input type="text" id="' + idInteractiveAddSupplierTitle + '" name="' + idInteractiveAddSupplierTitle + '" value="" />';
        str += '  </div>';

        str += '</div>';
        str += '<div class="col-12 col-md-12">';

        str += '  <div>';
        str += '    <span id="' + idInteractiveAddSupplierButton + '" class="badge mt-1 bg-info" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Add</span>';
        str += '    <span id="' + idInteractiveAddSupplierButton2 + '" class="badge mt-1 bg-warning text-black d-none" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Do it</span>';
        str += '    <span id="' + idInteractiveAddSupplierError + '" class="text-danger p-2"></span>';
        str += '  </div>';

        str += '</div>';

        row.innerHTML = str;
    }

    function installEditLinks(elem) {
        prepareInteracticeElem(elem);

        var header = elem.getElementsByClassName(classInteractiveHeader)[0];
        header.innerHTML = 'Modify portal links';
        header.style.left = '-5.4em';
        header.style.top = '4.3em';

        var row = elem.getElementsByClassName('row')[0];
        var str = '';

        str += '<div class="col-12 col-md-4">';
        str += '  <div style="min-height: 2em;">';
        str += '    Click on a <span class="badge bg-danger mx-1">red label</span> in portal table.';
        str += '  </div>';
        str += '  <div class="border border-1 border-dark" style="height: 10em;overflow-y: scroll;">';
        str += '    <div id="' + idInteractiveEditSystemLObjects + '" class="w-100 text-center">';
        str += '    </div>';
        str += '  </div>';
        str += '</div>';

        str += '<div class="col-12 col-md-4">';
        str += '  <div style="min-height: 2em;">';
        str += '    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search align-middle"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
        str += '    <input id="' + idInteractiveEditSystemSearch + '" type="search" placeholder="Search Supplier" class="ps-2 border border-1 border-dark" oninput="catalog.modifyFilterSObjects(this)">';
        str += '  </div>';
        str += '  <div class="border border-1 border-dark" style="height: 10em;overflow-y: scroll;">';
        str += '    <div id="' + idInteractiveEditSystemSObjects + '" class="w-100 text-center">';
        str += '      <span id="' + idInteractiveEditSystemLoadSObjects + '" class="badge mt-1 bg-info" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;margin-top:4.5em !important">';
        str += '        Load Supplier List';
        str += '      </span>';
        str += '    </div>';
        str += '  </div>';
        str += '  <div class="text-center px-2" id="modify-system-add-sobject"></div>';
        str += '</div>';

        str += '<div class="col-12 col-md-4">';
        str += '  <div style="height: 12em;overflow-y: scroll;">';
        str += '    <div id="' + idInteractiveEditSystemSelection + '" class="w-100 p-2">';
        str += '    </div>';
        str += '  </div>';
        str += '</div>';

        str += '<div class="col-12 col-md-12">';
        str += '  <span id="' + idInteractiveEditSystemButton + '" class="badge mt-1 bg-secondary" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Link</span>';
        str += '  <span id="' + idInteractiveEditSystemButton2 + '" class="badge mt-1 bg-warning text-black d-none" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Do it</span>';
        str += '  <span id="' + idInteractiveEditSystemError + '" class="text-danger p-2"></span>';
        str += '</div>';

        row.innerHTML = str;
    }

    function installInteractiveArea() {
        var elemAddSObject = document.getElementById(idInteractiveAddSupplier);
        var elemEditLObject = document.getElementById(idInteractiveEditSystem);

        if (elemAddSObject) {
            installAddSupplier(elemAddSObject);

            document.getElementById(idInteractiveAddSupplierButton).addEventListener('click', onAddSupplier);
            document.getElementById(idInteractiveAddSupplierButton2).addEventListener('click', onAddSupplier2);
        }

        if (elemEditLObject) {
            installEditLinks(elemEditLObject);

            document.getElementById(idInteractiveEditSystemButton).addEventListener('click', onModifySystem);
            document.getElementById(idInteractiveEditSystemButton2).addEventListener('click', onModifySystem2);
            document.getElementById(idInteractiveEditSystemLoadSObjects).addEventListener('click', onModifyLoadSObjects);
        }
    }

    function funcStart() {
        updateSID();
        installInteractiveArea();
    }

    init();

    return {
        id: oldInitvalId, // depricated
        sID: sID,
        get: funcGet,
        getBySID: funcGetBySID,
        getSameAs: funcGetSameAs,
        getSObject: funcGetSObject,
        getDownloadMenu: getDownloadMenu,
        navigateSlides: funcNavigateSlides,
        rebuildAllPortalTables: funcRebuildAllPortalTables,
        set: funcSet, // depricated
        setLID: funcSetLID,
        setSID: funcSetSID,
        setSearchSupplier: funcSetSearchSupplier,
        start: funcStart,
        update: funcUpdate,
        modifySetLID: funcModifySetLID,
        modifyFilterSObjects: funcModifyFilterSObjects,
    };
}());