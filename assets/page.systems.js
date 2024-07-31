var date = null,
    diff = null,
    charthistory = null;
    map = null,
    parents = null,
    loadedPObjects = [],
    loadedSObjects = [],
    table = null;
var idInteractiveAddSupplier = 'interactive-add-sobject',
    idInteractiveAddSupplierType = 'add-supplier-type',
    idInteractiveAddSupplierRelation = 'add-supplier-relation',
    idInteractiveAddSupplierSameAs = 'add-supplier-same-as',
    idInteractiveAddSupplierPartOf = 'add-supplier-part-of',
    idInteractiveAddSupplierWikidata = 'add-supplier-wikidata',
    idInteractiveAddSupplierTitle = 'add-supplier-title',
    idInteractiveAddSupplierError = 'add-supplier-error',
    idInteractiveAddSupplierButton = 'add-supplier-button',
    idInteractiveAddSupplierButton2 = 'add-supplier-button-2';
var idInteractiveAddSystem = 'interactive-add-pobject',
    idInteractiveAddSystemURL = 'add-system-url',
    idInteractiveAddSystemButton = 'add-system-button',
    idInteractiveAddSystemButton2 = 'add-system-button-2',
    idInteractiveAddSystemError = 'add-system-error',
    classInteractiveHeader = 'ia-header';
var idInteractiveEditSystem = 'interactive-edit-pobject',
    idInteractiveEditSystemPObject = 'edit-system-pobject',
    idInteractiveEditSystemSObject = 'edit-system-sobject',
    idInteractiveEditSystemPObjects = 'edit-system-pobjects',
    idInteractiveEditSystemSObjects = 'edit-system-sobjects',
    idInteractiveEditSystemSelection = 'edit-system-selection',
    idInteractiveEditSystemLoadPObjects = 'edit-system-load-pobjects',
    idInteractiveEditSystemLoadSObjects = 'edit-system-load-sobjects',
    idInteractiveEditSystemButton = 'edit-system-button',
    idInteractiveEditSystemButton2 = 'edit-system-button-2',
    idInteractiveEditSystemError = 'edit-system-error';
var selectedModifySystemPID = '',
    selectedModifySystemSID = '',
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
  var button = document.getElementById(idInteractiveAddSystemButton2);
  button.classList.remove('d-none');

  document.getElementById(idInteractiveAddSystemError).innerHTML = '';

  setTimeout(() => {
    button.classList.add('d-none');
  }, 3000);
}

function onAddSystem2() {
  document.getElementById(idInteractiveAddSystemButton2).classList.add('d-none');
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
  var button = document.getElementById(idInteractiveEditSystemButton);
  var text = 'Link';

  var pText = '-';
  if (selectedModifySystemPID) {
    loadedPObjects.forEach(pObject => {
      if (pObject.pid === selectedModifySystemPID) {
        if (pObject.sobject) {
          pText = pObject.sobject.title.en; 
        } else {
          pText = pObject.url;
        }
      }
    });
  }

  var sText = '-';
  if (selectedModifySystemSID) {
    loadedSObjects.forEach(sObject => {
      if (sObject.sid === selectedModifySystemSID) {
        sText = sObject.title.en; 
      }
    });
  }

  text += ' ' + pText +  ' to ' + sText;

  button.innerHTML = text;

  if ((pText !== '-') && (sText !== '-')) {
    button.classList.remove('bg-secondary');
    button.classList.add('bg-info');
  } else {
    button.classList.add('bg-secondary');
    button.classList.remove('bg-info');
  }
}

function updateSelection() {
  var element = document.getElementById(idInteractiveEditSystemSelection);
  var sObjects = Object.values(loadedSObjects).filter((sObject) => sObject.sid === selectedModifySystemSID);
  var text = '';

  if (sObjects.length > 0) {
    var sObject = sObjects[0];

    text += '<img src="' + sObject.image.url + '" style="height: 3em;position: absolute; right: 1em;background: #fff;border:2px solid #fff;">';
    text += '<strong>sid</strong>: ' + sObject.sid + '<br>';
    text += '<strong>title</strong>: ' + sObject.title.en + '<br>';
    text += '<strong>title</strong>: ' + sObject.title.de + '<br>';
    text += '<strong>type</strong>: ' + sObject.type + '<br>';
    text += '<strong>sameAs</strong>: ' + (sObject.sameAs.wikidata ? ('<a href="' + sObject.sameAs.wikidata + '" target="_blank">' + sObject.sameAs.wikidata.split('/').slice(-1)[0] + '</a>') : '') + '<br>';
    text += '<strong>partOf</strong>: ' + (sObject.partOf.wikidata ? ('<a href="' + sObject.partOf.wikidata + '" target="_blank">' + sObject.partOf.wikidata.split('/').slice(-1)[0] + '</a>') : '') + '<br>';
    text += '<strong>geocoding</strong>: ' + sObject.geocoding.germanRegionalKey + '<br>';
  }

  element.innerHTML = text;
}

function onModifySystem() {
  var button1 = document.getElementById(idInteractiveEditSystemButton);
  if (button1.classList.contains('bg-secondary')) {
    // button is disabled
    return;
  }

  var button = document.getElementById(idInteractiveEditSystemButton2);
  button.classList.remove('d-none');

  document.getElementById(idInteractiveEditSystemError).innerHTML = '';

  setTimeout(() => {
    button.classList.add('d-none');
  }, 3000);
}

function onModifySystem2() {
  document.getElementById(idInteractiveEditSystemButton2).classList.add('d-none');
  document.getElementById(idInteractiveEditSystemError).innerHTML = '';

  var url = 'https://opendata.guru/api/2/p/' + selectedModifySystemPID;

  account.sendRequest(url, {
    sID: selectedModifySystemSID
  }, (result) => {
	if (selectedModifySystemSID === result.sobject.sid) {
      reloadPObjects('');
	} else {
      console.log(result);
      document.getElementById(idInteractiveEditSystemError).innerHTML = 'Something went wrong';
	}
  }, (error) => {
    document.getElementById(idInteractiveEditSystemError).innerHTML = error === '' ? 'Unknown error' : error.error + ' ' + error.message;
  });
}

function onModifySystemPID(event) {
  var element = event.target;
  var pid = element.value;

  selectModifySystemPID(pid);

  loadedPObjects.forEach(pObject => {
    if ((pObject.pid === pid) && (pObject.sobject)) {
      selectModifySystemSID(pObject.sobject.sid);
    }
  });
}

function onModifySystemSID(event) {
  var element = event.target;
  var sID = element.value;

  selectModifySystemSID(sID);
}

function selectModifySystemPID(pid) {
  if (selectedModifySystemPID === pid) {
    return;
  }

  if (pid !== '') {
    var selection = document.getElementById('edit-system-pid-' + pid);
    if (selection) {
      selectedModifySystemPID = pid;
      selection.checked = true;
      selection.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }

  updateSelection();
  enableModifySystemButton();
}

function selectModifySystemSID(sid) {
  if (selectedModifySystemSID === sid) {
    return;
  }

  if (sid !== '') {
    var selection = document.getElementById('edit-system-sid-' + sid);
    if (selection) {
      selectedModifySystemSID = sid;
      selection.checked = true;
      selection.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }

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
  var listElem = document.getElementById(idInteractiveEditSystemPObjects);
  var list = '';
  var first = true;

  list += '<fieldset>';
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

    list += '<div style="overflow-x: hidden;white-space: nowrap;">';
    list += '<input type="radio" id="edit-system-pid-' + pObject.pid + '" value="' + pObject.pid + '" name="' + idInteractiveEditSystemPObject + '" class="mx-2" ' + (first ? 'checked' : '') + '>';
    list += '<label for="edit-system-pid-' + pObject.pid + '">' + title + ' ' + pObject.url + '</label>';
    list += '</div>';

    first = false;
  });
  list += '</fieldset>';

  listElem.classList.remove('text-center');
  listElem.innerHTML = list;

  document.querySelector('#' + idInteractiveEditSystemPObjects + ' fieldset').addEventListener('change', onModifySystemPID);

  var selected = document.querySelector('#' + idInteractiveEditSystemPObjects + ' fieldset input:checked');
  if (selected) {
    onModifySystemPID({
      target: selected
    });
  } else {
    selectedModifySystemPID = '';
    updateSelection();
    enableModifySystemButton();
  }
}

function fillModifySObjectTable() {
  var listElem = document.getElementById(idInteractiveEditSystemSObjects);
  var list = '';
  var first = true;
  var lowerFilter = filterSObjects.toLocaleLowerCase();

  list += '<fieldset>';
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

    list += '<div style="overflow-x: hidden;white-space: nowrap;">';
    list += '<input type="radio" id="edit-system-sid-' + sObject.sid + '" value="' + sObject.sid + '" name="' + idInteractiveEditSystemSObject + '" class="mx-2" ' + (first ? 'checked' : '') + '>';
    list += '<label for="edit-system-sid-' + sObject.sid + '">' + strTitle + '</label>';
    list += '</div>';

    first = false;
  });
  list += '</fieldset>';

  listElem.classList.remove('text-center');
  listElem.innerHTML = list;

  document.querySelector('#' + idInteractiveEditSystemSObjects + ' fieldset').addEventListener('change', onModifySystemSID);

  var selected = document.querySelector('#' + idInteractiveEditSystemSObjects + ' fieldset input:checked');
  if (selected) {
    onModifySystemSID({
      target: selected
    });
  } else {
    selectedModifySystemSID = '';
    updateSelection();
    enableModifySystemButton();
  }
}

function reloadPObjects(selectPID) {
  loadedPObjects = [];
  fillModifyPObjectTable();
  onModifyLoadPObjects(selectPID);

  updateSelection();
  enableModifySystemButton();
}

function reloadSObjects(selectSID) {
  loadedSObjects = [];
  fillModifySObjectTable();
  onModifyLoadSObjects(selectSID);

  updateSelection();
  enableModifySystemButton();
}

function onModifyLoadPObjects(selectPID) {
  loadPObjects((result) => {
    loadedPObjects = result;
    loadedPObjects.sort(function(a, b) {
      var left = (a.sobject ? a.sobject.title.en : '') + a.url;
      var right = (b.sobject ? b.sobject.title.en : '') + b.url;

      if (left < right) return -1;
      if (left > right) return 1;
      return 0;
    });
    fillModifyPObjectTable();
    selectModifySystemPID(selectPID);
  }, (error) => {
    loadedPObjects = [];
    fillModifyPObjectTable();

    console.warn(error);
  });
}

function onModifyLoadSObjects(selectSID) {
  loadSObjects((result) => {
    loadedSObjects = result;
    loadedSObjects.sort(function(a, b) {
      var left = a.title.en ? a.title.en : a.title.de;
      var right = b.title.en ? b.title.en : b.title.de;

      if (left < right) return -1;
      if (left > right) return 1;
      return 0;
    });
    fillModifySObjectTable();
    selectModifySystemSID(selectSID);
  }, (error) => {
    loadedSObjects = [];
    fillModifySObjectTable();

    console.warn(error);
  });
}

// ----------------------------------------------------------------------------

function onAddSupplier() {
  var button = document.getElementById(idInteractiveAddSupplierButton2);
  button.classList.remove('d-none');

  document.getElementById(idInteractiveAddSupplierError).innerHTML = '';

  setTimeout(() => {
    button.classList.add('d-none');
  }, 3000);
}

function onAddSupplier2() {
  document.getElementById(idInteractiveAddSupplierButton2).classList.add('d-none');
  var elemType = document.getElementById(idInteractiveAddSupplierType);
  var elemError = document.getElementById(idInteractiveAddSupplierError);
  var elemTitle = document.getElementById(idInteractiveAddSupplierTitle);
  var elemSameAs = document.getElementById(idInteractiveAddSupplierSameAs);
  var elemWikidata = document.getElementById(idInteractiveAddSupplierWikidata);
  var type = elemType.value;
  var error = '';
  var title = elemTitle.value;
  var sameAs = elemSameAs.checked;
  var wikidata = elemWikidata.value;

  if ((title === '') && (wikidata.split('/').slice(-1)[0].toLocaleLowerCase().indexOf('q') !== 0)) {
    error = 'Link to Wikidata is invalid';
  }
  elemError.innerHTML = error;

  if (error === '') {
    var url = 'https://opendata.guru/api/2/s';
  
    account.sendRequest(url, {
      type: type,
      title: title,
      sameaswikidata: sameAs ? wikidata : '',
      partofwikidata: !sameAs ? wikidata : ''
    }, (result) => {
      if (type === result.type) {
        elemError.innerHTML = 'Done: ' + result.sid;
        elemWikidata.value = '';

        reloadSObjects(result.sid);
      } else {
        console.log(result);
        elemError.innerHTML = 'Something went wrong';

        reloadSObjects('');
      }
    }, (error) => {
      elemError.innerHTML = error === '' ? 'Unknown error' : error.error + ' ' + error.message;

      reloadSObjects('');
    });
  }
}

// ----------------------------------------------------------------------------

function installInteractiveArea() {
  var elemAddPObject = document.getElementById(idInteractiveAddSystem);
  var elemAddSObject = document.getElementById(idInteractiveAddSupplier);
  var elemEditPObject = document.getElementById(idInteractiveEditSystem);

  if (elemAddPObject) {
    installAddSystem(elemAddPObject);

    document.getElementById(idInteractiveAddSystemButton).addEventListener('click', onAddSystem);
    document.getElementById(idInteractiveAddSystemButton2).addEventListener('click', onAddSystem2);
  }

  if (elemAddSObject) {
    installAddSupplier(elemAddSObject);

    document.getElementById(idInteractiveAddSupplierButton).addEventListener('click', onAddSupplier);
    document.getElementById(idInteractiveAddSupplierButton2).addEventListener('click', onAddSupplier2);
  }

  if (elemEditPObject) {
    installEditSystem(elemEditPObject);

    document.getElementById(idInteractiveEditSystemButton).addEventListener('click', onModifySystem);
    document.getElementById(idInteractiveEditSystemButton2).addEventListener('click', onModifySystem2);
    document.getElementById(idInteractiveEditSystemLoadPObjects).addEventListener('click', onModifyLoadPObjects);
    document.getElementById(idInteractiveEditSystemLoadSObjects).addEventListener('click', onModifyLoadSObjects);
  }
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
  str += '  <input type="string" id="' + idInteractiveAddSystemURL + '" name="' + idInteractiveAddSystemURL + '" class="flex-fill w-100">';
  str += '  <span id="' + idInteractiveAddSystemButton + '" class="badge mt-1 bg-info" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Add</span>';
  str += '  <span id="' + idInteractiveAddSystemButton2 + '" class="badge mt-1 bg-warning text-black d-none" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Do it</span>';
  str += '  <span id="' + idInteractiveAddSystemError + '" class="text-danger p-2"></span>';
  str += '</div>';

  row.innerHTML = str;
}

function installAddSupplier(elem) {
  prepareInteracticeElem(elem);

  var header = elem.getElementsByClassName(classInteractiveHeader)[0];
  header.innerHTML = 'Add supplier';
  header.style.left = '-4em';
  header.style.top = '2.75em';

  var row = elem.getElementsByClassName('row')[0];
  var str = '';
  str += '<div class="col-12 col-md-12">';

  str += '  <div>';
  str += '    <label for="' + idInteractiveAddSupplierType + '">Choose a type:</label>';
  str += '    <select name="' + idInteractiveAddSupplierType + '" id="' + idInteractiveAddSupplierType + '">';
  Object.keys(data.layers).forEach((key) => {
    str += '      <option value="' + key + '">' + data.layers[key] + '</option>';
  });
  str += '    </select>';
  str += '  </div>';

  str += '</div>';
  str += '<div class="col-12 col-md-6">';

  str += '  <fieldset>';
  str += '    <legend class="fs-5 mb-0">Select a Wikidata relationship:</legend>';
  str += '    <div class="ps-3">';
  str += '      <input type="radio" id="' + idInteractiveAddSupplierSameAs + '" name="' + idInteractiveAddSupplierRelation + '" value="sameas" checked />';
  str += '      <label for="' + idInteractiveAddSupplierSameAs + '">Same as</label>';
  str += '    </div>';
  str += '    <div class="ps-3">';
  str += '      <input type="radio" id="' + idInteractiveAddSupplierPartOf + '" name="' + idInteractiveAddSupplierRelation + '" value="partof" />';
  str += '      <label for="' + idInteractiveAddSupplierPartOf + '">Part of</label>';
  str += '    </div>';
  str += '  </fieldset>';

  str += '  <div>';
  str += '    <label for="' + idInteractiveAddSupplierWikidata + '">Set link to Wikidata:</label>';
  str += '    <input type="text" id="' + idInteractiveAddSupplierWikidata + '" name="' + idInteractiveAddSupplierWikidata + '" value="" />';
  str += '  </div>';

  str += '</div>';
  str += '<div class="col-12 col-md-6">';

  str += '  <div>';
  str += '    <label for="' + idInteractiveAddSupplierTitle + '">Or set title:</label>';
  str += '    <input type="text" id="' + idInteractiveAddSupplierTitle + '" name="' + idInteractiveAddSupplierTitle + '" value="" />';
  str += '  </div>';

  str += '</div>';
  str += '<div class="col-12 col-md-12">';

  str += '  <div>';
  str += '    <span id="' + idInteractiveAddSupplierButton + '" class="badge mt-1 bg-info" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Add</span>';
  str += '    <span id="' + idInteractiveAddSupplierButton2 + '" class="badge mt-1 bg-warning text-black d-none" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Do it</span>';
  str += '    <span id="' + idInteractiveAddSupplierError + '" class="text-danger p-2"></span>';
  str += '  </div>';

  str += '</div>';

  row.innerHTML = str;
}

function installEditSystem(elem) {
  prepareInteracticeElem(elem);

  var header = elem.getElementsByClassName(classInteractiveHeader)[0];
  header.innerHTML = 'Modify system';
  header.style.left = '-4.5em';
  header.style.top = '3.5em';

  var row = elem.getElementsByClassName('row')[0];
  var str = '';

  str += '<div class="col-12 col-md-4">';
  str += '  <div style="min-height: 2em;">';
  str += '    <input type="checkbox" checked onchange="showOnlyImperfectProviderModifySystemButton(this)"> show only imperfect provider';
  str += '  </div>';
  str += '  <div class="border border-1 border-dark" style="height: 10em;overflow-y: scroll;">';
  str += '    <div id="' + idInteractiveEditSystemPObjects + '" class="w-100 text-center">';
  str += '      <span id="' + idInteractiveEditSystemLoadPObjects + '" class="badge mt-1 bg-info" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;margin-top:4.5em !important">';
  str += '        Load Provider List';
  str += '      </span>';
  str += '    </div>';
  str += '  </div>';
  str += '</div>';

  str += '<div class="col-12 col-md-4">';
  str += '  <div style="min-height: 2em;">';
  str += '    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search align-middle"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';
  str += '    <input type="search" placeholder="Search Supplier" class="ps-2 border border-1 border-dark" oninput="filterModifySystemSObjects(this)">';
  str += '  </div>';
  str += '  <div class="border border-1 border-dark" style="height: 10em;overflow-y: scroll;">';
  str += '    <div id="' + idInteractiveEditSystemSObjects + '" class="w-100 text-center">';
  str += '      <span id="' + idInteractiveEditSystemLoadSObjects + '" class="badge mt-1 bg-info" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;margin-top:4.5em !important">';
  str += '        Load Supplier List';
  str += '      </span>';
  str += '    </div>';
  str += '  </div>';
  str += '  <div class="text-center px-2" id="modify-system-add-sobject"></div>';
  str += '</div>';

  str += '<div class="col-12 col-md-4">';
  str += '  <div style="height: 12em;overflow-y: scroll;">';
  str += '    <div id="' + idInteractiveEditSystemSelection + '" class="w-100 p-2">';
  str += '    </div>';
  str += '  </div>';
  str += '</div>';

  str += '<div class="col-12 col-md-12">';
  str += '  <span id="' + idInteractiveEditSystemButton + '" class="badge mt-1 bg-secondary" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Link</span>';
  str += '  <span id="' + idInteractiveEditSystemButton2 + '" class="badge mt-1 bg-warning text-black d-none" style="line-height:1.3rem;padding:.2rem .6rem;cursor:pointer;">Do it</span>';
  str += '  <span id="' + idInteractiveEditSystemError + '" class="text-danger p-2"></span>';
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

  installInteractiveArea();

  monitoring.loadData();
});

// ----------------------------------------------------------------------------
