var charthistory = (function () {
//    var stepSize = 25000;
    var chartLine = null,
        columnTitles = [],
        rowTitles = [],
        chartData = [];
        fileName = '';
    var idHistoryChart = 'dataset-history';

    function init() {
    }

    function getGradient() {
        var ctx = document.getElementById(idHistoryChart).getContext('2d');
        var gradient = [];

        gradient.push(ctx.createLinearGradient(0, 0, 0, 225));
        gradient[gradient.length - 1].addColorStop(0, 'rgba(52, 187, 230, .3)');
        gradient[gradient.length - 1].addColorStop(1, 'rgba(52, 187, 230, .2)');

        gradient.push(ctx.createLinearGradient(0, 0, 0, 225));
        gradient[gradient.length - 1].addColorStop(0, 'rgba(235, 117, 50, 1)');
        gradient[gradient.length - 1].addColorStop(1, 'rgba(235, 117, 50, 0)');

        gradient.push(ctx.createLinearGradient(0, 0, 0, 225));
        gradient[gradient.length - 1].addColorStop(0, 'rgba(247, 208, 56, 1)');
        gradient[gradient.length - 1].addColorStop(1, 'rgba(247, 208, 56, 0)');

        return gradient;
    }

    function getGradientBase() {
        var gradientBase = [];

        gradientBase.push('#34bbe6'); // blue
        gradientBase.push('#eb7532'); // orange
        gradientBase.push('#f7d038'); // yellow

        return gradientBase;
    }

    function funcGetColumnTitles() {
        return columnTitles;
    }

    function funcGetFileName() {
        return fileName;
    }

    function funcGetRowTitles() {
        return rowTitles;
    }

    function funcGetData() {
        return chartData;
    }

    function clearData() {
        columnTitles = [];
        rowTitles = [];
        chartData = [];
        fileName = '';
    }

    function fillData() {
        var dataObj = data.get();

        var title = 'Datasets';
        dataObj.filter(item => item.id === catalog.id).forEach((row) => {
            fileName = row.title;
            title += ' in ' + row.title;
        });
        chartData.push([]);
        columnTitles.push(title);

        var sameAs = catalog.getSameAs(catalog.id);
        if (sameAs.length > 0) {
            sameAs.forEach((id) => {
                title = 'Datasets';
                dataObj.filter(item => item.id === id).forEach((row) => {
                    title += ' of ' + row.title + ' in ' + row.packagesInPortal;
                });

                chartData.push([]);
                columnTitles.push(title);
            });
        }

        var today = new Date(Date(data.getDisplayDate()));
        var endDate = today.toISOString().split('T')[0];
        var startDate = endDate;
        for (d = 0; d < data.loadedDays; ++d) {
            rowTitles.unshift(today.toISOString().split('T')[0]);
            chartData[0].unshift(monitorGetDatasetCountByDate(catalog.id, today.toISOString().split('T')[0], true));

            if (sameAs.length > 0) {
                var s = 1;
                sameAs.forEach((same) => {
                    chartData[s].unshift(monitorGetDatasetCountByDate(same, today.toISOString().split('T')[0], false));
                    ++s;
                });
            }

            startDate = today.toISOString().split('T')[0];
            today.setDate(today.getDate() - 1);
        }

        fileName = startDate + '_' + endDate + '_' + fileName;
    }

    function getDatasets() {
        var gradientBase = getGradientBase();
        var gradient = getGradient();
        var datasets = [];

        for (var c = 0; c < chartData.length; ++c) {
            datasets.push({
                label: columnTitles[c],
                fill: c === 0,
                backgroundColor: gradient[c],
                borderColor: gradientBase[c],
                borderWidth: 2,
                pointRadius: 1,
                data: chartData[c]
            });
        }

        return datasets;
    }

    function updateChart() {
        clearData();
        fillData();

        var historyData = {
            labels: rowTitles,
            datasets: getDatasets(),
        };

        if (chartLine !== null) {
            chartLine.data = historyData;
            chartLine.update();
        } else {
            chartLine = new Chart(document.getElementById(idHistoryChart), {
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
/*                            ticks: {
                                stepSize: stepSize
                            },*/
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

    function funcUpdate() {
        updateChart();

        chartrace.update();
    }

    init();

    return {
        getColumnTitles: funcGetColumnTitles,
        getRowTitles: funcGetRowTitles,
        getData: funcGetData,
        getFileName: funcGetFileName,
        update: funcUpdate,
    };
}());