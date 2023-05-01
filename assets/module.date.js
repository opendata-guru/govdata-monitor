var date = (function () {
    var initvalSelection = [],
        defaultSelection = [];
    var datepicker = null,
        updateToDate = null;
    var idIndicator = 'date-indicator',
        idMenu = 'date-menu',
        idReset = 'date-reset',
        idDatepicker = 'date-picker',
        idTitle = 'date-title';
    var paramSelection = 'date';

    function updateIndicator() {
        var elem = document.getElementById(idIndicator);

        defaultSelection = [(new Date(Date.now())).toISOString().split('T')[0]];

        if (date) {
            initvalSelection = date.selection;
        }

        var isToday = JSON.stringify(initvalSelection) === JSON.stringify(defaultSelection);
        var hidden = isToday;

        var title = 'Date';
        if (isToday) {
            title = 'Today';
        } else if (initvalSelection.length === 0) {
            title = 'No Date';
        } else if (initvalSelection.length === 1) {
            var days = (new Date(defaultSelection) - new Date(initvalSelection[0])) / 24 / 60 / 60 / 1000;
            if (days === 1) {
                title = 'Yesterday';
            } else {
                title = initvalSelection[0];
            }
        } else {
            var lenght = initvalSelection.length;
            var days = (new Date(defaultSelection) - new Date(initvalSelection[0])) / 24 / 60 / 60 / 1000;
            if ((days + 1) === lenght) {
                title = 'Last ' + initvalSelection.length + ' days';
            } else {
                title = initvalSelection.length + ' Dates';
            }
        }
        document.getElementById(idTitle).innerHTML = title;

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
            locale: {
                firstDayOfWeek: 1
            },
            maxDate: maxDate,
            mode: 'multiple',
            nextArrow: '<span title="Next month">&raquo;</span>',
            prevArrow: '<span title="Previous month">&laquo;</span>',

            enable: [function(theDate) {
                var dateString = theDate.toISOString().split('T')[0];
                return data.has(dateString);
            }],
        });
        datepicker.config.onChange.push(function(selectedDates, dateStr, instance) {
            if (updateToDate) {
                // HACK: it works but I don't know why
                updateToDate = null;
                if (dateStr !== '') {
                    onChangeDatePicker(dateStr);
                }
            } else {
                onChangeDatePicker(dateStr);
            }
        });
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
        var dateArray = dateStr.split('|');
        dateArray.sort();
        date.selection = dateStr.length === 0 ? [] : dateArray;

        var params = new URLSearchParams(window.location.search);
        if (JSON.stringify(date.selection) === JSON.stringify(defaultSelection)) {
            params.delete(paramSelection);
        } else {
            params.set(paramSelection, date.selection);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        data.emitFilterChanged();
    }

    function funcUpdate() {
        if (datepicker === null) {
            return;
        }

        updateToDate = initvalSelection;
        datepicker.setDate(initvalSelection, true);
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