var hvdSettings = {
    maxDays: 20,
};

var data = null;
var diff = null;
var catalog = {
    id: 'http://data.europa.eu/88u/catalogue/govdata',
    getSameAs: function() { return []; },
};
var chartsupplier = {
    update: function() {},
};

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
    var dataObj = dataHVD.getDate(dateString);
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
    dataHVD.loadMoreData(days);
}

function monitorRemoveLoadedDays() {
    dataHVD.removeLoadedData();
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
    dataHVD.addEventListenerStartLoading(showProgress);
    dataHVD.addEventListenerEndLoading(hideProgress);

    dataHVD.loadData(hvdSettings.maxDays);
});

// ----------------------------------------------------------------------------
