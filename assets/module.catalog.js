var catalog = (function () {
    var baseURL = 'https://opendata.guru/api/2';
    var oldInitvalId = '',
        oldDefaultId = 'govdata',
        sID = '',
        sObject = null;
        defaultSID = 'smZ1A'; //GovData
    var idCatalogHistoryTitle = 'catalog-history-title',
        idSupplierHistoryTitle = 'supplier-history-title',
        idCardSObject = 'card-sobject',
        idSObjectBox = 'sobject-box';
    var paramId = 'sid',
        oldParamId = 'catalog';
    var dict = {
            de: {
                unknownSupplier: 'Unbekannte Datenquelle',
            },
            en: {
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
        if ((sID === '') || (sID === 'undefined') || (sID === undefined)) {
            updateSID_storeSObject(null);
        } else {
            if ((sObject === null) || (sObject.sid !== sID)) {
                var str = '';

                str += '<div class="loading-bar mb-2" style="width:100%;height:1.5em"></div>';
                str += '<div class="loading-bar" style="width:50%;height:1.5em"></div>';

                var elem = document.getElementById(idCardSObject);
                if (elem) {
//                    elem.innerHTML = str;
                }

                str = '';
                str += '<div class="loading-bar mb-2 pb-2" style="height:6.5rem"></div';

                elem = document.getElementById(idSObjectBox);
                if (elem) {
                    elem.innerHTML = str;
                }

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
        set: funcSet,
        start: funcStart,
        update: funcUpdate,
    };
}());