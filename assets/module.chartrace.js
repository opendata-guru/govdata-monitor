var chartrace = (function () {
    var chartLine = null,
        columnTitles = [],
        rowTitles = [],
        chartData = [];
        fileName = '';
    var showTop = false,
        showFirst = 1,
        showLast = 8;
    var idRaceChart = 'dataset-race';

    function init() {
    }

    function getColorSwatch() {
        var swatch = [];

//        swatch.push('#34bbe6'); // blue
        swatch.push('#e63462'); // red (Split Complementary)
        swatch.push('#e6b834'); // yellow (Split Complementary + Double Complementary Color)
        swatch.push('#e634bb'); // pink (Triadic Color)
        swatch.push('#3462e6'); // dark blue (Double Complementary Color)
        swatch.push('#34bbe6'); // green (Tetrad/Square Color)
        swatch.push('#e65f34'); // orange (Complimentary + Double Complementary Color + Tetrad/Square Color)
        swatch.push('#bbe634'); // yellow green (Triadic Color)
        swatch.push('#b834e6'); // purple (Tetrad/Square Color)

        return swatch;
    }

    function getDatasets() {
        var datasets = [];
        var colors = getColorSwatch();

        for (var c = 0; c < chartData.length; ++c) {
            datasets.push({
                label: columnTitles[c],
                fill: false,
                borderColor: colors[c],
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
            startDate = today.toISOString().split('T')[0];
            rowTitles.unshift(startDate);

            if (data.view.length > 0) {
                var s = 0;
                var values = [];
                data.view.forEach((view) => {
                    var val = monitorGetDatasetCountByDate(view.linkId, startDate, false);
                    chartData[s].unshift(val);
                    values.push(val);
                    ++s;
                });

                if (showTop) {
                    var topValues = values.sort(function (a,b) {
                        return b - a;
                    }).slice(showFirst - 1, showFirst + showLast - 1); 

                    chartData.forEach(elem => {
                        if (-1 === topValues.indexOf(elem[0])) {
                            elem[0] = undefined;
                        }
                    });
                }
            }

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