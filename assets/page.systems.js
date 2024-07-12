var date = null,
    diff = null,
    charthistory = null;
    map = null,
    parents = null,
    table = null;
var selectedModifySystemPID = '';

function monitorUpdateCatalogPieChart() {}

function monitorFormatNumber(x) {
  if (x === null) {
      return '-';
  }
  if (x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  return x;
}

// ----------------------------------------------------------------------------

var idLoadingLabel = 'loading-description',
    classNameLoadingCard = 'card-loading';

function showProgress(value) {
  var text = '';
  value = value || '';
  text += '<span class="text-black">Loading data ... </span>';
  text += '<span class="text-secondary"> <i class="mdi mdi-arrow-bottom-right"></i> ' + value + ' </span>';

  document.getElementById(idLoadingLabel).innerHTML = text;
  document.getElementsByClassName(classNameLoadingCard)[0].style.top = '-1px';
}

function hideProgress() {
  document.getElementsByClassName(classNameLoadingCard)[0].style.top = '-3.5rem';
}

function onAddSystem() {
  var url = document.getElementById('add-system-url');

  document.getElementById('add-system-error').innerHTML = '';

  account.sendRequest('https://opendata.guru/api/2/p', {
    url: url.value
  }, (result) => {
    console.log(result);
    document.getElementById('add-system-error').innerHTML = 'Yeah: ' + result.pid;
  }, (error) => {
    document.getElementById('add-system-error').innerHTML = error.error + ' ' + error.message;
  });
}

function onModifySystemPID(element) {
  var pID = element.value;
  var checked = element.checked;

  var checkboxes = document.querySelectorAll('#modify-system-list input');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked && (checkbox.value !== pID)) {
      checkbox.checked = false;
    }
  });

  selectedModifySystemPID = checked ? pID : '';
}

function loadPObjects(loadedCB, errorCB) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://opendata.guru/api/2/p', true);

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      loadedCB(JSON.parse(this.responseText));
    } else if (this.readyState == 4) {
      errorCB(JSON.parse(this.responseText));
    }
  }

  xhr.send();
}

function fillModifyTable(pObjects) {
  var listElem = document.getElementById('modify-system-list');
  var list = '';

  list += '<ul style="list-style:none;padding-left:.5em;">';
  pObjects.forEach(pObject => {
    list += '<li style="overflow-x: hidden;white-space: nowrap;">';
    list += '<input type="checkbox" value="' + pObject.pid + '" onchange="onModifySystemPID(this)"> ' + pObject.sid + ' ' + pObject.url;
    list += '</li>';
  });
  list += '</ul>';
  listElem.innerHTML = list;
}

function onModifySystemTest() {
  loadPObjects((result) => {
    fillModifyTable(result);
  }, (error) => {
    fillModifyTable([]);

    console.log(error);
  });
}

// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
  monitoring.addEventListenerStartLoading(showProgress);
  monitoring.addEventListenerEndLoading(() => {
      hideProgress();

      system.loadData();
    });

  system.addEventListenerStartLoading(showProgress);
  system.addEventListenerEndLoading(() => {
      hideProgress();

      data.loadData(1);
  });

  data.addEventListenerStartLoading(showProgress);
  data.addEventListenerEndLoading(hideProgress);

  document.getElementById('add-system-button').addEventListener('click', onAddSystem);
  document.getElementById('modify-system-test-button').addEventListener('click', onModifySystemTest);

  monitoring.loadData();
});

// ----------------------------------------------------------------------------
