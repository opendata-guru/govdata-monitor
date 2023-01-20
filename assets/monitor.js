var monitor = {
    chartHistory: null,
    chartHistoryDays: 14,
    chartPie: null,
    data: [],
    displayCatalogId: '',
    displayDate: '',
    nextDate: '',
    nextUri: '',
};

function monitorGetCatalogTableRow(data) {
    function formatNumber(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    var str = '';
//    var name = data.name ? data.name : '';
    var id = data.id ? data.id : '';
    var packageId = data.packagesInId ? data.packagesInId : '';
    var link = data.datasetCount ? ' <button class="btn btn-secondary btn-sm ms-2" onclick="monitorSetCatalog(\'' + id + '\')">Look into</button>' : '';

    if (packageId !== monitor.displayCatalogId) {
        return '';
    }

//    str += '<td>' + (data.type ? data.type : '') + '</td>';
    str += '<td><span title="' + id + '">' + (data.title ? data.title : '') + link + '</span></td>';
//    str += '<td>' + (data.link ? data.link : '') + '</td>';

    str += '<td class="text-end">' + formatNumber(data.packages ? data.packages : 0) + '</td>';
//    str += '<td><span title="' + packageId + '">' + (data.packagesInPortal ? data.packagesInPortal : '') + '</span></td>';
    str += '<td class="text-end"><span class="badge bg-info">' + formatNumber(data.datasetCount ? data.datasetCount : '') + '</span></td>';

    return '<tr>' + str + '</tr>';
}

function monitorGetDatasetCountByDate(dateString) {
    var data = monitor.data[dateString];
    var count = 0;

    if (data) {
        data.forEach((row) => {
            if (row.id === monitor.displayCatalogId) {
                count = row.datasetCount;
            }
        });
    }

    return count;
}

function monitorUpdateCatalogLineChart() {
    var ctx = document.getElementById('dataset-history').getContext('2d');
    var stepSize = 25000;
    var labels = [];
    var data = [];
    var gradient = ctx.createLinearGradient(0, 0, 0, 225);
    gradient.addColorStop(0, 'rgba(215, 227, 244, 1)');
    gradient.addColorStop(1, 'rgba(215, 227, 244, 0)');

    var date = new Date(Date(monitor.displayDate));
    for (d = 0; d < monitor.chartHistoryDays; ++d) {
        labels.unshift(date.toISOString().split('T')[0]);
        data.unshift(monitorGetDatasetCountByDate(date.toISOString().split('T')[0]));

        date.setDate(date.getDate() - 1);
    }

    var historyData = {
        labels: labels,
        datasets: [{
            label: 'Datasets',
            fill: true,
            backgroundColor: gradient,
            borderColor: window.theme.primary,
            data: data
        }]
    };

    if (monitor.chartHistory !== null) {
        monitor.chartHistory.data = historyData;
        monitor.chartHistory.update();
    } else {
        monitor.chartHistory = new Chart(document.getElementById('dataset-history'), {
            type: 'line',
            data: historyData,
            options: {
                maintainAspectRatio: false,
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

function monitorUpdateCatalogPieChart() {
    var data = monitor.data[monitor.displayDate];
    var labels = [];
    var counts = [];
    var slices = 8;

    if (data) {
        data.forEach((row) => {
            if (row.packagesInId === monitor.displayCatalogId) {
                if (labels.length < slices) {
                    labels.push(row.title);
                    counts.push(row.packages);
                } else if (labels.length === slices) {
                    labels.push('other');
                    counts.push(row.packages);
                } else {
                    counts[slices] += row.packages;
                }
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

function monitorUpdateCatalogTable() {
    var data = monitor.data[monitor.displayDate];
    var table = '';

    if (data) {
        data.forEach((row) => table += monitorGetCatalogTableRow(row));
    } else {
        table += '<tr><td>No data available</td></tr>';
    }

    document.getElementById('supplier-table').innerHTML = table;

    monitorUpdateCatalogPieChart();
    monitorUpdateCatalogLineChart();
}

function monitorSetDate(date) {
    monitor.displayDate = date;

    var text = '';
    text += '<span class="text-muted">Show date</span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + monitor.displayDate + ' </span>';

    document.getElementById('display-date').innerHTML = text;

    monitorUpdateCatalogTable();
}

function monitorSetCatalog(catalogId) {
    monitor.displayCatalogId = catalogId;

    window.scrollTo(0, 0);

    var data = monitor.data[monitor.displayDate];
    var text = '';
    var strCatalog = monitor.displayCatalogId;
    var strParent = '';
    var strParentId = '';
    var strDatasetCount = '';

    if (data) {
        data.forEach((row) => {
            if (row.id === monitor.displayCatalogId) {
                strCatalog = row.title;
                strParent = row.packagesInPortal;
                strParentId = row.packagesInId;
                strDatasetCount = row.datasetCount;
            }
        });
    }

    text += '<span class="text-muted">Show catalog</span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + strCatalog + ' <span class="ms-2 badge bg-danger">' + strDatasetCount + ' datasets</span></span>';

    if (strParentId !== '') {
        text += '<br>';
        text += '<span class="text-muted">Parent catalog:</span>';
        text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + strParent + ' </span>';
        text += '<button class="btn btn-secondary btn-sm ms-2" onclick="monitorSetCatalog(\'' + strParentId + '\')">Look into</button>';
    }

    document.getElementById('display-catalog').innerHTML = text;

    monitorUpdateCatalogTable();
}

function monitorSetNextDate(date) {
    var dateString = date.toISOString().split('T')[0];
    var uri = 'https://opendata.guru/govdata/assets/data-' + dateString.split('-')[0] + '/' + dateString + '-organizations.json';

    monitor.nextDate = dateString;
    monitor.nextUri = uri;
}

function monitorShowNextDate() {
    var text = '';
    text += '<span class="text-muted">Load data from</span>';
    text += '<span class="text-warning"> <i class="mdi mdi-arrow-bottom-right"></i> ' + monitor.nextDate + ' </span>';

    document.getElementById('loading-description').innerHTML = text;
    document.getElementById('loading-icon-progress').style.display = 'block';
    document.getElementById('loading-icon-done').style.display = 'none';
}

function monitorShowNextDateDone() {
    var text = '';
    text += '<span class="text-muted">Loading data </span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> done </span>';

    document.getElementById('loading-description').innerHTML = text;
    document.getElementById('loading-icon-progress').style.display = 'none';
    document.getElementById('loading-icon-done').style.display = 'block';
}

function monitorProcessNextData(data) {
/*    data.forEach(item => {
        if (item.id === monitor.displayCatalogId) {
            console.log(item);
        }
    }); */

    monitor.data[monitor.nextDate] = data;

    if (Object.keys(monitor.data).length === 1) {
        monitorSetDate(monitor.nextDate);
        monitorSetCatalog('govdata.de'); // <-  this is a hack
    }
    if (Object.keys(monitor.data).length < monitor.chartHistoryDays) {
        var date = new Date(monitor.nextDate);
        date.setDate(date.getDate() - 1);

        monitorSetNextDate(date); 

        monitorShowNextDate();
        monitorLoadNextDate();
    } else {
        monitorShowNextDateDone();
        monitorUpdateCatalogLineChart();
    }
}

function monitorLoadNextDate() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', monitor.nextUri, true);

    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            monitorProcessNextData(JSON.parse(this.responseText));
        }
    }

    xhr.send();
}

document.addEventListener('DOMContentLoaded', function() {
    monitorSetNextDate(new Date(Date.now()));
    monitorSetCatalog('govdata.de');

    monitorShowNextDate();
    monitorLoadNextDate();
});
