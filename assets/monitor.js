var monitor = {
    maxDays: 20,
    chartPie: null,
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
    var dataObj = data.getDate(dateString);
    var count = undefined;

    if (dataObj) {
        dataObj.forEach((row) => {
            if (row.id === catalogId) {
                if ((row.type === 'root') && !countDatasets) {
                    return;
                }

                count = countDatasets ? row.datasetCount : row.packages;
            }
        });
    }

    return count;
}

function monitorGetDatasetCount2ByDate(catalogId, dateString, countDatasets) {
    return undefined;
}

function monitorGetDatasetCount3ByDate(catalogId, dateString, countDatasets) {
    return undefined;
}

function monitorLoadMoreDays(days) {
    data.loadMoreData(days);
}

function monitorRemoveLoadedDays() {
    data.removeLoadedData();
}

function monitorGetAsCSV(chartObject, chartObjectID) {
    var ret = [];
    var len = chartObject.getRowTitles(chartObjectID).length;
    var col = chartObject.getColumnTitles(chartObjectID).length;

    var header = [];
    header.push('date');
    for (var c = 0; c < col; ++c) {
        header.push(chartObject.getColumnTitles(chartObjectID)[c].replace(/,/g, ''));
    }
    ret.push(header);

    for (var l = 0; l < len; ++l) {
        var line = [];
        line.push(chartObject.getRowTitles(chartObjectID)[l]);

        for (var c = 0; c < col; ++c) {
            line.push(chartObject.getData(chartObjectID)[c][l]);
        }
        ret.push(line);
    }

    return ret;
}

function monitorGetAsPNG() {
    return monitor.chartPie.toBase64Image();
}

function monitorDownloadAsCSV(chartObjectName) {
    var objects = {charthistory, chartsupplier, chartLObjects, chartCatalogObjects};
    var chartObjectTitle = chartObjectName.split('|')[0];
    var chartObjectID = chartObjectName.split('|')[1];
    var chartObject = objects[chartObjectTitle];
    var csv = 'data:text/csv;charset=utf-8,' + monitorGetAsCSV(chartObject, chartObjectID).map(e => e.join(',')).join("\n");

    var encoded = encodeURI(csv);
    var link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', chartObject.getFileName(chartObjectID) + '.csv');
    document.body.appendChild(link);

    link.click();
}

function monitorDownloadAsPNG() {
    let png = monitorGetAsPNG();

    var link = document.createElement('a');
    link.setAttribute('href', png);
    link.setAttribute('download', 'download.png');
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

function monitorUpdateCatalogPieChart() {
    var labels = [];
    var counts = [];
    var slices = 8;

    if (data.view.length > 0) {
        data.view.forEach((row) => {
            var count = row.cols[row.cols.length - 1].count;
            if (labels.length < slices) {
                labels.push(row.title);
                counts.push(count);
            } else if (labels.length === slices) {
                labels.push('other');
                counts.push(count);
            } else {
                counts[slices] += count;
            }
        });
    }

    var pieData = {
        labels: labels,
        datasets: [{
            data: counts,
            backgroundColor: [
                '#e6261f',
                '#eb7532',
                '#f7d038',
                '#a3e048',
                '#49da9a',
                '#34bbe6',
                '#4355db',
                '#d23be7',
                window.theme.secondary
            ],
            borderWidth: 5
        }]
    };

    if (monitor.chartPie !== null) {
        monitor.chartPie.data = pieData;
        monitor.chartPie.update();
    } else {
        monitor.chartPie = new Chart(document.getElementById('supplier-pie'), {
            type: 'pie',
            data: pieData,
            options: {
                responsive: !window.MSInputMethodContext,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                cutoutPercentage: 10
            }
        });
    }
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
    system.addEventListenerStartLoading(showProgress);
    system.addEventListenerEndLoading(() => {
        hideProgress();

        data.loadData(monitor.maxDays);
    });
    data.addEventListenerStartLoading(showProgress);
    data.addEventListenerEndLoading(hideProgress);

    catalog.start();
    system.loadData();
});

// ----------------------------------------------------------------------------
