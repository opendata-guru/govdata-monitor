var monitor = {
    nextDate: '',
    nextUri: '',
};

function monitorSetDate(date) {
    var dateString = date.toISOString().split('T')[0];
    var uri = 'https://opendata.guru/govdata/assets/data-' + dateString.split('-')[0] + '/' + dateString + '-organizations.json';

    monitor.nextDate = dateString;
    monitor.nextUri = uri;
}

function monitorShowNextDate() {
    var text = '';
    text += '<span class="text-muted">Load data from</span>';
    text += '<span class="text-success"> <i class="mdi mdi-arrow-bottom-right"></i> ' + monitor.nextDate + ' </span>';

    document.getElementById('loading-description').innerHTML = text;
}

function monitorProcessNextData(data) {
    data.forEach(item => {
        if (item.id === 'govdata.de') {
            console.log(item);
        }
    });
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
//    monitorSetDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));
    monitorSetDate(new Date(Date.now()));
    monitorShowNextDate();

    monitorLoadNextDate();
});
