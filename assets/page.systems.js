var date = null,
    diff = null,
    charthistory = null;
    map = null,
    parents = null,
    loadedPObjects = [],
    loadedSObjects = [],
    table = null;
var idButtonAddSupplier = 'modify-system-add-sobject',
    idAddSupplierType = 'add-supplier-type',
    idAddSupplierRelation = 'add-supplier-relation',
    idAddSupplierSameAs = 'add-supplier-same-as',
    idAddSupplierPartOf = 'add-supplier-part-of',
    idAddSupplierWikidata = 'add-supplier-wikidata';
  var selectedModifySystemPID = '',
    selectedModifySystemPName = '',
    selectedModifySystemSID = '',
    selectedModifySystemSName = '',
    filterSObjects = '',
    showOnlyImperfectPObjects = true;

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
    text += ' ' + (selectedModifySystemPName != '' ? selectedModifySystemPName : selectedModifySystemPID) + ' to ' + (selectedModifySystemSName !== '' ? selectedModifySystemSName : selectedModifySystemSID);
  } else if (selectedModifySystemPID !== '') {
    text += ' ' + (selectedModifySystemPName != '' ? selectedModifySystemPName : selectedModifySystemPID) + ' to -';
  } else if (selectedModifySystemSID !== '') {
    text += ' - to ' + (selectedModifySystemSName !== '' ? selectedModifySystemSName : selectedModifySystemSID);
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
	if (selectedModifySystemSID === result.sobject.sid) {
      selectedModifySystemPID = '';
      selectedModifySystemPName = '';
      enableModifySystemButton();
      loadedPObjects = [];
      fillModifyPObjectTable();
      onModifyLoadPObjects();
	} else {
      console.log(result);
      document.getElementById('modify-system-error').innerHTML = 'Something went wrong';
	}
  }, (error) => {
    document.getElementById('modify-system-error').innerHTML = error === '' ? 'Unknown error' : error.error + ' ' + error.message;
  });
}

function onModifySystemPID(element) {
  var pID = element.value;
  var sName = element.name;
  var checked = element.checked;

  var checkboxes = document.querySelectorAll('#modify-system-pobjects input');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked && (checkbox.value !== pID)) {
      checkbox.checked = false;
    }
  });

  selectedModifySystemPID = checked ? pID : '';
  selectedModifySystemPName = checked ? sName : '';
  enableModifySystemButton();
}

function onModifySystemSID(element) {
  var sID = element.value;
  var sName = element.name;
  var checked = element.checked;

  var checkboxes = document.querySelectorAll('#modify-system-sobjects input');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked && (checkbox.value !== sID)) {
      checkbox.checked = false;
    }
  });

  selectedModifySystemSID = checked ? sID : '';
  selectedModifySystemSName = checked ? sName : '';
  enableModifySystemButton();
}

function showOnlyImperfectProviderModifySystemButton(element) {
  var checked = element.checked;

  showOnlyImperfectPObjects = checked;
  fillModifyPObjectTable();
}

function filterModifySystemSObjects(element) {
  filterSObjects = element.value;
  fillModifySObjectTable();
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

function fillModifyPObjectTable() {
  var listElem = document.getElementById('modify-system-pobjects');
  var list = '';

  list += '<ul style="list-style:none;padding-left:.5em;">';
  loadedPObjects.forEach(pObject => {
    var title = '';
    if (pObject.sobject) {
      if (pObject.sobject.title.en !== '') {
        title = pObject.sobject.title.en;
      } else if (pObject.sobject.title.de !== '') {
        title = pObject.sobject.title.de;
      }
    }

    if (pObject.sobject && showOnlyImperfectPObjects) {
      return;
    }

    list += '<li style="overflow-x: hidden;white-space: nowrap;">';
    list += '<input type="checkbox" value="' + pObject.pid + '" name="' + (title != '' ? title : pObject.url) + '" onchange="onModifySystemPID(this)"> ' + title + ' ' + pObject.url;
    list += '</li>';
  });
  list += '</ul>';

  listElem.classList.remove('text-center');
  listElem.innerHTML = list;
}

function fillModifySObjectTable() {
  var listElem = document.getElementById('modify-system-sobjects');
  var list = '';
  var lowerFilter = filterSObjects.toLocaleLowerCase();

  list += '<ul style="list-style:none;padding-left:.5em;">';
  loadedSObjects.forEach(sObject => {
    var title = [];
    if (sObject.title.en !== '') {
      title.push('🇬🇧 ' + sObject.title.en);
    }
    if (sObject.title.de !== '') {
      title.push('🇩🇪 ' + sObject.title.de);
    }
    var strTitle = title.join(', ');

    if ((lowerFilter !== '') && (-1 === strTitle.toLocaleLowerCase().indexOf(lowerFilter))) {
      return;
    }

    list += '<li style="overflow-x: hidden;white-space: nowrap;">';
    list += '<input type="checkbox" value="' + sObject.sid + '" name="' + strTitle + '" onchange="onModifySystemSID(this)"> ' + strTitle;
    list += '</li>';
  });
  list += '</ul>';

  listElem.classList.remove('text-center');
  listElem.innerHTML = list;
}

function onModifyLoadPObjects() {
  loadPObjects((result) => {
    loadedPObjects = result;
    fillModifyPObjectTable();
  }, (error) => {
    loadedPObjects = [];
    fillModifyPObjectTable();

    console.warn(error);
  });
}

function onModifyLoadSObjects() {
  loadSObjects((result) => {
    loadedSObjects = result;
    fillModifySObjectTable();
  }, (error) => {
    loadedSObjects = [];
    fillModifySObjectTable();

    console.warn(error);
  });
}

// ----------------------------------------------------------------------------

function installButtonAddSupplier() {
  var elem = document.getElementById(idButtonAddSupplier);
  var html = '';

  if (!elem) {
    return
  }

  html += '<a class="badge mb-1 bg-info" href="#" data-bs-toggle="dropdown" style="line-height:1.3rem;padding:.2rem .6rem;">';
  html += '  Add';
  html += '</a>';

  html += '<div class="dropdown-menu dropdown-menu-end">';
  html += '  <div style="padding:.5rem 1rem;margin-top:-.5rem;background:#a4e9f4;color:#222;font-size:.9em">';
  html += '    Add a supplier';
  html += '  </div>'
  html += '  <div class="dropdown-divider" style="margin-top:0"></div>';

  html += '  <div style="padding:.5rem 1rem;margin-top:-.5rem">';
  html += '    <label for="' + idAddSupplierType + '">Choose a type:</label>';
  html += '    <select name="' + idAddSupplierType + '" id="' + idAddSupplierType + '">';
  Object.keys(data.layers).forEach((key) => {
    html += '      <option value="' + key + '">' + data.layers[key] + '</option>';
  });
  html += '    </select>';
  html += '  </div>';

  html += '  <fieldset style="padding:.5rem 1rem;margin-top:-.5rem">';
  html += '    <legend class="fs-5">Select a Wikidata relationship:</legend>';
  html += '    <div class="ps-3">';
  html += '      <input type="radio" id="' + idAddSupplierSameAs + '" name="' + idAddSupplierRelation + '" value="sameas" checked />';
  html += '      <label for="' + idAddSupplierSameAs + '">Same as</label>';
  html += '    </div>';
  html += '    <div class="ps-3">';
  html += '      <input type="radio" id="' + idAddSupplierPartOf + '" name="' + idAddSupplierRelation + '" value="partof" />';
  html += '      <label for="' + idAddSupplierPartOf + '">Part of</label>';
  html += '    </div>';
  html += '  </fieldset>';

  html += '  <div style="padding:.5rem 1rem;margin-top:-.5rem">';
  html += '    <label for="' + idAddSupplierWikidata + '">Choose Wikidata:</label>';
  html += '    <select name="' + idAddSupplierWikidata + '" id="' + idAddSupplierWikidata + '">';
  html += '    </select>';
  html += '  </div>';

/*  html += '    <div id="' + idCredentials + '" style="padding:.5rem 1rem;margin-top:-.5rem">';
  html += '      <label for="' + idName + '">Name:</label><input type="text" id="' + idName + '" name="' + idName + '">';
  html += '      <br>';
  html += '      <label for="' + idToken + '">Token:</label><input type="password" id="' + idToken + '" name="' + idToken + '">';
  html += '    </div>'
  html += '    <div id="' + idHello + '" style="padding:.5rem 1rem;margin-top:-.5rem" class="d-none"></div>';
  html += '    <div class="dropdown-divider"></div>';
  html += '    <a id="' + idLogin + '" class="dropdown-item" onclick="accountLogin()">Log in</a>';
  html += '    <a id="' + idLogout + '" class="dropdown-item d-none" onclick="accountLogout()">Log out</a>';*/
  html += '</div>';

  elem.classList.add('dropdown');
  elem.innerHTML = html;
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

  installButtonAddSupplier();

  document.getElementById('add-system-button').addEventListener('click', onAddSystem);
  document.getElementById('modify-system-button').addEventListener('click', onModifySystem);
  document.getElementById('modify-system-load-pobjects').addEventListener('click', onModifyLoadPObjects);
  document.getElementById('modify-system-load-sobjects').addEventListener('click', onModifyLoadSObjects);

  monitoring.loadData();
});

// ----------------------------------------------------------------------------
