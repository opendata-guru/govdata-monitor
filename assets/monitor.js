var monitor = {
    data: [],
    displayCatalogId: '',
    displayDate: '',
    nextDate: '',
    nextUri: '',
};

function monitorGetCatalogTableRow(data) {
    function formatNumber(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    var str = '';
    var id = data.name ? data.name : '';
    var packageId = data.packagesInId ? data.packagesInId : '';
    var link = data.datasetCount ? ' <button class="btn btn-secondary btn-sm ms-2" onclick="monitorSetCatalog(\'' + id + '\')">Look into</button>' : '';

    if (packageId !== monitor.displayCatalogId) {
        return '';
    }

//    str += '<td>' + (data.type ? data.type : '') + '</td>';
    str += '<td><span title="' + id + '">' + (data.title ? data.title : '') + link + '</span></td>';
//    str += '<td>' + (data.link ? data.link : '') + '</td>';

    str += '<td class="text-end">' + formatNumber(data.packages ? data.packages : 0) + '</td>';
//    str += '<td><span title="' + packageId + '">' + (data.packagesInPortal ? data.packagesInPortal : '') + '</span></td>';
    str += '<td class="text-end"><span class="badge bg-info">' + formatNumber(data.datasetCount ? data.datasetCount : '') + '</span></td>';

    return '<tr>' + str + '</tr>';
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
}

function monitorSetDate(date) {
    monitor.displayDate = date;

    var text = '';
    text += '<span class="text-muted">Show date</span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + monitor.displayDate + ' </span>';

    document.getElementById('display-date').innerHTML = text;

    monitorUpdateCatalogTable();
}

function monitorSetCatalog(catalogId) {
    monitor.displayCatalogId = catalogId;

    window.scrollTo(0, 0);

    var data = monitor.data[monitor.displayDate];
    var text = '';
    var strCatalog = monitor.displayCatalogId;
    var strParent = '';
    var strParentId = '';

    if (data) {
        data.forEach((row) => {
            if (row.id === monitor.displayCatalogId) {
                strCatalog = row.title;
                strParent = row.packagesInPortal;
                strParentId = row.packagesInId;
            }
        });
    }

    text += '<span class="text-muted">Showing catalog</span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + strCatalog + ' </span>';

    if (strParentId !== '') {
        text += '<br>';
        text += '<span class="text-muted">Show parent catalog</span>';
        text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + strParent + ' </span>';
        text += '<button class="btn btn-secondary btn-sm ms-2" onclick="monitorSetCatalog(\'' + strParentId + '\')">Look into</button>';
    }

    document.getElementById('display-catalog').innerHTML = text;

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
    text += '<span class="text-muted">Load data from</span>';
    text += '<span class="text-warning"> <i class="mdi mdi-arrow-bottom-right"></i> ' + monitor.nextDate + ' </span>';

    document.getElementById('loading-description').innerHTML = text;
    document.getElementById('loading-icon-progress').style.display = 'block';
    document.getElementById('loading-icon-done').style.display = 'none';
}

function monitorShowNextDateDone() {
    var text = '';
    text += '<span class="text-muted">Loading data </span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> done </span>';

    document.getElementById('loading-description').innerHTML = text;
    document.getElementById('loading-icon-progress').style.display = 'none';
    document.getElementById('loading-icon-done').style.display = 'block';
}

function monitorProcessNextData(data) {
    data.forEach(item => {
        if (item.id === monitor.displayCatalogId) {
            console.log(item);
        }
    });

    monitor.data[monitor.nextDate] = data;

    monitorSetDate(monitor.nextDate);
    monitorSetCatalog('govdata.de'); // <-  this is a hack
    monitorShowNextDateDone();
}

function monitorLoadNextDate() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', monitor.nextUri, true);

    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            monitorProcessNextData(JSON.parse(this.responseText));
        }
    }

    xhr.send();
}

document.addEventListener('DOMContentLoaded', function() {
//    monitorSetNextDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));
    monitorSetNextDate(new Date(Date.now()));
    monitorSetCatalog('govdata.de');

    monitorShowNextDate();
    monitorLoadNextDate();
});
