var chartrace = (function () {
    var chartLine = null,
        columnTitles = [],
        rowTitles = [],
        chartData = [];
        fileName = '';
    var idRaceChart = 'dataset-race';

    function init() {
    }

    function getDatasets() {
        var datasets = [];

        for (var c = 0; c < chartData.length; ++c) {
            datasets.push({
                label: columnTitles[c],
                borderWidth: 2,
                pointRadius: 1,
                data: chartData[c]
            });
        }

        return datasets;
    }

    function clearData() {
        columnTitles = [];
        rowTitles = [];
        chartData = [];
        fileName = '';
    }

    function fillData() {
        var dataObj = data.get();
        dataObj.filter(item => item.id === catalog.id).forEach((row) => {
            fileName = row.title;
        });

        if (data.view) {
            data.view.forEach((view) => {
                chartData.push([]);
                columnTitles.push(view.title);
            });
        }

        var today = new Date(Date(data.getDisplayDate()));
        var endDate = today.toISOString().split('T')[0];
        var startDate = endDate;
        for (d = 0; d < data.loadedDays; ++d) {
            rowTitles.unshift(today.toISOString().split('T')[0]);

            if (data.view.length > 0) {
                var s = 0;
                data.view.forEach((view) => {
                    chartData[s].unshift(monitorGetDatasetCountByDate(view.linkId, today.toISOString().split('T')[0], false));
                    ++s;
                });
            }

            startDate = today.toISOString().split('T')[0];
            today.setDate(today.getDate() - 1);
        }

        fileName = startDate + '_' + endDate + '_' + fileName;
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

    function funcUpdate() {
        updateChart();
    }

    function updateChart() {
        clearData();
        fillData();

        var raceData = {
            labels: rowTitles,
            datasets: getDatasets(),
        };

        if (chartLine !== null) {
            chartLine.data = raceData;
            chartLine.update();
        } else {
            chartLine = new Chart(document.getElementById(idRaceChart), {
                type: 'line',
                data: raceData,
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

    init();

    return {
        getColumnTitles: funcGetColumnTitles,
        getRowTitles: funcGetRowTitles,
        getData: funcGetData,
        getFileName: funcGetFileName,
        update: funcUpdate,
    };
}());