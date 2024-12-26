var catalog = (function () {
    var baseURL = 'https://opendata.guru/api/2';
    var oldInitvalId = '',
        oldDefaultId = 'govdata',
        sID = '',
        sObject = null;
        lObjects = [];
        lObjectsCount = [];
        pObjects = [];
        pObjectsLoadedLObjects = 0;
        defaultSID = 'smZ1A'; //GovData
    var idCatalogHistoryTitle = 'catalog-history-title',
        idSupplierHistoryTitle = 'supplier-history-title',
        idCardSObject = 'card-sobject',
        idCardPObjects = 'card-portals',
        idChartPObjects = 'chart-portals',
        idSObjectBox = 'sobject-box';
    var paramId = 'sid',
        oldParamId = 'catalog';
    var dict = {
            de: {
                lastSeenMoreDays: 'Zuletzt gesehen vor {days} Tagen',
                lastSeenOneDay: 'Gestern zuletzt gesehen',
                lastSeenZeroDays: 'Heute zuletzt gesehen',
                suppliers: 'Datenliefernde',
                suppliersCountMore: '{count} Datenliefernde',
                suppliersCountOne: '1 Datenliefernde:r',
                suppliersCountZero: 'Keine Datenliefernde',
                suppliersError: 'Beim Ermitteln, wer die Daten bereitgestellt hat, ist ein Fehler aufgetreten',
                suppliersHistory: '{days} Tage Datenliefernde Historie',
                unknownPortal: 'Portal',
                unknownSupplier: 'Unbekannte Datenquelle',
            },
            en: {
                lastSeenMoreDays: 'Last seen {days} days ago',
                lastSeenOneDay: 'Last seen yesterday',
                lastSeenZeroDays: 'Last seen today',
                suppliers: 'Data Suppliers',
                suppliersCountMore: '{count} data suppliers',
                suppliersCountOne: '1 data supplier',
                suppliersCountZero: 'No data suppliers',
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

        if (params.has(oldParamId)) {
            oldInitvalId = params.get(oldParamId);
        } else {
            oldInitvalId = oldDefaultId;
        }
    }

    function setId(id) {
        oldInitvalId = id;

        if (catalog) {
            catalog.id = oldInitvalId;
        }

        var params = new URLSearchParams(window.location.search);
        if (id === oldDefaultId) {
            params.delete(oldParamId);
        } else {
            params.set(oldParamId, id);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);
    }

    function setSID(id) {
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

        if (data.loadedDays > data.initalDays) {
            if (document.getElementById('removeLoadedDays')) {
                document.getElementById('removeLoadedDays').style.pointerEvents = '';
                document.getElementById('removeLoadedDays').classList.add('text-dark');
            }
        }
    }

    function funcSet(catalogId) {
        setId(catalogId);
//        setSID(catalogId);
//        updateSID();

        window.scrollTo(0, 0);

        var catalogObject = funcGet(catalogId);
        var strCatalog = catalogId;

        if (catalogObject) {
            strCatalog = catalogObject.title;
            setSID(catalogObject.sid);
            updateSID();
        }

        catalog.update();
        if (parents) {
            parents.update();
        }
        if (date) {
            date.update();
        }
        data.emitFilterChanged();
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

    function buildPortalTable(pObject, dateCols) {
        var str = '';
        str += '<div class="text-white" style="background:#17a2b8;padding:.62rem .5rem;font-size:.7rem">';
        str += dict[nav.lang].unknownPortal + ' <span class="ms-4" style="color:#a4e9f4">' + pObject.url + '</span></div>';

        var current = new Date(Date.now());
        var dateString = current.toLocaleString('sv-SE').split(' ')[0];

        str += '<table class="bg-white" style="min-height:2rem;width:100%;font-size:.7rem">';

        if (pObject.lObjects && (pObject.lObjects.length > 0)) {
            str += '<thead style="background:#a4e9f4;border-bottom:1px solid #17a2b8"><tr>';
            str += '<th style="padding:.25rem .5rem">' + dict[nav.lang].suppliers + '</th>';

            dateCols.forEach((column) => {
                str += '<th style="padding:.25rem .5rem;text-align:right;border-left:1px solid #17a2b8">' + column + '</th>';
            });

            str += '</tr></thead>';

            str += '<tbody>';
            pObject.lObjects.forEach((lObject) => {
                var lastSeen = '';
                var diffMilliseconds = new Date((new Date(dateString)).getTime() - (new Date(lObject.lastseen)).getTime());
                var diff = Math.floor(diffMilliseconds/(24*3600*1000));

                if (diff === 0) {
//                    lastSeen = dict[nav.lang].lastSeenZeroDays;
                } else if (diff === 1) {
                    lastSeen = '<span class="text-warning">(' + dict[nav.lang].lastSeenOneDay + ')</span>';
                } else {
                    lastSeen = '<span class="text-danger">(' + dict[nav.lang].lastSeenMoreDays.replace('{days}', diff) + ')</span>';
                }

                str += '<tr style="border-bottom:1px solid #ddd">';
                str += '<td style="padding:.25rem .5rem">' + lObject.title + ' ' + lastSeen + '</td>';

                dateCols.forEach((column) => {
                    var count = lObjectsCount[column][lObject.lid];
                    if (count === undefined) {
                        count = '-';
                    }
                    str += '<td style="padding:.25rem .5rem;text-align:right;background:#a4e9f4;border-left:1px solid #17a2b8">' + monitorFormatNumber(count) + '</td>';
                });

                str += '</tr>';
            });
            str += '</tbody>';
        }

        str += '</table>';

        str += '<div class="text-white mb-3" style="background:#17a2b8;padding:.62rem .5rem;font-size:.7rem">';
        if (!pObject.lObjects) {
            str += dict[nav.lang].suppliersError;
        } else if (pObject.lObjects.length === 0) {
            str += dict[nav.lang].suppliersCountZero;
        } else if (pObject.lObjects.length === 1) {
            str += dict[nav.lang].suppliersCountOne;
        } else {
            str += dict[nav.lang].suppliersCountMore.replace('{count}', pObject.lObjects.length);
        }
        str += '</div>';

        elem = document.getElementById('portal-' + pObject.pid);
        elem.innerHTML = str;
    }

    function updateSID_storeLObjectsCount(payload, dateString) {
        if (payload) {
            lObjectsCount[dateString] = payload;
        } else {
            lObjectsCount[dateString] = [];
        }

        pObjects.forEach((pObject) => {
            buildPortalChart(pObject);
            buildPortalTable(pObject, [dateString]);
        });
    }

    function updateSID_loadLObjectsCount(url, dateString) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

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

    function updateSID_loadLObjectsNextDate() {
        var current = new Date(Date.now());
        var dateString;

        for (var d = 0; d < 20; ++d) {
            dateString = current.toLocaleString('sv-SE').split(' ')[0];
            updateSID_loadLObjectsCount(baseURL + '/l/count/' + dateString, dateString);

            current.setDate(current.getDate() - 1);
        }
    }

    function updateSID_storePObjectLObjects(payload, pid) {
        var lObjects = null;

        if (payload) {
            pid = payload.pid;
            lObjects = payload.lobjects;
        }

        pObjects.forEach((pObject) => {
            if (pObject.pid === pid) {
                pObject.lObjects = lObjects;

                buildPortalChart(pObject);
                buildPortalTable(pObject, []);

                ++pObjectsLoadedLObjects;
            }
        });

        if (pObjects.length === pObjectsLoadedLObjects) {
            updateSID_loadLObjectsNextDate();            
        }
    }

    function updateSID_loadPObjectLObjects(url, pid) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                updateSID_storePObjectLObjects(JSON.parse(this.responseText), pid);
            } else if (this.readyState == 4) {
                updateSID_storePObjectLObjects(null, pid);
            }
        }

        xhr.send();
    }

    function updateSID_storePObjects(payload) {
        pObjects = [];
        pObjectsLoadedLObjects = 0;

        if (payload && payload.pobjects) {
            pObjects = payload.pobjects;
        }

        var strChart = '';
        var strCard = '';
        pObjects.forEach((pObject) => {
            strChart += '<div id="portal-chart-' + pObject.pid + '">';
            strChart += '<div>&nbsp;</div>';
            strChart += '<div class="loading-bar my-3 pb-2" style="height:16rem"></div>';
            strChart += '</div>';

            strCard += '<div id="portal-' + pObject.pid + '">';
            strCard += '<div class="loading-bar mb-2 pb-2" style="height:6.5rem"></div>';
            strCard += '</div>';
        });

        elem = document.getElementById(idChartPObjects);
        elem.innerHTML = strChart;

        elem = document.getElementById(idCardPObjects);
        elem.innerHTML = strCard;

        pObjects.forEach((pObject) => {
            updateSID_loadPObjectLObjects(baseURL + '/p/' + pObject.pid + '/l', pObject.pid);
        });
    }

    function updateSID_loadPObjects(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                updateSID_storePObjects(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                updateSID_storePObjects(null);
            }
        }

        xhr.send();
    }

    function updateSID_storeLObjects(payload) {
        lObjects = [];

        if (payload && payload.lobjects) {
            lObjects = payload.lobjects;
        }

        if (sObject) {
            updateSID_loadPObjects(baseURL + '/s/' + sObject.sid + '/p');
        } else {
            updateSID_storePObjects(null);
        }
    }

    function updateSID_loadLObjects(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                updateSID_storeLObjects(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                updateSID_storeLObjects(null);
            }
        }

        xhr.send();
    }

    function funcGetSObject() {
        return sObject;
    }

    function updateSID_storeSObject(payload) {
        sObject = payload;

        var url = sObject && sObject.image ? sObject.image.url : '';
        var title = sObject ? sObject.title[nav.lang] : dict[nav.lang].unknownSupplier;
        var type = sObject ? data.getTypeString(sObject.type) : '';

        var str = '';
        str += '<div class="border-bottom border-1 border-secondary mb-2 pb-2" style="height:6.5rem">';
        str += '<img src="' + url + '" style="height:3rem;width:100%;object-fit:contain' + (url === '' ? ';opacity:0' : '') + '">';
        str += '<h1 class="fw-light fs-3 my-0">' + title + '</h1>';
        str += '<div>' + type + '</div>';
        str += '</div>';

        var elem = document.getElementById(idSObjectBox);
        if (elem) {
            elem.innerHTML = str;
        }

        if (sObject) {
            updateSID_loadLObjects(baseURL + '/s/' + sObject.sid + '/l');
        } else {
            updateSID_storeLObjects(null);
        }
    }

    function updateSID_loadSObject(url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                updateSID_storeSObject(JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                updateSID_storeSObject(null);
            }
        }

        xhr.send();
    }

    function updateSID() {
        var elem = document.getElementById(idCardSObject);
        if (!elem) {
            return;
        }

        if ((sID === '') || (sID === 'undefined') || (sID === undefined)) {
            updateSID_storeSObject(null);
        } else {
            if ((sObject === null) || (sObject.sid !== sID)) {
                var str = '';

                str += '<div class="loading-bar mb-2" style="width:100%;height:1.5em"></div>';
                str += '<div class="loading-bar" style="width:50%;height:1.5em"></div>';

                var elem = document.getElementById(idCardSObject);
//                elem.innerHTML = str;

                str = '';
                str += '<div class="loading-bar mb-2 pb-2" style="height:18rem"></div>';

                elem = document.getElementById(idChartPObjects);
                elem.innerHTML = str;

                str = '';
                str += '<div class="loading-bar mb-2 pb-2" style="height:6.5rem"></div>';

                elem = document.getElementById(idCardPObjects);
                elem.innerHTML = str;

                str = '';
                str += '<div class="loading-bar mb-2 pb-2" style="height:6.5rem"></div>';

                elem = document.getElementById(idSObjectBox);
                elem.innerHTML = str;

                updateSID_loadSObject(baseURL + '/s/' + sID);
            }
        }
    }

    function funcStart() {
        updateSID();
    }

    init();

    return {
        id: oldInitvalId,
        sID: sID,
        get: funcGet,
        getBySID: funcGetBySID,
        getSameAs: funcGetSameAs,
        getSObject: funcGetSObject,
        getDownloadMenu: getDownloadMenu,
        set: funcSet,
        start: funcStart,
        update: funcUpdate,
    };
}());