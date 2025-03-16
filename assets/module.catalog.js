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
        showOnlyImperfectPObjects = true;
    var dict = {
            de: {
                lastSeenMoreDays: 'Zuletzt gesehen vor {days} Tagen',
                lastSeenOneDay: 'Gestern zuletzt gesehen',
                lastSeenZeroDays: 'Heute zuletzt gesehen',
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
                lastSeenMoreDays: 'Last seen {days} days ago',
                lastSeenOneDay: 'Last seen yesterday',
                lastSeenZeroDays: 'Last seen today',
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
        if ((catalogId === oldDefaultId) && (sID !== defaultSID)) {
            // fix old id
            var catalogObj = funcGetBySID(sID);
            if (catalogObj) {
                catalogId = catalogObj.id;
            }
        }

        setId(catalogId);
//        setSID(catalogId);
//        updateSID();

        window.scrollTo(0, 0);

        var catalogObject = funcGet(catalogId);

        if (catalogObject) {
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

    function funcSetLID(lid) {
        // todo

        window.scrollTo(0, 0);

        catalog.update();
        if (parents) {
            parents.update();
        }
        if (date) {
            date.update();
        }
        data.emitFilterChanged();
    }

    function funcSetSID(sID) {
        // fix old id
        var catalogObj = funcGetBySID(sID);
        if (catalogObj) {
            var catalogId = catalogObj.id;
            setId(catalogId);
        }

        setSID(sID);
        updateSID();

        window.scrollTo(0, 0);

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

    function buildPortalTable(pObject, dates) {
        tableLObjects.build({
            dates: dates,
            dict: dict,
            lObjectsCount: lObjectsCount,
            pObject: pObject,
        });
    }

    function funcRebuildAllPortalTables() {
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
//        var size = Object.keys(pObjects).length;
//        var 
//console.log(c);
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
                str += '<div class="col-12">';
                str += '  <div class="loading-bar mb-2 pb-2" style="height:6.5rem"></div>';
                str += '</div>';

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
        updateSID_loadPObjects(baseURL + '/s/' + sObject.sid + '/p');

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
                        if (lObject.sobject) {
                            var title = system.getTitle(lObject.sobject);
                            var titleStart = title.trim().split(' ')[0];
                            str += '<b>' + title + '</b>'
                            str += '<span class="badge mt-1 bg-info" style="margin:0 0 0 .5rem;cursor:pointer;" onclick="catalog.setSearchSupplier(\'' + titleStart + '\')">→</span>';
                            str += '<br><br>';
                        }
                        str += '<b>Title:</b> ' + lObject.title + '<br>';
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
        id: oldInitvalId,
        sID: sID,
        get: funcGet,
        getBySID: funcGetBySID,
        getSameAs: funcGetSameAs,
        getSObject: funcGetSObject,
        getDownloadMenu: getDownloadMenu,
        rebuildAllPortalTables: funcRebuildAllPortalTables,
        set: funcSet,
        setLID: funcSetLID,
        setSID: funcSetSID,
        setSearchSupplier: funcSetSearchSupplier,
        start: funcStart,
        update: funcUpdate,
        modifySetLID: funcModifySetLID,
        modifyFilterSObjects: funcModifyFilterSObjects,
    };
}());