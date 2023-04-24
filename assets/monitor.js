var monitor = {
    chartHistory: null,
    chartHistoryDays: 30,
    chartPie: null,
    data: [],
    displayDate: '',
    nextDate: '',
    nextUri: '',
};

function monitorFormatNumber(x) {
    if (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return x;
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

function monitorSetDate(displayDate) {
    monitor.displayDate = displayDate;

    date.update();
    table.update();
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
        catalog.set(catalog.id); // <-  this is a hack
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

    var startDate = new Date(Date.now());
    var nextDate = new Date(monitor.nextDate);
    var diffs = startDate.getTime() - nextDate.getTime();
    var days = Math. ceil(diffs / (1000 * 3600 * 24));

    if (days <= monitor.chartHistoryDays) {
        xhr.send();
    } else {
        monitorShowNextDateDone();
        date.update();
        monitorUpdateCatalogHistoryChart();
    }
}

// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    monitorSetNextDate(new Date(Date.now()));

    monitorShowNextDate();
    monitorLoadNextDate();
});
