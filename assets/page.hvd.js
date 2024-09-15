var hvdSettings = {
    maxDays: 20,
    dict: {
        de: {
            diffInfoDataToday: 'Diese Änderungen in den HVD-Datensätzen sind seit gestern aufgetreten.',
            diffTableAdded: 'Neue Links',
            diffTableCount: 'Anzahl',
            diffTableDetail: 'Detail',
            diffTableHostsAdded: 'Neue Links von diesen Hosts',
            diffTableHostsDeleted: 'Hosts, die jetzt keine Links mehr haben',
            diffTableHostsNew: 'Bisher unbekannte Hosts',
            diffTableHostsRemoved: 'Links von diesen Hosts entfernt',
            diffTableRemoved: 'Links entfernt',
            diffTitle: 'Übersicht der Distributionen aus Deutschland',
            historyDataset: 'Tage-Verlauf für Datensätze',
            historyDistribution: 'Tage-Verlauf für Distributionen',
            historyDataService: 'Tage-Verlauf für Datendienste',
            hvdEUTitle: 'So könnte die EU-Berichterstattung für HVD\'s aussehen',
            legendDataServices: 'Datendienste',
            legendDatasets: 'Datensätze',
            legendDistributions: 'Distributionen',
            legendDistributionsLicenses: 'Distributionen mit Lizenzen',
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
            diffTableCount: 'Count',
            diffTableDetail: 'Detail',
            diffTableHostsAdded: 'New links in these hosts',
            diffTableHostsDeleted: 'Hosts who now no longer have links',
            diffTableHostsNew: 'Previously unknown hosts',
            diffTableHostsRemoved: 'Removed links in these hosts',
            diffTableRemoved: 'Removed links',
            diffTitle: 'Overview of distributions from Germany',
            historyDataset: 'days dataset history',
            historyDistribution: 'days distribution history',
            historyDataService: 'days data service history',
            hvdEUTitle: 'This is what the HVD\'s EU reporting could look like',
            legendDataServices: 'Data Services',
            legendDatasets: 'Datasets',
            legendDistributions: 'Distributions',
            legendDistributionsLicenses: 'Distributions with Licenses',
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
    idRadarChart = 'dataset-hvd-radar',
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

    document.getElementById('history-chart').classList.remove('chart-sm');
    document.getElementById('history-chart').classList.add('chart-lg');
}

function monitorZoomOut() {
    document.getElementById('columnLeft').className = 'col-12 col-sm-6 col-md-4 col-xl-4';
    document.getElementById('columnMiddle').className = 'col-12 col-sm-6 col-md-4 col-xl-4';
    document.getElementById('columnRight').className = 'col-12 col-sm-6 col-md-4 col-xl-4';

    document.getElementById('historyZoomIn').style.pointerEvents = '';
    document.getElementById('historyZoomIn').classList.add('text-dark');

    document.getElementById('historyZoomOut').style.pointerEvents = 'none';
    document.getElementById('historyZoomOut').classList.remove('text-dark');

    document.getElementById('history-chart').classList.remove('chart-lg');
    document.getElementById('history-chart').classList.add('chart-sm');
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

function setDistributionChanges(diff) {
    var elemDiff = document.getElementById(idDiffDistributions);
    var str = '';

    str += '<h2>' + hvdSettings.dict[nav.lang].diffTitle + '</h2>';
    str += '<div>' + hvdSettings.dict[nav.lang].diffInfoDataToday + '</div>';

    str += '<table class="mt-3">';
    str += '<thead><tr><td></td><td><strong>' + hvdSettings.dict[nav.lang].diffTableCount + '</strong></td><td><strong>' + hvdSettings.dict[nav.lang].diffTableDetail + '</strong></td></tr></thead>'
    str += '<tbody style="vertical-align:top">';

    str += '<tr style="background:#1cbb8c54"><td><strong>' + hvdSettings.dict[nav.lang].diffTableHostsNew + '</strong></td><td class="text-center">' + diff.hostsNew.length + '</td><td>';
    diff.hostsNew.forEach((host) => {
        str += '<a href="https://' + host + '" target="_blank">' + host + '</a><br>';
    });
    str += '</td></tr>';

    str += '<tr style="background:#dc354554"><td><strong>' + hvdSettings.dict[nav.lang].diffTableHostsDeleted + '</strong></td><td class="text-center">' + diff.hostsDeleted.length + '</td><td>';
    diff.hostsDeleted.forEach((host) => {
        str += '<a href="https://' + host + '" target="_blank">' + host + '</a><br>';
    });
    str += '</td></tr>';

    str += '<tr style="background:#1cbb8c54"><td><strong>' + hvdSettings.dict[nav.lang].diffTableHostsAdded + '</strong></td><td class="text-center">' + diff.hostsAdded.length + '</td><td>';
    diff.hostsAdded.forEach((host) => {
        str += '<a href="https://' + host + '" target="_blank">' + host + '</a><br>';
    });
    str += '</td></tr>';

    str += '<tr style="background:#dc354554"><td><strong>' + hvdSettings.dict[nav.lang].diffTableHostsRemoved + '</strong></td><td class="text-center">' + diff.hostsRemoved.length + '</td><td>';
    diff.hostsRemoved.forEach((host) => {
        str += '<a href="https://' + host + '" target="_blank">' + host + '</a><br>';
    });
    str += '</td></tr>';

    str += '<tr style="background:#1cbb8c54"><td><strong>' + hvdSettings.dict[nav.lang].diffTableAdded + '</strong></td><td class="text-center">' + diff.added.length + '</td><td>';
    diff.added.forEach((obj) => {
        var file = obj.distributionAccessURL.split('/').splice(-1)[0];
        str += obj.datasetIdentifier + ': ';
        str += '<a href="' + obj.distributionAccessURL + '" target="_blank">' + file + '</a><br>';
    });
    str += '</td></tr>';

    str += '<tr style="background:#dc354554"><td><strong>' + hvdSettings.dict[nav.lang].diffTableRemoved + '</strong></td><td class="text-center">' + diff.removed.length + '</td><td>';
    diff.removed.forEach((obj) => {
        var file = obj.distributionAccessURL.split('/').splice(-1)[0];
        str += obj.datasetIdentifier + ': ';
        str += '<a href="' + obj.distributionAccessURL + '" target="_blank">' + file + '</a><br>';
    });
    str += '</td></tr>';

    str += '</tbody>';
    str += '</table>';

    elemDiff.innerHTML = str;
    console.log(diff);
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

    var mapping = {
        'data-gv-at':{de: 'Österreich', en: 'Austria'},
        'data-gov-be':{de: 'Belgien', en: 'Belgium'},
        'bg':{de: 'Bulgarien', en: 'Bulgaria'},
        'hr':{de: 'Kroatien', en: 'Croatia'},
        'cy':{de: 'Zypern', en: 'Cyprus'},
        'nkod-opendata-cz':{de: 'Tschechien', en: 'Czechia'},
        'dk':{de: 'Dänemark', en: 'Denmark'},
        'ee':{de: 'Estland', en: 'Estonia'},
        'fi':{de: 'Finnland', en: 'Finland'},
        'plateforme-ouverte-des-donnees-publiques-francaises':{de: 'Frankreich', en: 'France'},
        'govdata':{de: 'Deutschland', en: 'Germany'},
        'gr':{de: 'Griechenland', en: 'Greece'},
        'hu':{de: 'Ungarn', en: 'Hungary'},
        'ie':{de: 'Irland', en: 'Ireland'},
        'it':{de: 'Italien', en: 'Italy'},
        'lv':{de: 'Lettland', en: 'Latvia'},
        'lt':{de: 'Litauen', en: 'Lithuania'},
        'lu':{de: 'Luxemburg', en: 'Luxembourg'},
        'mt':{de: 'Malta', en: 'Malta'},
        'nl':{de: 'Niederlande', en: 'Netherlands'},
        'pl':{de: 'Polen', en: 'Poland'},
        'pt':{de: 'Portugal', en: 'Portugal'},
        'ro':{de: 'Rumänien', en: 'Romania'},
        'sk':{de: 'Slowakei', en: 'Slovakia'},
        'si':{de: 'Slowenien', en: 'Slovenia'},
        'es':{de: 'Spanien', en: 'Spain'},
        'oppnadata':{de: 'Schweden', en: 'Sweden'},
    };
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

    radarChart = new Chart(document.getElementById(idRadarChart), getHVDRadarConfig(getHVDRadarData()));
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

    setDistributionChanges(data.getChanges());
}

document.addEventListener('DOMContentLoaded', function() {
    data.addEventListenerStartLoading(showProgress);
    data.addEventListenerEndLoading(hideProgress);

    data.loadData(hvdSettings.maxDays);
});

initHVDSummary();

// ----------------------------------------------------------------------------