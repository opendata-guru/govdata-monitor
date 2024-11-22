var hvdSettings = {
    maxDays: 20,
    dict: {
        de: {
            diffInfoDataToday: 'Diese Änderungen in den HVD-Datensätzen sind seit gestern aufgetreten.',
            diffTableAdded: 'Neue Links',
            diffTableHostsAdded: 'Neue Links von diesen Hosts',
            diffTableHostsDeleted: 'Hosts, die jetzt keine Links mehr haben',
            diffTableHostsNew: 'Bisher unbekannte Hosts',
            diffTableHostsRemoved: 'Links von diesen Hosts entfernt',
            diffTableRemoved: 'Links entfernt',
            diffTitle: 'Übersicht der Distributionen aus Deutschland',
            historyDataset: 'Tage-Verlauf für Datensätze',
            historyDistribution: 'Tage-Verlauf für Distributionen',
            historyDataService: 'Tage-Verlauf für Datendienste',
            hvdEUNotPublished: 'Die offizielle HVD-Berichterstattung der EU wird derzeit vorbereitet. Sie wird auf der Auswertung von Metadaten basieren (bestehend aus SPARQL-Abfragen und SHACL-Regeln).',
            hvdEUSPARQLMeantime: 'Das offizielle Reporting startet erst im Februar 2025. In der Zwischenzeit baue ich ein eigenes auf, damit ich Veränderungen erkennen kann. Meine Abfragen können auch',
            hvdEUSPARQLMeantimeHere: 'hier gelesen werden.',
            hvdEUSPARQLPublished: 'Die SPARQL-Abfragen und SHACL-Regeln',
            hvdEUSPARQLPublishedHere: 'wurden hier veröffentlicht',
            hvdEUTitle: 'So könnte die EU-Berichterstattung für HVD\'s aussehen',
            hvdEUTitleNot: 'So wird die EU-Berichterstattung des HVD\'s nicht aussehen (dies ist meine eigene Analyse)',
            hvdDiscover: 'entdecken',
            legendDataServices: 'Datendienste',
            legendDatasets: 'Datensätze',
            legendDistributions: 'Distributionen',
            legendDistributionsLicenses: 'Distributionen mit Lizenzen',
            legendInsights: 'Einblicke',
            legendLicenses: 'Lizenzen',
            legendOverview: 'Übersicht',
            loading: 'Einen Moment bitte Daten werden geladen',
            optionsDownloadCSV: 'Herunterladen als CSV-Tabelle',
            optionsDownloadPNG: 'Herunterladen als PNG-Bild',
            optionsLoadMonth: 'Daten nachladen (ein Monat)',
            optionsLoadWeek: 'Daten nachladen (eine Woche)',
            optionsMaximize: 'Grafik vergrößern',
            optionsMenu: 'Optionen',
            optionsMinimize: 'Grafik verkleinern',
            optionsRemoveLoaded: 'Entferne nachgeladene Daten',
            progressLoading: 'Daten werden geladen ...',
        },
        en: {
            diffInfoDataToday: 'These changes in the HVD records occurred since yesterday.',
            diffTableAdded: 'New links',
            diffTableHostsAdded: 'New links in these hosts',
            diffTableHostsDeleted: 'Hosts who now no longer have links',
            diffTableHostsNew: 'Previously unknown hosts',
            diffTableHostsRemoved: 'Removed links in these hosts',
            diffTableRemoved: 'Removed links',
            diffTitle: 'Overview of distributions from Germany',
            historyDataset: 'days dataset history',
            historyDistribution: 'days distribution history',
            historyDataService: 'days data service history',
            hvdEUNotPublished: 'The EU\'s official HVD reporting is currently being prepared. It will be based on metadata evaluation (consisting of SPARQL queries and SHACL rules).',
            hvdEUSPARQLMeantime: 'Official reporting doesn\'t start until February 2025. In the meantime, I\'m setting up my own so that I can identify changes. My queries can also be',
            hvdEUSPARQLMeantimeHere: 'read here',
            hvdEUSPARQLPublished: 'The SPARQL queries and SHACL rules',
            hvdEUSPARQLPublishedHere: 'have been published here',
            hvdEUTitle: 'This is what the HVD\'s EU reporting could look like',
            hvdEUTitleNot: 'This is not what the HVD\'s EU reporting will look like (this is my own analysis)',
            hvdDiscover: 'discover',
            legendDataServices: 'Data Services',
            legendDatasets: 'Datasets',
            legendDistributions: 'Distributions',
            legendDistributionsLicenses: 'Distributions with Licenses',
            legendInsights: 'Insights',
            legendLicenses: 'Licenses',
            legendOverview: 'Overview',
            loading: 'please wait while loading data',
            optionsDownloadCSV: 'Download as CSV table',
            optionsDownloadPNG: 'Download as PNG image',
            optionsLoadMonth: 'Load more data (one month)',
            optionsLoadWeek: 'Load more data (one week)',
            optionsMaximize: 'Maximize chart',
            optionsMenu: 'Options',
            optionsMinimize: 'Minimize chart',
            optionsRemoveLoaded: 'Remove loaded data',
            progressLoading: 'Loading data ...',
        },
    },
};

var diff = null;
var catalog = {
    id: 'http://data.europa.eu/88u/catalogue/govdata',
    getSameAs: function() { return []; },
    set: catalogSet,
    update: catalogUpdate,
};
var charthistory = {
    update: function() {
        chartsupplier.update();
    },
};

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

var idHistoryDatasets = 'history-datasets',
    idHistoryDistributions = 'history-distributions',
    idHistoryDataservices = 'history-dataservices',
    idEUSummary = 'hvd-eu',
    idEUSummaryNot = 'hvd-not-eu',
    idToolOverview = 'toolOverview',
    idToolDatasets = 'toolDatasets',
    idToolDistributions = 'toolDistributions',
    idToolDataservices = 'toolDataservices',
    idToolLicenses = 'toolLicenses',
    idToolInsights = 'toolInsights',
    idTabOverview = 'tabOverview';
    idTabDatasets = 'tabDatasets';
    idTabDistributions = 'tabDistributions';
    idTabDataservices = 'tabDataservices';
    idTabLicenses = 'tabLicenses';
    idTabInsights = 'tabInsights';
    idRadarChart = 'dataset-hvd-radar',
    idOfficial = 'hvd-official',
    idDiffDistributions = 'diffDistributions',
    radarChart = null,
    radarEmptyStates = [];

// ----------------------------------------------------------------------------

function monitorFormatNumber(x) {
    if (x === null) {
        return '-';
    }
    if (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return x;
}

function monitorGetDatasetCountByDate(catalogId, dateString, countDatasets) {
    var dataObj = data.getDate(dateString);
    var count = undefined;

    if (dataObj) {
        dataObj.forEach((row) => {
            if (row.catalogURI === catalogId) {
                count = row.datasets;
            }
        });
    }

    return count;
}

function monitorGetDatasetCount2ByDate(catalogId, dateString, countDatasets) {
    var dataObj = data.getDate(dateString);
    var count = undefined;

    if (dataObj) {
        dataObj.forEach((row) => {
            if (row.catalogURI === catalogId) {
                count = row.distributions;
            }
        });
    }

    return count;
}

function monitorGetDatasetCount3ByDate(catalogId, dateString, countDatasets) {
    var dataObj = data.getDate(dateString);
    var count = undefined;

    if (dataObj) {
        dataObj.forEach((row) => {
            if (row.catalogURI === catalogId) {
                count = row.dataservices;
            }
        });
    }

    return count;
}

function monitorLoadMoreDays(days) {
    data.loadMoreData(days);
}

function monitorRemoveLoadedDays() {
    data.removeLoadedData();
}

function monitorGetAsCSV(chartObject) {
    var ret = [];
    var len = chartObject.getRowTitles().length;
    var col = chartObject.getColumnTitles().length;

    var header = [];
    header.push('date');
    for (var c = 0; c < col; ++c) {
        header.push(chartObject.getColumnTitles()[c].replace(/,/g, ''));
    }
    ret.push(header);

    for (var l = 0; l < len; ++l) {
        var line = [];
        line.push(chartObject.getRowTitles()[l]);

        for (var c = 0; c < col; ++c) {
            line.push(chartObject.getData()[c][l]);
        }
        ret.push(line);
    }

    return ret;
}

function monitorDownloadAsCSV(chartObjectName) {
    var objects = {charthistory, chartsupplier};
    var chartObject = objects[chartObjectName];
    var csv = 'data:text/csv;charset=utf-8,' + monitorGetAsCSV(chartObject).map(e => e.join(',')).join("\n");

    var encoded = encodeURI(csv);
    var link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', chartObject.getFileName() + '.csv');
    document.body.appendChild(link);

    link.click();
}

function monitorZoomIn() {
    document.getElementById('columnLeft').className = 'col-12';
    document.getElementById('columnMiddle').className = 'col-12';
    document.getElementById('columnRight').className = 'col-12';

    document.getElementById('historyZoomIn').style.pointerEvents = 'none';
    document.getElementById('historyZoomIn').classList.remove('text-dark');

    document.getElementById('historyZoomOut').style.pointerEvents = '';
    document.getElementById('historyZoomOut').classList.add('text-dark');
}

function monitorZoomOut() {
    document.getElementById('columnLeft').className = 'col-12 col-sm-6 col-md-4 col-xl-4';
    document.getElementById('columnMiddle').className = 'col-12 col-sm-6 col-md-4 col-xl-4';
    document.getElementById('columnRight').className = 'col-12 col-sm-6 col-md-4 col-xl-4';

    document.getElementById('historyZoomIn').style.pointerEvents = '';
    document.getElementById('historyZoomIn').classList.add('text-dark');

    document.getElementById('historyZoomOut').style.pointerEvents = 'none';
    document.getElementById('historyZoomOut').classList.remove('text-dark');
}

// ----------------------------------------------------------------------------

function catalogGetDownloadMenu(chartObjectName) {
    var html = '';
    html += '<a title="' + hvdSettings.dict[nav.lang].optionsMenu + '" class="ms-3" style="text-decoration:none;float:right;color:#939ba2;border:1px solid #939ba2;border-radius:2rem;height:2rem;width:2rem;line-height:1.6rem;text-align:center" href="#" id="downloadDropdown" data-bs-toggle="dropdown">';
    html += '<span>...</span>';
    html += '</a>';
    html += '<div class="dropdown-menu dropdown-menu-lg dropdown-menu-start py-2" aria-labelledby="downloadDropdown" id="table-menu">';
    html += '<a onclick="monitorDownloadAsCSV(\'' + chartObjectName + '\')" class="d-block px-3 py-1 text-dark fw-normal">' + hvdSettings.dict[nav.lang].optionsDownloadCSV + '</a>';
//        html += '<a onclick="monitorDownloadAsPNG()" class="d-block px-3 py-1 text-dark fw-normal">' + hvdSettings.dict[nav.lang].optionsDownloadPNG + '</a>';
    html += '<div class="dropdown-divider"></div>';
/*    html += '<a onclick="monitorLoadMoreDays(7)" class="d-block px-3 py-1 text-dark fw-normal">' + hvdSettings.dict[nav.lang].optionsLoadWeek + '</a>';
    html += '<a onclick="monitorLoadMoreDays(30)" class="d-block px-3 py-1 text-dark fw-normal">' + hvdSettings.dict[nav.lang].optionsLoadMonth + '</a>';
    html += '<a onclick="monitorRemoveLoadedDays()" id="removeLoadedDays" class="d-block px-3 py-1 fw-normal" style="color:#ccc;pointer-events:none">' + hvdSettings.dict[nav.lang].optionsRemoveLoaded + '</a>';
    html += '<div class="dropdown-divider"></div>';*/
    html += '<a onclick="monitorZoomIn()" id="historyZoomIn" class="d-block px-3 py-1 text-dark fw-normal" style="color:#ccc">' + hvdSettings.dict[nav.lang].optionsMaximize + '</a>';
    html += '<a onclick="monitorZoomOut()" id="historyZoomOut" class="d-block px-3 py-1 fw-normal" style="color:#ccc;pointer-events:none">' + hvdSettings.dict[nav.lang].optionsMinimize + '</a>';
    html += '</div>';

    return html;
}

function catalogSet(catalogId) {
    window.scrollTo(0, 0);
    catalog.update();

    if (date) {
        date.update();
    }
    data.emitFilterChanged();
}

function catalogUpdate() {
    var elemDatasets = document.getElementById(idHistoryDatasets);
    if (elemDatasets) {
        elemDatasets.innerHTML = data.loadedDays + ' ' + hvdSettings.dict[nav.lang].historyDataset + ' ' + catalogGetDownloadMenu('chartsupplier');
    }

    var elemDistributions = document.getElementById(idHistoryDistributions);
    if (elemDistributions) {
        elemDistributions.innerHTML = data.loadedDays + ' ' + hvdSettings.dict[nav.lang].historyDistribution + ' ' /*+ catalogGetDownloadMenu('chartsupplier')*/;
    }

    var elemDataservices = document.getElementById(idHistoryDataservices);
    if (elemDataservices) {
        elemDataservices.innerHTML = data.loadedDays + ' ' + hvdSettings.dict[nav.lang].historyDataService + ' ' /*+ catalogGetDownloadMenu('chartsupplier')*/;
    }

    if (data.loadedDays > data.initalDays) {
        if (document.getElementById('removeLoadedDays')) {
            document.getElementById('removeLoadedDays').style.pointerEvents = '';
            document.getElementById('removeLoadedDays').classList.add('text-dark');
        }
    }

    if (data.loadedDays === 1) {
        setRadarData();
    }
}

// ----------------------------------------------------------------------------

function hvdChanges(diff) {
    data.addChangesDate(diff);
    setDistributionChangesHeader(data.getChangesDate());

    var elemDiff = document.getElementById(idDiffDistributions);
    var str = elemDiff.innerHTML;

    str += '<div class="mt-5">';
    str += '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-loader text-black align-top me-1 rotate"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>';
    str += hvdSettings.dict[nav.lang].progressLoading + '</div>';

    elemDiff.innerHTML = str;

    if (diff !== 0) {
        data.loadMoreChangesDate();
    }
}

function setDistributionChangesHeader(diffDate) {
    var elemDiff = document.getElementById(idDiffDistributions);
    var str = '';

    str += '<h2>' + hvdSettings.dict[nav.lang].diffTitle + '</h2>';
    str += '<div>' + hvdSettings.dict[nav.lang].diffInfoDataToday + '</div>';

    var current = new Date(diffDate);
    var currentStr = current.toLocaleDateString(nav.lang);
    str += '<div>';
    str += '<a onclick="hvdChanges(-1)"><span class="badge bg-info me-2 p-2">&lt;</span></a>';
    str += currentStr;
    str += '<a onclick="hvdChanges(1)"><span class="badge bg-info ms-2 p-2">&gt;</span></a>';
    str += '</div>';

    elemDiff.innerHTML = str;
}

function getDistributionSnippet(obj) {
    var url = obj.distributionAccessURL;
    var contentType = 'unknown';
    var assets = [];
    var error = null;
    var iid = '';
    var str = '';

    if (obj.distribution) {
        iid = obj.distribution.iid;
        url = obj.distribution.url;

        if (obj.distribution.insights) {
            contentType = obj.distribution.insights.contentType;
            error = obj.distribution.insights.error;
            assets = obj.distribution.insights.assets;
        }
    }

    var file = url.split('/').splice(-1)[0];
    if (-1 !== file.indexOf('?')) {
        file = file.split('?')[0] + '?...';
    }

    str += contentType;

    str += ' | ' + iid + ' | ' + obj.datasetIdentifier + ': ';
    str += '<a href="' + url + '" target="_blank">' + file + '</a>';
    str += ' <a class="link-info" href="#" onclick="selectHVD(this, 1)" data-bs-toggle="dropdown" data-dataset="' + obj.datasetIdentifier + '" data-accessurl="' + url + '">' + hvdSettings.dict[nav.lang].hvdDiscover + '</a>';
    str += '<br>';

    if (error) {
        error = error.replace(/\</g, "&lt;");
        str += '<div class="text-danger" style="margin:0 0 0 1em">';
        str += '- ' + error;
        str += '</div>';
}
    if (assets && (assets.length > 0)) {
        assets.forEach((item) => {
            str += '<div style="margin:0 0 0 1em;font-style:italic">';
            str += '- ' + item.title[nav.lang];
            str += '</div>';
        });
    }

    return str;
}

function setDistributionChanges(diff, diffDate) {
    setDistributionChangesHeader(diffDate);

    var elemDiff = document.getElementById(idDiffDistributions);
    var str = elemDiff.innerHTML;

    str += '<table class="mt-3 w-100">';
    str += '<thead><tr>';
    str += '<td class="w-50 text-center border-bottom border-3 border-success"><strong>' + hvdSettings.dict[nav.lang].diffTableHostsNew + '</strong></td>';
    str += '<td class="text-center border-bottom border-3 border-danger"><strong>' + hvdSettings.dict[nav.lang].diffTableHostsDeleted + '</strong>';
    str += '</td></tr></thead>'
    str += '<tbody style="vertical-align:top">';
    str += '<tr><td>';
    if (diff.hostsNew && diff.hostsNew.length > 0) {
        diff.hostsNew.forEach((host) => {
            str += '<a href="https://' + host + '" target="_blank">' + host + '</a><br>';
        });
    } else {
        str += '-';
    }
    str += '</td><td>';
    if (diff.hostsDeleted && diff.hostsDeleted.length > 0) {
        diff.hostsDeleted.forEach((host) => {
            str += '<a href="https://' + host + '" target="_blank">' + host + '</a><br>';
        });
    } else {
        str += '-';
    }
    str += '</td></tr>';
    str += '</tbody>';
    str += '</table>';

    str += '<table class="mt-3 w-100">';
    str += '<thead><tr>';
    str += '<td class="w-50 text-center border-bottom border-3 border-success"><strong>' + hvdSettings.dict[nav.lang].diffTableHostsAdded + '</strong></td>';
    str += '<td class="text-center border-bottom border-3 border-danger"><strong>' + hvdSettings.dict[nav.lang].diffTableHostsRemoved + '</strong>';
    str += '</td></tr></thead>'
    str += '<tbody style="vertical-align:top">';
    str += '<tr><td>';
    if (diff.hostsAdded && diff.hostsAdded.length > 0) {
        diff.hostsAdded.forEach((host) => {
            str += '<a href="https://' + host + '" target="_blank">' + host + '</a><br>';
        });
    } else {
        str += '-';
    }
    str += '</td><td>';
    if (diff.hostsRemoved && diff.hostsRemoved.length > 0) {
        diff.hostsRemoved.forEach((host) => {
            str += '<a href="https://' + host + '" target="_blank">' + host + '</a><br>';
        });
    } else {
        str += '-';
    }
    str += '</td></tr>';
    str += '</tbody>';
    str += '</table>';

    str += '<table class="mt-3 w-100">';
    str += '<thead><tr>';
    str += '<td class="w-100 text-center border-bottom border-3 border-success"><strong>' + hvdSettings.dict[nav.lang].diffTableAdded + '</strong></td>';
    str += '</td></tr></thead>'
    str += '<tbody style="vertical-align:top">';
    str += '<tr><td>';
    if (diff.added && diff.added.length > 0) {
        diff.added.forEach((obj) => {
            str += getDistributionSnippet(obj);
        });
    } else {
        str += '-';
    }
    str += '<div class="menu-canvas dropdown-menu dropdown-menu-lg dropdown-menu-start py-2" id="hvdDiscovery1" style="background:#222831;color:#a2c11c;">';
    str += '</div>';

    str += '</td></tr>';
    str += '</tbody>';
    str += '<thead><tr>';
    str += '<td class="text-center border-bottom border-3 border-danger"><strong>' + hvdSettings.dict[nav.lang].diffTableRemoved + '</strong>';
    str += '</td></tr></thead>'
    str += '<tbody style="vertical-align:top">';
    str += '<tr><td>';
    if (diff.removed && diff.removed.length > 0) {
        diff.removed.forEach((obj) => {
            str += getDistributionSnippet(obj);
        });
    } else {
        str += '-';
    }
    str += '<div class="menu-canvas dropdown-menu dropdown-menu-lg dropdown-menu-start py-2" id="hvdDiscovery2" style="background:#222831;color:#a2c11c;">';
    str += '</div>';

    str += '</td></tr>';
    str += '</tbody>';
    str += '</table>';

    elemDiff.innerHTML = str;
}

// ----------------------------------------------------------------------------

function loadLiveInsights(path, elemID) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);

    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(this.responseText);
            obj = obj.passes[0];

            var code = JSON.stringify(obj, null, '  ');
            var textArea = document.createElement('textarea');
            textArea.innerText = code;
            code = textArea.innerHTML;

            var str = '';
            str += '<div class="menu-body p-1" style="height:75vh;overflow:auto;">';
            str += '<pre>' + code + '</pre>';
            str += '</div>';

            var elem = document.getElementById(elemID);
            elem.innerHTML = str;
            window.scrollBy({top: 1});
            window.scrollBy({top: -1});
        } else if (this.readyState == 4) {
            var str = '';
            str += '<div class="menu-body p-1" style="height:75vh;overflow:auto;">';
            str += 'Error';
            str += '</div>';

            var elem = document.getElementById(elemID);
            elem.innerHTML = str;
            window.scrollBy({top: 1});
            window.scrollBy({top: -1});
        }
    }

    xhr.send();
}

function selectHVD(elemButton, num) {
    var elemID = 'hvdDiscovery' + num;
    var selectedDatasetIdentifier = elemButton.dataset.dataset;
    var selectedDistributionAccessURL = elemButton.dataset.accessurl;

    var str = '';
    str += '<div class="menu-body px-3 py-2" style="height:75vh;overflow:auto;">' + hvdSettings.dict[nav.lang].loading + '</div>';

    var elem = document.getElementById(elemID);
    elem.innerHTML = str;

    var url = 'https://opendata.guru/api/2/live/insights?url=' + encodeURIComponent(selectedDistributionAccessURL);
    loadLiveInsights(url, elemID);
}

// ----------------------------------------------------------------------------

function getHVDRadarConfig(data) {
    // https://www.chartjs.org/docs/2.7.3/axes/radial/linear.html#linear-radial-axis
    return {
        type: 'radar',
        data: data,
        options: {
            legend: {
                labels: {
                    boxWidth: 12,
                    fontColor: '#fff',
                },
                position: 'left',
            },
            responsive: true,
            scale: {
                angleLines: {
                    color: '#ffffff10',
                    lineWidth: 1,
                },
                gridLines: {
                    color: '#ffffff40',
                    lineWidth: 1,
                },
                pointLabels: {
                    fontColor: '#fff',
                    callback: (obj) => {
                        if (-1 === radarEmptyStates.indexOf(obj)) {
                            return obj;
                        }

                        return obj + ' 🚨';
                    },
                },
                ticks: {
                    backdropColor: '#ffffff30',
                    backdropPaddingX: 5,
                    backdropPaddingY: 2,
                    beginAtZero: true,
                    fontColor: '#ffffffa0',
                    showLabelBackdrop: false,
//max: 400,
                },
            },
        },
    };
}

function filterHVDRadarData() {
    var dataObj = data.get();
    var ret = [];

    if (dataObj) {
        dataObj.forEach((obj) => {
            // obj.sObject
            var datasets = parseInt(obj.datasets ? obj.datasets : 0, 10);
            var distributions = parseInt(obj.distributions ? obj.distributions : 0, 10);
            var dataservices = parseInt(obj.dataservices ? obj.dataservices : 0, 10);
            var licenses = 0;
            var title = '';

            if (obj.licenses) {
                licenses = obj.licenses.cc_0 +
                    obj.licenses.cc_0_comparable +
                    obj.licenses.cc_by +
                    obj.licenses.cc_by_comparable +
                    obj.licenses.restrictive +
                    obj.licenses.unknown;
            }

            var name = obj.catalogURI.split('/').slice(-1)[0];
            var sum = datasets + distributions + dataservices + licenses;
            title = name;

            if (sum > 0 ) {
                ret.push({
                    name,
                    title,
                    datasets,
                    distributions,
                    dataservices,
                    licenses,
                });
            }
        });
    }

    var mapping = data.getPortalTitleList();
    ret.forEach((obj) => {
        var title = mapping[obj.name];
        if (title) {
            obj.title = title[nav.lang];
            mapping[obj.name] = null;
        }
    });

    radarEmptyStates = [];
    Object.keys(mapping).forEach((country) => {
        if (mapping[country]) {
            radarEmptyStates.push(mapping[country][nav.lang]);
            ret.push({
                name: country,
                title: mapping[country][nav.lang],
                datasets: null,
                distributions: null,
                dataservices: null,
                licenses: null,
            });
        }
    });

    return ret;
}

function getHVDRadarData() {
    return {
        labels: hvdSettings.dict[nav.lang].loading.split(' '),
        datasets: [
        {
            label: hvdSettings.dict[nav.lang].legendDatasets,
            data: [],
            borderColor: '#c28a0d',
            backgroundColor: '#c28a0d40',
        },
        {
            label: hvdSettings.dict[nav.lang].legendDistributions,
            data: [],
            borderColor: '#2b67f1',
            backgroundColor: '#2b67f140',
        },
        {
            label: hvdSettings.dict[nav.lang].legendDataServices,
            data: [],
            borderColor: '#c20d44',
            backgroundColor: '#c20d4440',
        },
        {
            label: hvdSettings.dict[nav.lang].legendDistributionsLicenses,
            data: [],
            borderColor: '#0dc28a',
            backgroundColor: '#0dc28a40',
        }
        ]
    };
}

function setRadarData() {
    var radarData = filterHVDRadarData();

    radarData.sort((a, b) => {
        if (a.distributions === b.distributions) {
            if (a.datasets === b.datasets) return a.title.localeCompare(b.title);

            return a.datasets < b.datasets ? 1 : -1;
        }

        if (a.distributions === null) return 1;
        if (b.distributions === null) return -1;
        return a.distributions < b.distributions ? 1 : -1;
    });

    var data = radarChart.data;
    if (radarData && (data.datasets.length > 0)) {
        data.labels = [];

        radarData.forEach((entry) => {
            data.labels.push(entry.title);

            data.datasets[0].data.push(entry.datasets);
            data.datasets[1].data.push(entry.distributions);
            data.datasets[2].data.push(entry.dataservices);
            data.datasets[3].data.push(entry.licenses);

        });

        radarChart.update();
    }
}

function initHVDSummary() {
    var text = '';
    text += '<div class="col-12 p-4" style="background:#082b7a;color:#fff;">';
    text += '<div>' + hvdSettings.dict[nav.lang].hvdEUTitle + '</div>';

    text += '<div id="hvd-radar-chart" class="chart chart-sm">';
    text += '<canvas id="' + idRadarChart + '"></canvas>';
    text += '</div>';

    text += '</div>'

    document.getElementById(idEUSummary).innerHTML += text;

    document.getElementById(idEUSummaryNot).innerHTML = hvdSettings.dict[nav.lang].hvdEUTitleNot;
    document.getElementById(idToolOverview).innerHTML = hvdSettings.dict[nav.lang].legendOverview;
    document.getElementById(idToolDatasets).innerHTML = hvdSettings.dict[nav.lang].legendDatasets;
    document.getElementById(idToolDistributions).innerHTML = hvdSettings.dict[nav.lang].legendDistributions;
    document.getElementById(idToolDataservices).innerHTML = hvdSettings.dict[nav.lang].legendDataServices;
    document.getElementById(idToolLicenses).innerHTML = hvdSettings.dict[nav.lang].legendLicenses;
    document.getElementById(idToolInsights).innerHTML = hvdSettings.dict[nav.lang].legendInsights;

    text = '';
    text += '<div class="col-12 p-4" style="border-bottom:.25em solid #082b7a;">';
    text += hvdSettings.dict[nav.lang].hvdEUNotPublished;
    text += '<br><br>';
    text += hvdSettings.dict[nav.lang].hvdEUSPARQLPublished + ' <a href="https://dataeuropa.gitlab.io/data-provider-manual/hvd/Reporting_guidelines_for_HVDs/" target="_blank">' + hvdSettings.dict[nav.lang].hvdEUSPARQLPublishedHere + '</a>.';
    text += '<br><br>';
    text += hvdSettings.dict[nav.lang].hvdEUSPARQLMeantime +' <a href="https://github.com/opendata-guru/data-universal-repository-api/blob/main/api/cronjob/cronjob-hvd-queries.php" target="_blank">' + hvdSettings.dict[nav.lang].hvdEUSPARQLMeantimeHere + '</a>.';
    text += '</div>';

    document.getElementById(idOfficial).innerHTML = text;

    radarChart = new Chart(document.getElementById(idRadarChart), getHVDRadarConfig(getHVDRadarData()));

    hvdChanges(0);
}

function onHVDTool(elem) {
    document.getElementById(idToolOverview).classList.remove('btn-info', 'btn-secondary', 'mt-2');
    document.getElementById(idToolDatasets).classList.remove('btn-info', 'btn-secondary', 'mt-2');
    document.getElementById(idToolDistributions).classList.remove('btn-info', 'btn-secondary', 'mt-2');
    document.getElementById(idToolDataservices).classList.remove('btn-info', 'btn-secondary', 'mt-2');
    document.getElementById(idToolLicenses).classList.remove('btn-info', 'btn-secondary', 'mt-2');
    document.getElementById(idToolInsights).classList.remove('btn-info', 'btn-secondary', 'mt-2');

    document.getElementById(idToolOverview).classList.add(idToolOverview === elem.id ? 'btn-info' : 'btn-secondary');
    document.getElementById(idToolDatasets).classList.add(idToolDatasets === elem.id ? 'btn-info' : 'btn-secondary');
    document.getElementById(idToolDistributions).classList.add(idToolDistributions === elem.id ? 'btn-info' : 'btn-secondary');
    document.getElementById(idToolDataservices).classList.add(idToolDataservices === elem.id ? 'btn-info' : 'btn-secondary');
    document.getElementById(idToolLicenses).classList.add(idToolLicenses === elem.id ? 'btn-info' : 'btn-secondary');
    document.getElementById(idToolInsights).classList.add(idToolInsights === elem.id ? 'btn-info' : 'btn-secondary');

    if (!document.getElementById(idTabOverview).classList.contains('d-none')) document.getElementById(idTabOverview).classList.add('d-none');
    if (!document.getElementById(idTabDatasets).classList.contains('d-none')) document.getElementById(idTabDatasets).classList.add('d-none');
    if (!document.getElementById(idTabDistributions).classList.contains('d-none')) document.getElementById(idTabDistributions).classList.add('d-none');
    if (!document.getElementById(idTabDataservices).classList.contains('d-none')) document.getElementById(idTabDataservices).classList.add('d-none');
    if (!document.getElementById(idTabLicenses).classList.contains('d-none')) document.getElementById(idTabLicenses).classList.add('d-none');
    if (!document.getElementById(idTabInsights).classList.contains('d-none')) document.getElementById(idTabInsights).classList.add('d-none');

    if (idToolOverview === elem.id) document.getElementById(idTabOverview).classList.remove('d-none');
    if (idToolDatasets === elem.id) document.getElementById(idTabDatasets).classList.remove('d-none');
    if (idToolDistributions === elem.id) document.getElementById(idTabDistributions).classList.remove('d-none');
    if (idToolDataservices === elem.id) document.getElementById(idTabDataservices).classList.remove('d-none');
    if (idToolLicenses === elem.id) document.getElementById(idTabLicenses).classList.remove('d-none');
    if (idToolInsights === elem.id) document.getElementById(idTabInsights).classList.remove('d-none');
}

// ----------------------------------------------------------------------------

var idLoadingLabel = 'loading-description',
classNameLoadingCard = 'card-loading';

function showProgress(value) {
    var text = '';
    value = value || '';
    text += '<span class="text-black">' + hvdSettings.dict[nav.lang].progressLoading + '</span>';
    text += '<span class="text-secondary"> <i class="mdi mdi-arrow-bottom-right"></i> ' + value + ' </span>';

    document.getElementById(idLoadingLabel).innerHTML = text;
    document.getElementsByClassName(classNameLoadingCard)[0].style.top = '-1px';
}

function hideProgress() {
    document.getElementsByClassName(classNameLoadingCard)[0].style.top = '-3.5rem';

    setDistributionChanges(data.getChanges(), data.getChangesDate());
}

document.addEventListener('DOMContentLoaded', function() {
    data.addEventListenerStartLoading(showProgress);
    data.addEventListenerEndLoading(hideProgress);

    data.loadData(hvdSettings.maxDays);
});

initHVDSummary();

// ----------------------------------------------------------------------------
