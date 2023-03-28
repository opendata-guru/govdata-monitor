var date = (function () {
    var initvalSelection = [],
        defaultSelection = [];
    var datepicker = null;
    var idIndicator = 'date-indicator',
        idMenu = 'date-menu';
        idReset = 'date-reset',
        idDatepicker = 'date-picker';
    var paramSelection = 'date';

    function updateIndicator() {
        var elem = document.getElementById(idIndicator);

        defaultSelection = [(new Date(Date.now())).toISOString().split('T')[0]];

        if (date) {
            initvalSelection = date.selection;
        }

        var hidden = JSON.stringify(initvalSelection) === JSON.stringify(defaultSelection);

        elem.style.display = hidden ? 'none' : 'block';
    }

    function install() {
        var html = '';

        html += '<div class="list-group" style="padding: .5rem 1rem 0 1rem">';
        html += '  <div class="chart">';
        html += '    <div id="' + idDatepicker + '"></div>';
        html += '  </div>';
        html += '</div>';

        html += '<div class="dropdown-divider"></div>';

        html += '<div class="dropdown-menu-footer">';
        html += '<a id="' + idReset + '" href="#" class="text-muted">Reset date settings</a>';
        html += '</div>';

        document.getElementById(idMenu).innerHTML = html;
    }

    function initCalendar() {
        var maxDate = new Date(Date.now());

        datepicker = document.getElementById(idDatepicker).flatpickr({
            conjunction: '|',
            defaultDate: [],
            dateFormat: 'Y-m-d',
            inline: true,
            maxDate: maxDate,
            mode: 'multiple',
            nextArrow: '<span title="Next month">&raquo;</span>',
            prevArrow: '<span title="Previous month">&laquo;</span>',

            enable: [function(theDate) {
                var dateString = theDate.toISOString().split('T')[0];
                return monitor.data[dateString] !== undefined;
            }],
        });
        datepicker.config.onChange.push(function(selectedDates, dateStr, instance) {
            onChangeDatePicker(dateStr);
        });
console.log('defaultSelection', defaultSelection);
console.log('initvalSelection', initvalSelection);
        datepicker.setDate(initvalSelection, false);
console.log('defaultSelection', defaultSelection);
console.log('initvalSelection', initvalSelection);
    }

    function init() {
        var params = new URLSearchParams(window.location.search);

        defaultSelection = [(new Date(Date.now())).toISOString().split('T')[0]];
        if (params.has(paramSelection)) {
            initvalSelection = params.get(paramSelection).split(',');
        } else {
            initvalSelection = defaultSelection;
        }

        document.getElementById(idReset).addEventListener('click', onClickReset);

        updateIndicator();
    }

    function onClickReset() {
        datepicker.setDate(defaultSelection, true);
        // this call onChangeDatePicker()
    }

    function onChangeDatePicker(dateStr) {
console.log('->', dateStr);
        var dateArray = dateStr.split('|');
        dateArray.sort();
        date.selection = dateStr.length === 0 ? [] : dateArray;
console.log('=>', date.selection);

        var params = new URLSearchParams(window.location.search);
        if (JSON.stringify(date.selection) === JSON.stringify(defaultSelection)) {
            params.delete(paramSelection);
        } else {
            params.set(paramSelection, date.selection);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        monitorUpdateCatalogTable();
    }

    function funcUpdate() {
        if (datepicker === null) {
            return;
        }

//        datepicker.setDate(monitor.displayDate, true);
        datepicker.setDate(datepicker.selectedDates, true);
    }

    install();
    init();

    document.addEventListener('DOMContentLoaded', function() {
        initCalendar();
    });

    return {
        selection: initvalSelection,
        update: funcUpdate,
    };
}());