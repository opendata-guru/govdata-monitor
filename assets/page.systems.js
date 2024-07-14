var date = null,
    diff = null,
    charthistory = null;
    map = null,
    parents = null,
    table = null;
var selectedModifySystemPID = '',
    selectedModifySystemSID = '';

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
    document.getElementById('add-system-error').innerHTML = 'Yeah: ' + result.pid;
  }, (error) => {
    document.getElementById('add-system-error').innerHTML = error === '' ? 'Unknown error' : error.error + ' ' + error.message;
  });
}

function enableModifySystemButton() {
  var button = document.getElementById('modify-system-button');
  var text = 'Link';
  var enable = false;

  if ((selectedModifySystemPID !== '') && (selectedModifySystemSID !== '')) {
    enable = true;
    text += ' ' + selectedModifySystemPID + ' to ' + selectedModifySystemSID;
  } else if (selectedModifySystemPID !== '') {
    text += ' ' + selectedModifySystemPID + ' to -';
  } else if (selectedModifySystemSID !== '') {
    text += ' - to ' + selectedModifySystemSID;
  }

  button.innerHTML = text;

  if (enable) {
    button.classList.remove('bg-secondary');
    button.classList.add('bg-info');
  } else {
    button.classList.add('bg-secondary');
    button.classList.remove('bg-info');
  }
}

function onModifySystem() {
  var button = document.getElementById('modify-system-button');
  if (button.classList.contains('bg-secondary')) {
    // button is disabled
    return;
  }

  document.getElementById('modify-system-error').innerHTML = '';

  var url = 'https://opendata.guru/api/2/p/' + selectedModifySystemPID;

  account.sendRequest(url, {
    sID: selectedModifySystemSID
  }, (result) => {
    console.log(result);
    document.getElementById('modify-system-error').innerHTML = 'Yeah: ' + result.sid;
  }, (error) => {
    document.getElementById('modify-system-error').innerHTML = error === '' ? 'Unknown error' : error.error + ' ' + error.message;
  });
}

function onModifySystemPID(element) {
  var pID = element.value;
  var checked = element.checked;

  var checkboxes = document.querySelectorAll('#modify-system-pobjects input');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked && (checkbox.value !== pID)) {
      checkbox.checked = false;
    }
  });

  selectedModifySystemPID = checked ? pID : '';
  enableModifySystemButton();
}

function onModifySystemSID(element) {
  var sID = element.value;
  var checked = element.checked;

  var checkboxes = document.querySelectorAll('#modify-system-sobjects input');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked && (checkbox.value !== sID)) {
      checkbox.checked = false;
    }
  });

  selectedModifySystemSID = checked ? sID : '';
  enableModifySystemButton();
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

function loadSObjects(loadedCB, errorCB) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://opendata.guru/api/2/s', true);

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      loadedCB(JSON.parse(this.responseText));
    } else if (this.readyState == 4) {
      errorCB(JSON.parse(this.responseText));
    }
  }

  xhr.send();
}

function fillModifyPObjectTable(pObjects) {
  var listElem = document.getElementById('modify-system-pobjects');
  var list = '';

  list += '<ul style="list-style:none;padding-left:.5em;">';
  pObjects.forEach(pObject => {
    list += '<li style="overflow-x: hidden;white-space: nowrap;">';
    list += '<input type="checkbox" value="' + pObject.pid + '" onchange="onModifySystemPID(this)"> ' + pObject.sid + ' ' + pObject.url;
    list += '</li>';
  });
  list += '</ul>';

  listElem.classList.remove('text-center');
  listElem.innerHTML = list;
}

function fillModifySObjectTable(sObjects) {
  var listElem = document.getElementById('modify-system-sobjects');
  var list = '';

  list += '<ul style="list-style:none;padding-left:.5em;">';
  sObjects.forEach(sObject => {
    var title = [];
    if (sObject.title.en !== '') {
      title.push('🇬🇧 ' + sObject.title.en);
    }
    if (sObject.title.de !== '') {
      title.push('🇩🇪 ' + sObject.title.de);
    }

    list += '<li style="overflow-x: hidden;white-space: nowrap;">';
    list += '<input type="checkbox" value="' + sObject.sid + '" onchange="onModifySystemSID(this)"> ' + title.join(', ');
    list += '</li>';
  });
  list += '</ul>';

  listElem.classList.remove('text-center');
  listElem.innerHTML = list;
}

function onModifyLoadPObjects() {
  loadPObjects((result) => {
    fillModifyPObjectTable(result);
  }, (error) => {
    fillModifyPObjectTable([]);

    console.warn(error);
  });
}

function onModifyLoadSObjects() {
  loadSObjects((result) => {
    fillModifySObjectTable(result);
  }, (error) => {
    fillModifySObjectTable([]);

    console.warn(error);
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
  document.getElementById('modify-system-button').addEventListener('click', onModifySystem);
  document.getElementById('modify-system-load-pobjects').addEventListener('click', onModifyLoadPObjects);
  document.getElementById('modify-system-load-sobjects').addEventListener('click', onModifyLoadSObjects);

  monitoring.loadData();
});

// ----------------------------------------------------------------------------
