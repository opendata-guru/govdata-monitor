var monitor = {
    chartHistory: null,
    chartHistoryDays: 30,
    chartPie: null,
    data: [],
    displayDate: '',
    nextDate: '',
    nextUri: '',
    showFlatPortals: false,
};

function monitorFormatNumber(x) {
    if (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return x;
}

function monitorGetCatalogTableRow(arrayData, id) {
    function getParentPath(data, item) {
        var itemParent = data.filter(dataItem => dataItem.id === item.packagesInId);
        if (itemParent.length > 0) {
            var parent = '';
            if (itemParent[0].packagesInId != catalog.id) {
                parent = getParentPath(data, itemParent[0]);
            }
            return ' &larr; ' + itemParent[0].title + parent;
        }

        return ' &larr; ' + item.packagesInId;
    }

    var showBadge = arrayData.length === 1;
    var str = '';
    var icon = '';
    var title = '';
    var assertion = '';
    var lastCount = undefined;
    var maxDiff = 0;

    arrayData.forEach(processData => {
        var data = processData ? processData.filter(item => item.id === id) : [];
        if (data.length > 0) {
            var currentCount = parseInt(data[0].packages ? data[0].packages : 0, 10);
            var addClass = '';
            title = data[0].title ? data[0].title : title;

            if (data[0].datasetCountDuration) {
                title = '<a href="#" onclick="catalog.set(\'' + id + '\')">' + title + '</a>';
            }
            if (data[0].packagesInId != catalog.id) {
                title += ' <span class="small text-info">' + getParentPath(processData, data[0]) + '</span>';
            }

            if (data[0].type === 'state') {
                icon = '<span class="badge bg-secondary me-1">Land</span>';
            } else if (data[0].type === 'municipality+state') {
                icon = '<span class="badge bg-secondary me-1">Land</span>';
                icon += '<span class="badge bg-secondary me-1">Stadt</span>';
            } else if (data[0].type === 'stateAgency') {
                icon = '<span class="badge bg-secondary me-1">Landesamt</span>';
            } else if (data[0].type === 'municipality') {
                icon = '<span class="badge bg-secondary me-1">Stadt</span>';
            } else if (data[0].type === 'federal') {
                icon = '<span class="badge bg-secondary me-1">Bund</span>';
            } else if (data[0].type === 'collectiveMunicipality') {
                icon = '<span class="badge bg-warning me-1" title="' + data[0].type + '">CM</span>';
            } else if (data[0].type === 'regionalNetwork') {
                icon = '<span class="badge bg-secondary me-1">Region</span>';
            } else if (data[0].type === 'statisticaloffice') {
                icon = '<span class="badge bg-warning me-1" title="' + data[0].type + '">O</span>';
            } else if (data[0].type === 'portal') {
                icon = '<span class="badge bg-warning me-1" title="' + data[0].type + '">P</span>';
            } else if (data[0].type === 'geoPortal') {
                icon = '<span class="badge bg-warning me-1" title="' + data[0].type + '">G</span>';
            } else if (data[0].type === 'dumping') {
                icon = '<span class="badge bg-warning me-1" title="' + data[0].type + '">D</span>';
            }

            if (lastCount) {
                var difference = Math.abs(lastCount - currentCount);
                maxDiff = Math.max(maxDiff, difference);
                if (diff.highlight && (difference >= diff.threshold)) {
                    addClass = ' bg-warning';
                }
            }
            str += '<td class="text-end' + addClass + '">' + monitorFormatNumber(data[0].packages ? data[0].packages : 0) + '</td>';

            if (showBadge) {
                if (data[0].datasetCount) {
                    str += '<td class="text-end"><span class="badge bg-info">' + monitorFormatNumber(data[0].datasetCount) + '</span></td>';
                } else {
                    str += '<td></td>';
                }
            }
            if (data.length > 1) {
                assertion += '<span class="badge bg-danger">' + data.length + '</span>';
            }
            lastCount = currentCount;
        } else {
            str += '<td class="text-end">-</td>';
            if (showBadge) {
                str += '<td></td>';
            }
            lastCount = 0;
        }
    });

    if (diff.hideEqual && (arrayData.length > 1) && (maxDiff < diff.threshold)) {
        return '';
    }

    str = '<td><span title="' + id + '">' + icon + title + assertion + '</span></td>' + str;

    return '<tr>' + str + '</tr>';
}

function monitorGetDatasetCountByDate(dateString) {
    var data = monitor.data[dateString];
    var count = undefined;

    if (data) {
        data.forEach((row) => {
            if (row.id === catalog.id) {
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

    var today = new Date(Date(monitor.displayDate));
    for (d = 0; d < monitor.chartHistoryDays; ++d) {
        labels.unshift(today.toISOString().split('T')[0]);
        data.unshift(monitorGetDatasetCountByDate(today.toISOString().split('T')[0]));

        today.setDate(today.getDate() - 1);
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
            if (row.packagesInId === catalog.id) {
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
    function isParent(packageId, theDate) {
        if (packageId === catalog.id) {
            return true;
        }
        if (monitor.showFlatPortals) {
            var found = false;
            monitor.data[theDate].filter(item => item.id === packageId).forEach((row) => {
                if (row.packagesInId) {
                    found |= isParent(row.packagesInId, theDate);
                }
            });
            return found;
        }

        return false;
    }

    var arrayData = [];
    var arrayIds = [];
    var header = '';
    var footer = '';
    var table = '';

    header += '<th>Data Supplier</th>';
    for (d = 0; d < date.selection.length; ++d) {
        arrayData.push(monitor.data[date.selection[d]]);
        header += '<th>' + date.selection[d] + '</th>';

        if (arrayData[arrayData.length - 1]) {
            arrayData[arrayData.length - 1].forEach((row) => {
                if (isParent(row.packagesInId ? row.packagesInId : '', date.selection[d])) {
                    if (arrayIds.indexOf(row.id) < 0) {
                        arrayIds.push(row.id);
                    }
                }
            });
        }
    }
    if (arrayData.length === 1) {
        header += '<th>In source portal</th>';
    }

    if (arrayIds.length > 0) {
        arrayIds.forEach((id) => table += monitorGetCatalogTableRow(arrayData, id));
        footer += '<th>' + arrayIds.length + ' data suppliers</th>';
    } else {
        table += '<tr><td>No data available</td></tr>';
        footer += '<th></th>';
    }

    header = '<tr>' + header + '</tr>';
    footer = '<tr>' + footer + '</tr>';

    document.getElementById('supplier-table-header').innerHTML = header;
    document.getElementById('supplier-table-footer').innerHTML = footer;
    document.getElementById('supplier-table').innerHTML = table;

    monitorUpdateCatalogPieChart();
    monitorUpdateCatalogHistoryChart();
}

function monitorSetDate(displayDate) {
    monitor.displayDate = displayDate;

    var text = '';
    text += '<span class="text-muted">Show date</span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + monitor.displayDate + ' </span>';

    document.getElementById('display-date').innerHTML = text;

    date.update();
    monitorUpdateCatalogTable();
}

function monitorSetNextDate(nextDate) {
    var dateString = nextDate.toISOString().split('T')[0];
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
        if (item.id === catalog.id) {
            console.log(item);
        }
    }); */

    monitor.data[monitor.nextDate] = data;

    if (Object.keys(monitor.data).length === 1) {
        monitorSetDate(monitor.nextDate);
        catalog.set('govdata.de'); // <-  this is a hack
    }

    var nextDate = new Date(monitor.nextDate);
    nextDate.setDate(nextDate.getDate() - 1);

    monitorSetNextDate(nextDate); 

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
            date.update();
            monitorUpdateCatalogHistoryChart();
        }
    }

    xhr.send();
}

function onShowFlatPortals() {
    var cb = document.getElementById('checkbox-show-flat-portals');
    monitor.showFlatPortals = cb.checked;

    monitorUpdateCatalogTable();
}

// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    monitorSetNextDate(new Date(Date.now()));
    catalog.set('govdata.de');

    monitorShowNextDate();
    monitorLoadNextDate();
});
