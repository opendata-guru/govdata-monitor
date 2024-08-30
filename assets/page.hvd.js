var hvdSettings = {
    maxDays: 20,
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

var idHistoryTitle = 'history-title',
    idEUSummary = 'hvd-eu',
    idRadarChart = 'dataset-hvd-radar',
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

    document.getElementById('historyZoomIn').style.pointerEvents = 'none';
    document.getElementById('historyZoomIn').classList.remove('text-dark');

    document.getElementById('historyZoomOut').style.pointerEvents = '';
    document.getElementById('historyZoomOut').classList.add('text-dark');

    document.getElementById('history-chart').classList.remove('chart-sm');
    document.getElementById('history-chart').classList.add('chart-lg');
}

function monitorZoomOut() {
    document.getElementById('columnLeft').className = 'col-12 col-sm-6 col-md-7 col-xl-7';

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
    html += '<a title="Options" class="ms-3" style="text-decoration:none;float:right;color:#939ba2;border:1px solid #939ba2;border-radius:2rem;height:2rem;width:2rem;line-height:1.6rem;text-align:center" href="#" id="downloadDropdown" data-bs-toggle="dropdown">';
    html += '<span>...</span>';
    html += '</a>';
    html += '<div class="dropdown-menu dropdown-menu-lg dropdown-menu-start py-2" aria-labelledby="downloadDropdown" id="table-menu">';
    html += '<a onclick="monitorDownloadAsCSV(\'' + chartObjectName + '\')" class="d-block px-3 py-1 text-dark fw-normal">Download as CSV table</a>';
//        html += '<a onclick="monitorDownloadAsPNG()" class="d-block px-3 py-1 text-dark fw-normal">Download as PNG image</a>';
    html += '<div class="dropdown-divider"></div>';
/*    html += '<a onclick="monitorLoadMoreDays(7)" class="d-block px-3 py-1 text-dark fw-normal">Load more data (one week)</a>';
    html += '<a onclick="monitorLoadMoreDays(30)" class="d-block px-3 py-1 text-dark fw-normal">Load more data (one month)</a>';
    html += '<a onclick="monitorRemoveLoadedDays()" id="removeLoadedDays" class="d-block px-3 py-1 fw-normal" style="color:#ccc;pointer-events:none">Remove loaded data</a>';
    html += '<div class="dropdown-divider"></div>';*/
    html += '<a onclick="monitorZoomIn()" id="historyZoomIn" class="d-block px-3 py-1 text-dark fw-normal" style="color:#ccc">Maximize diagramm</a>';
    html += '<a onclick="monitorZoomOut()" id="historyZoomOut" class="d-block px-3 py-1 fw-normal" style="color:#ccc;pointer-events:none">Minimize diagramm</a>';
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
    var elemHistory = document.getElementById(idHistoryTitle);
    if (elemHistory) {
        elemHistory.innerHTML = data.loadedDays + ' days HVD history ' + catalogGetDownloadMenu('chartsupplier');
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
                gridLines: {
                    color: '#ffffff30',
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
        'data-gv-at':'Austria', 'data-gov-be':'Belgium', 'bg':'Bulgaria','hr':'Croatia','cy':'Cyprus',
        'cz':'Czechia', 'dk':'Denmark', 'ee':'Estonia', 'fi':'Finland',
        'plateforme-ouverte-des-donnees-publiques-francaises':'France', 'govdata':'Germany',
        'gr':'Greece', 'hu':'Hungary', 'ie':'Ireland', 'it':'Italy', 'lv':'Latvia', 'lt':'Lithuania',
        'lu':'Luxembourg', 'mt':'Malta', 'nl':'Netherlands', 'pl':'Poland', 'pt':'Portugal',
        'ro':'Romania', 'sk':'Slovakia', 'si':'Slovenia', 'es':'Spain', 'oppnadata':'Sweden'
    };
    ret.forEach((obj) => {
        var title = mapping[obj.name];
        if (title) {
            obj.title = title;
            mapping[obj.name] = null;
        }
    });

    radarEmptyStates = [];
    Object.keys(mapping).forEach((country) => {
        if (mapping[country]) {
            radarEmptyStates.push(mapping[country]);
            ret.push({
                name: country,
                title: mapping[country],
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
        labels: ['please','wait','while','loading','data'],
        datasets: [
        {
            label: 'Datasets',
            data: [],
            borderColor: '#c28a0d',
            backgroundColor: '#c28a0d40',
        },
        {
            label: 'Distributions',
            data: [],
            borderColor: '#2b67f1',
            backgroundColor: '#2b67f140',
        },
        {
            label: 'Data Services',
            data: [],
            borderColor: '#c20d44',
            backgroundColor: '#c20d4440',
        },
        {
            label: 'Distributions with Licenses',
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
        if (a.datasets === b.datasets) return 0;
        return a.datasets < b.datasets ? 1 : -1;
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
    text += '<div>This is what the HVD’s EU reporting could look like</div>';

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
    text += '<span class="text-black">Loading data ... </span>';
    text += '<span class="text-secondary"> <i class="mdi mdi-arrow-bottom-right"></i> ' + value + ' </span>';

    document.getElementById(idLoadingLabel).innerHTML = text;
    document.getElementsByClassName(classNameLoadingCard)[0].style.top = '-1px';
}

function hideProgress() {
    document.getElementsByClassName(classNameLoadingCard)[0].style.top = '-3.5rem';
}

document.addEventListener('DOMContentLoaded', function() {
    data.addEventListenerStartLoading(showProgress);
    data.addEventListenerEndLoading(hideProgress);

    data.loadData(hvdSettings.maxDays);
});

initHVDSummary();

// ----------------------------------------------------------------------------
