var monitor = {
    maxDays: 30,
    chartHistory: null,
    chartPie: null,
    displayDate: '',
};

function monitorFormatNumber(x) {
    if (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return x;
}

function monitorGetDatasetCountByDate(dateString) {
    var dataObj = data.getDate(dateString);
    var count = undefined;

    if (dataObj) {
        dataObj.forEach((row) => {
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
    var dataObj = [];
    var gradient = ctx.createLinearGradient(0, 0, 0, 225);
    gradient.addColorStop(0, 'rgba(215, 227, 244, 1)');
    gradient.addColorStop(1, 'rgba(215, 227, 244, 0)');

    var today = new Date(Date(monitor.displayDate));
    for (d = 0; d < monitor.maxDays; ++d) {
        labels.unshift(today.toISOString().split('T')[0]);
        dataObj.unshift(monitorGetDatasetCountByDate(today.toISOString().split('T')[0]));

        today.setDate(today.getDate() - 1);
    }

    var historyData = {
        labels: labels,
        datasets: [{
            label: 'Datasets',
            fill: true,
            backgroundColor: gradient,
            borderColor: window.theme.primary,
            data: dataObj
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
    var dataObj = data.get();
    var labels = [];
    var counts = [];
    var slices = 8;

    if (dataObj) {
        dataObj.forEach((row) => {
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

// ----------------------------------------------------------------------------
