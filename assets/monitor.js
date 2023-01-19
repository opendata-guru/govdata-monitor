var monitor = {
    data: [],
    displayCatalogId: '',
    displayDate: '',
    nextDate: '',
    nextUri: '',
};

function monitorUpdateCatalogTable() {
    var data = monitor.data[monitor.displayDate];
    var table = '';

    if (data) {
        console.log(data);
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

    var text = '';
    text += '<span class="text-muted">Show catalog</span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + monitor.displayCatalogId + ' </span>';

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
    monitorSetDate(monitor.nextDate);
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
