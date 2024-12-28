function chartGetColorSwatch() {
    var swatch = [];

//    swatch.push('#34bbe6'); // blue
    swatch.push('#e63462'); // red (Split Complementary)
    swatch.push('#e6b834'); // yellow (Split Complementary + Double Complementary Color)
    swatch.push('#e634bb'); // pink (Triadic Color)
    swatch.push('#3462e6'); // dark blue (Double Complementary Color)
    swatch.push('#34bbe6'); // green (Tetrad/Square Color)
    swatch.push('#e65f34'); // orange (Complimentary + Double Complementary Color + Tetrad/Square Color)
    swatch.push('#bbe634'); // yellow green (Triadic Color)
    swatch.push('#b834e6'); // purple (Tetrad/Square Color)

    // repeat (to have 15+ colors)
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

function chartGetOptions() {
    return {
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
/*                ticks: {
                    stepSize: stepSize
                },*/
                display: true,
                borderDash: [3, 3],
                gridLines: {
                    color: 'transparent'
                }
            }]
        }
    };
}

var chartLObjects = (function () {
    var columnTitles = [],
        rowTitles = [],
        rowTitlesTranslated = [],
        chartData = [],
        fileNames = [];

    function init() {
    }

    function sortChartData(id) {
        return function(a, b) {
            if (a.data[id] === b.data[id]) {
                return a.label.localeCompare(b.label);
            }

            return a.data[id] < b.data[id] ? 1 : -1;
        }
    }

    function getDatasets(dates, options) {
        var datasets = [];
        var colors = chartGetColorSwatch();
        var pid = options.pObject.pid;

        columnTitles[pid] = [];
        chartData[pid] = [];

        for (var c = 0; c < options.pObject.lObjects.length; ++c) {
            var labels = tableLObjects.getLObjectTitle(options.pObject.lObjects[c]);
            var lid = options.pObject.lObjects[c].lid;
            var data = [];

            for (var d = 0; d < dates.length; ++d) {
                var date = dates[d];
                var count = options.lObjectsCount[date];

                if (count) {
                    data.push(count[options.pObject.lObjects[c].lid]);
                } else {
                    data.push(null);
                }
            }

            columnTitles[pid].push(labels);
            chartData[pid].push(data);

            datasets.push({
                label: columnTitles[pid][c],
                lid: lid,
                fill: false,
                borderColor: colors[c],
                borderWidth: 2,
                pointRadius: 1,
                data: data,
            });
        }

        var topLIDs = [];

        for (var c = 0; c < options.pObject.lObjects.length; ++c) {
            datasets.sort(sortChartData(c));

            for (var t = 0; t < Math.min(options.topCount, datasets.length); ++t) {
                if (datasets[t].data[c]) {
                    topLIDs.push(datasets[t].lid);
                }
            }
        }

        topLIDs = [...new Set(topLIDs)];
        datasets = datasets.filter((dataset) => topLIDs.includes(dataset.lid));

        for (var d = 0; d < datasets.length; ++d) {
            datasets[d].borderColor = colors[d];
        }

        return datasets;
    }

    function buildCanvas(options) {
        var str = '';

        if (options.pObject.lObjects && (options.pObject.lObjects.length > 0)) {
            if (Object.keys(options.lObjectsCount).length === 0) {
                return;
            }

            str += '<div>';
            str += options.dict[nav.lang].suppliersHistory.replace('{days}', options.days);
            str += catalog.getDownloadMenu('chartLObjects|' + options.pObject.pid);
            str += '</div>';
            str += '<canvas class="my-3" style="max-height:16rem"></canvas>';
        }

        var elem = document.getElementById('portal-chart-' + options.pObject.pid);
        elem.innerHTML = str;
    }

    function buildData(options) {
        var elem = document.querySelector('#portal-chart-' + options.pObject.pid + ' > canvas');
        if (!elem) {
            return;
        }

        var pid = options.pObject.pid;
        var current = new Date(Date.now());
        var dateString;
        var dateStringDE;

        rowTitles[pid] = [];
        rowTitlesTranslated[pid] = [];

        for (var d = 0; d < options.days; ++d) {
            dateString = current.toLocaleString('sv-SE').split(' ')[0];
            dateStringDE = current.toLocaleString('de-DE').split(',')[0];
            rowTitles[pid].unshift(dateString);
            rowTitlesTranslated[pid].unshift(nav.lang === 'de' ? dateStringDE : dateString);

            current.setDate(current.getDate() - 1);
        }

        var supplierData = {
            labels: rowTitlesTranslated[pid],
            datasets: getDatasets(rowTitles[pid], options),
        };

        var chartLine = new Chart(elem, {
            type: 'line',
            data: supplierData,
            options: chartGetOptions(),
        });
    }

    function funcBuild(options) {
        if (!options.pObject) {
            console.error('pObject not exists');
            return;
        }

        var current = new Date(Date.now());
        var endDate = current.toLocaleString('sv-SE').split(' ')[0];
        current.setDate(current.getDate() - options.days + 1);
        var startDate = current.toLocaleString('sv-SE').split(' ')[0];

        var pid = options.pObject.pid;
        var sObject = catalog.getSObject();
        var title = sObject ? sObject.title[nav.lang] : options.dict[nav.lang].unknownSupplier;
        var fileName = startDate + '_' + endDate + '_' + title + '_' + pid;

        fileNames[pid] = fileName;

        options.topCount = 15;

        buildCanvas(options);
        buildData(options);
    }

    function funcGetColumnTitles(pID) {
        return columnTitles[pID];
    }

    function funcGetFileName(pID) {
        return fileNames[pID];
    }

    function funcGetRowTitles(pID) {
        return rowTitles[pID];
    }

    function funcGetData(pID) {
        return chartData[pID];
    }

    init();

    return {
        build: funcBuild,
        getColumnTitles: funcGetColumnTitles,
        getRowTitles: funcGetRowTitles,
        getData: funcGetData,
        getFileName: funcGetFileName,
    };
}());

var chartsupplier = (function () {
    var chartLine1 = null,
        chartLine2 = null,
        chartLine3 = null,
        columnTitles = [],
        rowTitles = [],
        chartData1 = [];
        chartData2 = [];
        chartData3 = [];
        fileName = '';
    var showTop = false,
        showFirst = 1,
        showLast = 8;
    var idSupplierChart1 = 'dataset-supplier',
        idSupplierChart2 = 'dataset-supplier-2',
        idSupplierChart3 = 'dataset-supplier-3';

    function init() {
        // https://www.youtube.com/watch?v=MSbGvq7prB0
    }

    function getDatasets1() {
        var datasets = [];
        var colors = chartGetColorSwatch();

        for (var c = 0; c < chartData1.length; ++c) {
            datasets.push({
                label: columnTitles[c],
                fill: false,
                borderColor: colors[c],
                borderWidth: 2,
                pointRadius: 1,
                data: chartData1[c]
            });
        }

        return datasets;
    }

    function getDatasets2() {
        var datasets = [];
        var colors = chartGetColorSwatch();

        for (var c = 0; c < chartData2.length; ++c) {
            datasets.push({
                label: columnTitles[c],
                fill: false,
                borderColor: colors[c],
                borderWidth: 2,
                pointRadius: 1,
                data: chartData2[c]
            });
        }

        return datasets;
    }

    function getDatasets3() {
        var datasets = [];
        var colors = chartGetColorSwatch();

        for (var c = 0; c < chartData3.length; ++c) {
            datasets.push({
                label: columnTitles[c],
                fill: false,
                borderColor: colors[c],
                borderWidth: 2,
                pointRadius: 1,
                data: chartData3[c]
            });
        }

        return datasets;
    }

    function clearData() {
        columnTitles = [];
        rowTitles = [];
        chartData1 = [];
        chartData2 = [];
        chartData3 = [];
        fileName = '';
    }

    function fillData() {
        var dataObj = data.get();
        if (dataObj) {
            if (data.isHVD) {
                dataObj.filter((item) => 0 < item.datasets).forEach((row) => {
                    fileName = data.getPortalTitle(row.catalogURI.split('/').slice(-1)[0]);
                });
            } else {
                dataObj.filter(item => item.id === catalog.id).forEach((row) => {
                    fileName = data.getPortalTitle(row.title);
                });
            }
        }

        if (data.view) {
            data.view.forEach((view) => {
                chartData1.push([]);
                chartData2.push([]);
                chartData3.push([]);
                columnTitles.push(data.getPortalTitle(view.title));
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
                    var val1 = monitorGetDatasetCountByDate(view.linkId, startDate, false);
                    var val2 = monitorGetDatasetCount2ByDate(view.linkId, startDate, false);
                    var val3 = monitorGetDatasetCount3ByDate(view.linkId, startDate, false);

                    chartData1[s].unshift(val1);
                    chartData2[s].unshift(val2);
                    chartData3[s].unshift(val3);

                    values.push(val1);
                    ++s;
                });

                if (showTop) {
                    var topValues = values.sort(function (a,b) {
                        return b - a;
                    }).slice(showFirst - 1, showFirst + showLast - 1); 

                    chartData1.forEach(elem => {
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
        return chartData1;
    }

    function funcUpdate() {
        updateChart();
    }

    function updateChart() {
        clearData();
        fillData();

        var supplierData1 = {
            labels: rowTitles,
            datasets: getDatasets1(),
        };
        var supplierData2 = {
            labels: rowTitles,
            datasets: getDatasets2(),
        };
        var supplierData3 = {
            labels: rowTitles,
            datasets: getDatasets3(),
        };

        if (chartLine1 !== null) {
            chartLine1.data = supplierData1;
            chartLine1.update();

            if (chartLine2 !== null) {
                chartLine2.data = supplierData2;
                chartLine2.update();
            }    
            if (chartLine3 !== null) {
                chartLine3.data = supplierData3;
                chartLine3.update();
            }    
        } else {
            var elem1 = document.getElementById(idSupplierChart1);
            var elem2 = document.getElementById(idSupplierChart2);
            var elem3 = document.getElementById(idSupplierChart3);

            chartLine1 = new Chart(elem1, {
                type: 'line',
                data: supplierData1,
                options: chartGetOptions(),
            });

            if (elem2) {
                chartLine2 = new Chart(elem2, {
                    type: 'line',
                    data: supplierData2,
                    options: chartGetOptions(),
                });
            }

            if (elem3) {
                chartLine3 = new Chart(elem3, {
                    type: 'line',
                    data: supplierData3,
                    options: chartGetOptions(),
                });
            }
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