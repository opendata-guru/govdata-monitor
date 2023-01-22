var monitor = {
    chartHistory: null,
    chartHistoryDays: 30,
    chartPie: null,
    data: [],
    displayCatalogId: '',
    displayDate: '',
    nextDate: '',
    nextUri: '',
};

function monitorFormatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function monitorGetCatalogTableRow(data) {

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

    str += '<td class="text-end">' + monitorFormatNumber(data.packages ? data.packages : 0) + '</td>';
//    str += '<td><span title="' + packageId + '">' + (data.packagesInPortal ? data.packagesInPortal : '') + '</span></td>';
    str += '<td class="text-end"><span class="badge bg-info">' + monitorFormatNumber(data.datasetCount ? data.datasetCount : '') + '</span></td>';

    return '<tr>' + str + '</tr>';
}

function monitorGetDatasetCountByDate(dateString) {
    var data = monitor.data[dateString];
    var count = undefined;

    if (data) {
        data.forEach((row) => {
            if (row.id === monitor.displayCatalogId) {
                count = row.datasetCount;
            }
        });
    }

    return count;
}

function monitorUpdateCatalogHistoryChart() {
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
    monitorUpdateCatalogHistoryChart();
}

function monitorSetDate(date) {
    monitor.displayDate = date;

    var text = '';
    text += '<span class="text-muted">Show date</span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + monitor.displayDate + ' </span>';

    document.getElementById('display-date').innerHTML = text;

    monitorUpdateCatalogTable();
}

function monitorGetCatalogById(id) {
    var data = monitor.data[monitor.displayDate];
    var obj = undefined; 

    if (data && id) {
        data.forEach((row) => {
            if (row.id === id) {
                obj = row;
            }
        });
    }

    return obj;
}

function monitorSetCatalog(catalogId) {
    monitor.displayCatalogId = catalogId;

    window.scrollTo(0, 0);

    var text = '';
    var catalog = monitorGetCatalogById(monitor.displayCatalogId);
    var strCatalog = monitor.displayCatalogId;
    var strDatasetCount = '';

    if (catalog) {
        strCatalog = catalog.title;
        strDatasetCount = catalog.datasetCount;
    }

    text += strCatalog + ' have ' + '<strong>' + monitorFormatNumber(strDatasetCount) + '</strong> datasets';
    document.getElementById('display-catalog').innerHTML = text;

    text = strCatalog + ' History';
    document.getElementById('history-title').innerHTML = text;

    function getBreadcrumb(id) {
        var breadcrumb = '';
        var catalog = monitorGetCatalogById(id);

        if (catalog) {
            breadcrumb += getBreadcrumb(catalog.packagesInId);
            if (id === monitor.displayCatalogId) {
                breadcrumb += ' &gt; ' + catalog.title;
            } else {
                breadcrumb += ' &gt; <a class="text-primary" onclick="monitorSetCatalog(\'' + id + '\')">' + catalog.title + '</a>';
            }
        }

        return breadcrumb;
    }

    document.getElementById('breadcrumb').innerHTML = getBreadcrumb(monitor.displayCatalogId);

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
    text += '<span class="text-secondary">Loading data ... </span>';
    text += '<span class="text-info"> <i class="mdi mdi-arrow-bottom-right"></i> ' + monitor.nextDate + ' </span>';

    document.getElementById('loading-description').innerHTML = text;

    document.getElementsByClassName('card-breadcrumb-and-catalog-title')[0].style.display = 'none';
    document.getElementsByClassName('card-loading')[0].style.display = 'block';
}

function monitorShowNextDateDone() {
    document.getElementsByClassName('card-loading')[0].style.display = 'none';
    document.getElementsByClassName('card-breadcrumb-and-catalog-title')[0].style.display = 'block';
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

    var date = new Date(monitor.nextDate);
    date.setDate(date.getDate() - 1);

    monitorSetNextDate(date); 

    monitorShowNextDate();
    monitorLoadNextDate();
}

function monitorLoadNextDate() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', monitor.nextUri, true);

    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            monitorProcessNextData(JSON.parse(this.responseText));
        } else if (this.readyState == 4) {
            monitorShowNextDateDone();
            monitorUpdateCatalogHistoryChart();
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
