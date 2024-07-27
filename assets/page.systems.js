var date = null,
    diff = null,
    charthistory = null;
    map = null,
    parents = null,
    loadedPObjects = [],
    loadedSObjects = [],
    table = null;
var idButtonAddSupplier = 'modify-system-add-sobject',
    idAddSupplierDropdown = 'add-supplier-dropdown',
    idAddSupplierType = 'add-supplier-type',
    idAddSupplierRelation = 'add-supplier-relation',
    idAddSupplierSameAs = 'add-supplier-same-as',
    idAddSupplierPartOf = 'add-supplier-part-of',
    idAddSupplierWikidata = 'add-supplier-wikidata',
    idAddSupplierError = 'add-supplier-error',
    idAddSupplierButton = 'add-supplier-button';
var idInteractiveAddSystem = 'interactive-add-system',
    idInteractiveAddSystemURL = 'add-system-url',
    idInteractiveAddSystemButton = 'add-system-button',
    idInteractiveAddSystemError = 'add-system-error',
    classInteractiveHeader = 'ia-header';
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
  var url = document.getElementById(idInteractiveAddSystemURL);

  document.getElementById(idInteractiveAddSystemError).innerHTML = '';

  account.sendRequest('https://opendata.guru/api/2/p', {
    url: url.value
  }, (result) => {
    document.getElementById(idInteractiveAddSystemError).innerHTML = 'Yeah: ' + result.pid;
    reloadPObjects(result.pid);
  }, (error) => {
    document.getElementById(idInteractiveAddSystemError).innerHTML = error === '' ? 'Unknown error' : error.error + ' ' + error.message;
    reloadPObjects('');
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

function updateSelection() {
  var element = document.getElementById('modify-system-selection');
  var sObjects = Object.values(loadedSObjects).filter((sObject) => sObject.sid === selectedModifySystemSID);
  var text = '';

  if (sObjects.length > 0) {
    var sObject = sObjects[0];

    text += '<img src="' + sObject.image.url + '" style="height: 3em;display: block; margin: 0 auto;">';
    text += '<strong>sid</strong>: ' + sObject.sid + '<br>';
    text += '<strong>type</strong>: ' + sObject.type + '<br>';
    text += '<strong>sameAs</strong>: ' + (sObject.sameAs.wikidata ? ('<a href="' + sObject.sameAs.wikidata + '" target="_blank">' + sObject.sameAs.wikidata.split('/').slice(-1)[0] + '</a>') : '') + '<br>';
    text += '<strong>partOf</strong>: ' + (sObject.partOf.wikidata ? ('<a href="' + sObject.partOf.wikidata + '" target="_blank">' + sObject.partOf.wikidata.split('/').slice(-1)[0] + '</a>') : '') + '<br>';
    text += '<strong>geocoding</strong>: ' + sObject.geocoding.germanRegionalKey + '<br>';
  }

  element.innerHTML = text;
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
      updateSelection();
      enableModifySystemButton();
      reloadPObjects('');
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
  updateSelection();
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
  updateSelection();
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

function reloadPObjects(selectPID) {
  loadedPObjects = [];
  fillModifyPObjectTable();
  onModifyLoadPObjects();
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

function onStopPropagationSystem(event) {
  event.stopPropagation();
}

function installButtonAddSupplier() {
  var elem = document.getElementById(idButtonAddSupplier);
  var html = '';

  if (!elem) {
    return
  }

  html += '<a class="badge mb-1 bg-info" href="#" data-bs-toggle="dropdown" style="line-height:1.3rem;padding:.2rem .6rem;">';
  html += '  Add';
  html += '</a>';

  html += '<div id="' + idAddSupplierDropdown + '" class="dropdown-menu dropdown-menu-end">';
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
  html += '    <label for="' + idAddSupplierWikidata + '">Set link to Wikidata:</label>';
  html += '    <input type="text" id="' + idAddSupplierWikidata + '" name="' + idAddSupplierWikidata + '" value="" />';
  html += '  </div>';

  html += '  <div class="dropdown-divider" style="margin-top:0"></div>';
  html += '  <div id="' + idAddSupplierError + '" style="padding:0 1rem .5rem 1rem;color:red">';
  html += '  </div>'

  html += '  <div class="dropdown-divider" style="margin-top:0"></div>';
  html += '  <div style="padding:0 1rem;text-align:center">';
  html += '    <a id="' + idAddSupplierButton + '" class="badge mb-1 bg-info" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;" onclick="onButtonAddSupplier()">Add</a>';
  html += '  </div>'

  html += '</div>';

  elem.classList.add('dropdown');
  elem.innerHTML = html;

  document.getElementById(idAddSupplierDropdown).addEventListener('click', onStopPropagationSystem);
}

function onButtonAddSupplier() {
  var elemType = document.getElementById(idAddSupplierType);
  var elemError = document.getElementById(idAddSupplierError);
  var elemSameAs = document.getElementById(idAddSupplierSameAs);
  var elemWikidata = document.getElementById(idAddSupplierWikidata);
  var type = elemType.value;
  var error = '';
  var sameAs = elemSameAs.checked;
  var wikidata = elemWikidata.value;

  if (wikidata.split('/').slice(-1)[0].toLocaleLowerCase().indexOf('q') !== 0) {
    error = 'Link to Wikidata is invalid';
  }
  elemError.innerHTML = error;

  if (error === '') {
    var url = 'https://opendata.guru/api/2/s';
  
    account.sendRequest(url, {
      type: type,
      sameaswikidata: sameAs ? wikidata : '',
      partofwikidata: !sameAs ? wikidata : ''
    }, (result) => {
      if (type === result.type) {
        elemError.innerHTML = 'Done: ' + result.sid;
        elemWikidata.value = '';

        selectedModifySystemPID = '';
        selectedModifySystemPName = '';
        updateSelection();
        enableModifySystemButton();
        loadedSObjects = [];
        fillModifySObjectTable();

        onModifyLoadSObjects();
      } else {
        console.log(result);
        elemError.innerHTML = 'Something went wrong';
      }
    }, (error) => {
      elemError.innerHTML = error === '' ? 'Unknown error' : error.error + ' ' + error.message;
    });
  }
}

// ----------------------------------------------------------------------------

function installInteractiveArea() {
  var elemAddSystem = document.getElementById(idInteractiveAddSystem);

  if (elemAddSystem) {
    installAddSystem(elemAddSystem);

    document.getElementById(idInteractiveAddSystemButton).addEventListener('click', onAddSystem);
  }

  document.getElementById('modify-system-button').addEventListener('click', onModifySystem);
  document.getElementById('modify-system-load-pobjects').addEventListener('click', onModifyLoadPObjects);
  document.getElementById('modify-system-load-sobjects').addEventListener('click', onModifyLoadSObjects);
}

function prepareInteracticeElem(elem) {
  elem.classList.add('flex-fill');
  elem.classList.add('w-100');
  elem.classList.add('p-3');
  elem.classList.add('pt-0');
  elem.classList.add('overflow-auto');

  var str = '';
  str += '<div class="ps-4 border border-info border-2 bg-info">';
  str += '  <div class="mb-0 p-2 bg-white" style="position: relative;">';
  str += '    <strong class="' + classInteractiveHeader + ' text-white" style="position: absolute;transform: rotate(90deg);left: 0;top: 0"></strong>';
  str += '    <div class="row"></div>';
  str += '  </div>';
  str += '</div>';

  elem.innerHTML = str;
}

function installAddSystem(elem) {
  prepareInteracticeElem(elem);

  var header = elem.getElementsByClassName(classInteractiveHeader)[0];
  header.innerHTML = 'Add system';
  header.style.left = '-3.75em';
  header.style.top = '2.5em';

  var row = elem.getElementsByClassName('row')[0];
  var str = '';
  str += '<div class="col-12 col-md-12">';
  str += '  <label for="' + idInteractiveAddSystemURL + '">Link to new system:</label>';
  str += '  <input type="string" id="' + idInteractiveAddSystemURL + '" name="' + idInteractiveAddSystemURL + '" class="border border-info flex-fill w-100">';
  str += '  <span id="' + idInteractiveAddSystemButton + '" class="badge mt-1 bg-info" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Add</span>';
  str += '  <span id="' + idInteractiveAddSystemError + '" class="text-danger p-2"></span>';
  str += '</div>';

  row.innerHTML = str;
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
  installInteractiveArea();

  monitoring.loadData();
});

// ----------------------------------------------------------------------------
