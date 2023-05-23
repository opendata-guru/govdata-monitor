var monitor = {
    maxDays: 30,
    chartLine: null,
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

function monitorUpdateCatalogHistoryChart() {
    var ctx = document.getElementById('dataset-history').getContext('2d');
    var stepSize = 25000;
    var labels = [];
    var dataCollection = [];
    var titles = [];
    var gradient = [];
    var gradientBase = [];

    gradientBase.push('#34bbe6'); // blue
    gradient.push(ctx.createLinearGradient(0, 0, 0, 225));
    gradient[gradient.length - 1].addColorStop(0, 'rgba(52, 187, 230, 1)');
    gradient[gradient.length - 1].addColorStop(1, 'rgba(52, 187, 230, 0)');

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

    dataCollection.push([]);
    titles.push(title);
    if (sameAs.length > 0) {
        sameAs.forEach((id) => {
            title = 'Datasets';
            dataObj.filter(item => item.id === id).forEach((row) => {
                title += ' of ' + row.title + ' in ' + row.packagesInPortal;
            });
        
            dataCollection.push([]);
            titles.push(title);
        });
    }

    for (d = 0; d < monitor.maxDays; ++d) {
        labels.unshift(today.toISOString().split('T')[0]);
        dataCollection[0].unshift(monitorGetDatasetCountByDate(catalog.id, today.toISOString().split('T')[0], true));

        if (sameAs.length > 0) {
            var s = 1;
            sameAs.forEach((same) => {
                dataCollection[s].unshift(monitorGetDatasetCountByDate(same, today.toISOString().split('T')[0], false));
                ++s;
            });
        }

        today.setDate(today.getDate() - 1);
    }

    var datasets = [];
    for (var c = 0; c < dataCollection.length; ++c) {
        datasets.push({
            label: titles[c],
            fill: c === 0,
            backgroundColor: gradient[c],
            borderColor: gradientBase[c],
            data: dataCollection[c]
        });
    }

    var historyData = {
        labels: labels,
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
