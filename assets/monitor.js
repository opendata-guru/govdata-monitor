var monitor = {
    maxDays: 20,
    chartLine: null,
    chartLineHeader: [],
    chartLineData: [],
    chartLineRowDates: [],
    chartPie: null,
    displayDate: '',
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

function monitorLoadMoreDays(days) {
    data.loadMoreData(days);
}

function monitorRemoveLoadedDays() {
    data.removeLoadedData();
}

function monitorUpdateCatalogHistoryChart() {
    var ctx = document.getElementById('dataset-history').getContext('2d');
    var stepSize = 25000;
    monitor.chartLineRowDates = [];
    var gradient = [];
    var gradientBase = [];

    monitor.chartLineData = [];
    monitor.chartLineHeader = [];

    gradientBase.push('#34bbe6'); // blue
    gradient.push(ctx.createLinearGradient(0, 0, 0, 225));
    gradient[gradient.length - 1].addColorStop(0, 'rgba(52, 187, 230, .3)');
    gradient[gradient.length - 1].addColorStop(1, 'rgba(52, 187, 230, .2)');

    gradientBase.push('#eb7532'); // orange
    gradient.push(ctx.createLinearGradient(0, 0, 0, 225));
    gradient[gradient.length - 1].addColorStop(0, 'rgba(235, 117, 50, 1)');
    gradient[gradient.length - 1].addColorStop(1, 'rgba(235, 117, 50, 0)');

    gradientBase.push('#f7d038'); // yellow
    gradient.push(ctx.createLinearGradient(0, 0, 0, 225));
    gradient[gradient.length - 1].addColorStop(0, 'rgba(247, 208, 56, 1)');
    gradient[gradient.length - 1].addColorStop(1, 'rgba(247, 208, 56, 0)');

    var sameAs = catalog.getSameAs(catalog.id);
    var today = new Date(Date(monitor.displayDate));
    var dataObj = data.get();

    var title = 'Datasets';
    dataObj.filter(item => item.id === catalog.id).forEach((row) => {
        title += ' in ' + row.title;
    });

    monitor.chartLineData.push([]);
    monitor.chartLineHeader.push(title);
    if (sameAs.length > 0) {
        sameAs.forEach((id) => {
            title = 'Datasets';
            dataObj.filter(item => item.id === id).forEach((row) => {
                title += ' of ' + row.title + ' in ' + row.packagesInPortal;
            });
        
            monitor.chartLineData.push([]);
            monitor.chartLineHeader.push(title);
        });
    }

    for (d = 0; d < data.loadedDays; ++d) {
        monitor.chartLineRowDates.unshift(today.toISOString().split('T')[0]);
        monitor.chartLineData[0].unshift(monitorGetDatasetCountByDate(catalog.id, today.toISOString().split('T')[0], true));

        if (sameAs.length > 0) {
            var s = 1;
            sameAs.forEach((same) => {
                monitor.chartLineData[s].unshift(monitorGetDatasetCountByDate(same, today.toISOString().split('T')[0], false));
                ++s;
            });
        }

        today.setDate(today.getDate() - 1);
    }

    var datasets = [];
    for (var c = 0; c < monitor.chartLineData.length; ++c) {
        datasets.push({
            label: monitor.chartLineHeader[c],
            fill: c === 0,
            backgroundColor: gradient[c],
            borderColor: gradientBase[c],
            borderWidth: 2,
            pointRadius: 1,
            data: monitor.chartLineData[c]
        });
    }

    var historyData = {
        labels: monitor.chartLineRowDates,
        datasets: datasets,
    };

    if (monitor.chartLine !== null) {
        monitor.chartLine.data = historyData;
        monitor.chartLine.update();
    } else {
        monitor.chartLine = new Chart(document.getElementById('dataset-history'), {
            type: 'line',
            data: historyData,
            options: {
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                legend: {
                    display: false
                },
                tooltips: {
                    intersect: false
                },
                hover: {
                    intersect: true
                },
                plugins: {
                    filler: {
                        propagate: false
                    }
                },
                scales: {
                    xAxes: [{
                        reverse: true,
                        gridLines: {
                            color: 'transparent'
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            stepSize: stepSize
                        },
                        display: true,
                        borderDash: [3, 3],
                        gridLines: {
                            color: 'transparent'
                        }
                    }]
                }
            }
        });
    }
}

function monitorGetAsCSV() {
    var ret = [];
    var len = monitor.chartLineRowDates.length;
    var col = monitor.chartLineHeader.length;

    var header = [];
    header.push('date');
    for (var c = 0; c < col; ++c) {
        header.push(monitor.chartLineHeader[c]);
    }
    ret.push(header);

    for (var l = 0; l < len; ++l) {
        var line = [];
        line.push(monitor.chartLineRowDates[l]);

        for (var c = 0; c < col; ++c) {
            line.push(monitor.chartLineData[c][l]);
        }
        ret.push(line);
    }

    return ret;
}

function monitorGetAsPNG() {
    return monitor.chartPie.toBase64Image();
}

function monitorDownloadAsCSV() {
    let csv = 'data:text/csv;charset=utf-8,' + monitorGetAsCSV().map(e => e.join(',')).join("\n");

    var encoded = encodeURI(csv);
    var link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', 'download.csv');
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

    system.loadData();
});

// ----------------------------------------------------------------------------
