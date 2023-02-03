var monitor = {
    chartHistory: null,
    chartHistoryDays: 30,
    chartPie: null,
    data: [],
    datepicker: null,
    datepickerSelection: [],
    displayCatalogId: '',
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
    function getParentTitle(data, item) {
        var itemParent = data.filter(dataItem => dataItem.id === item.packagesInId);
        if (itemParent.length > 0) {
            return itemParent[0].title;
        }

        return item.packagesInId;
    }

    var showBadge = arrayData.length === 1;
    var str = '';
    var title = '';
    var assertion = '';
    var lastCount = undefined;

    arrayData.forEach(processData => {
        var data = processData.filter(item => item.id === id);
        if (data.length > 0) {
            var currentCount = parseInt(data[0].packages ? data[0].packages : 0, 10);
            var addClass = '';
            title = data[0].title ? data[0].title : title;

            if (data[0].datasetCountDuration) {
                title = '<a href="#" onclick="monitorSetCatalog(\'' + id + '\')">' + title + '</a>';
            }
            if (data[0].packagesInId != monitor.displayCatalogId) {
                title += ' <span class="small text-info"> &larr; ' + getParentTitle(processData, data[0]) + '</span>';
            }

            if (((lastCount + 99) < currentCount) || (currentCount < (lastCount - 99))) {
                addClass = ' bg-warning';
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

    str = '<td><span title="' + id + '">' + title + assertion + '</span></td>' + str;

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
    function isParent(packageId, date) {
        if (packageId === monitor.displayCatalogId) {
            return true;
        }
        if (monitor.showFlatPortals) {
            var found = false;
            monitor.data[date].filter(item => item.id === packageId).forEach((row) => {
                if (row.packagesInId) {
                    found |= isParent(row.packagesInId, date);
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
    for (d = 0; d < monitor.datepickerSelection.length; ++d) {
        arrayData.push(monitor.data[monitor.datepickerSelection[d]]);
        header += '<th>' + monitor.datepickerSelection[d] + '</th>';

        arrayData[arrayData.length - 1].forEach((row) => {
            if (isParent(row.packagesInId ? row.packagesInId : '', monitor.datepickerSelection[d])) {
                if (arrayIds.indexOf(row.id) < 0) {
                    arrayIds.push(row.id);
                }
            }
        });
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

function monitorSetDate(date) {
    monitor.displayDate = date;

    var text = '';
    text += '<span class="text-muted">Show date</span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + monitor.displayDate + ' </span>';

    document.getElementById('display-date').innerHTML = text;

    monitorUpdateCalendar();
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

    monitorUpdateCalendar();
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
            monitorUpdateCalendar();
            monitorUpdateCatalogHistoryChart();
        }
    }

    xhr.send();
}

function initCalendar() {
    var maxDate = new Date(Date.now());

    monitor.datepicker = document.getElementById('table-datepicker').flatpickr({
        conjunction: '|',
        defaultDate: [],
        dateFormat: "Y-m-d",
        inline: true,
        maxDate: maxDate,
        mode: 'multiple',
        nextArrow: '<span title="Next month">&raquo;</span>',
        prevArrow: '<span title="Previous month">&laquo;</span>',

        enable: [function(date){
            var dateString = date.toISOString().split('T')[0];
            return monitor.data[dateString] !== undefined;
        }],
    });
    monitor.datepicker.config.onChange.push(function(selectedDates, dateStr, instance) {
        var dateArray = dateStr.split('|');
        dateArray.sort();
        monitor.datepickerSelection = dateStr.length === 0 ? [] : dateArray;

        monitorUpdateCatalogTable();
    });
}

function onShowFlatPortals() {
    var cb = document.getElementById('checkbox-show-flat-portals');
    monitor.showFlatPortals = cb.checked;

    monitorUpdateCatalogTable();
}

function monitorUpdateCalendar() {
    if (monitor.datepicker === null) {
        return;
    }

    monitor.datepicker.setDate(monitor.displayDate, true);
}

document.addEventListener('DOMContentLoaded', function() {
    monitorSetNextDate(new Date(Date.now()));
    monitorSetCatalog('govdata.de');

    monitorShowNextDate();
    monitorLoadNextDate();

    initCalendar();
});
