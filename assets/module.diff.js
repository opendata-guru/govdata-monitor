var diff = (function () {
    var initvalHideEqual = false,
        defaultHideEqual = false,
        initvalHighlight = true,
        defaultHighlight = true,
        initvalThreshold = 100,
        defaultThreshold = 100;
    var idIndicator = 'diff-indicator',
        idReset = 'diff-reset',
        idHideEqual = 'diff-hide-equal',
        idHighlight = 'diff-highlight',
        idThreshold = 'diff-threshold';
    var paramHideEqual = 'diffHideEqual',
        paramHighlight = 'diffHighlight',
        paramThreshold = 'diffThreshold';

    function updateIndicator() {
        var elem = document.getElementById(idIndicator);

        if (diff) {
            initvalThreshold = diff.threshold;
            initvalHighlight = diff.highlight;
            initvalHideEqual = diff.hideEqual;
        }

        var hidden = initvalThreshold == defaultThreshold
            && initvalHighlight === defaultHighlight
            && initvalHideEqual === defaultHideEqual;

        elem.style.display = hidden ? 'none' : 'block';
        console.log(diff);
    }

    function init() {
        var params = new URLSearchParams(window.location.search);

        initvalHideEqual = params.has(paramHideEqual) ? (params.get(paramHideEqual) === 'true') : defaultHideEqual;
        initvalHighlight = params.has(paramHighlight) ? (params.get(paramHighlight) === 'true') : defaultHighlight;
        initvalThreshold = params.get(paramThreshold) || defaultThreshold;

        document.getElementById(idHideEqual).checked = initvalHideEqual;
        document.getElementById(idHighlight).checked = initvalHighlight;
        document.getElementById(idThreshold).value = initvalThreshold;

        document.getElementById(idReset).addEventListener('click', onClickReset);
        document.getElementById(idHideEqual).addEventListener('click', onClickHideEqual);
        document.getElementById(idHighlight).addEventListener('click', onClickHighlight);
        document.getElementById(idThreshold).addEventListener('change', onChangeThreshold);

        updateIndicator();
    }

    function onClickReset() {
        document.getElementById(idHideEqual).checked = defaultHideEqual;
        document.getElementById(idHighlight).checked = defaultHighlight;
        document.getElementById(idThreshold).value = defaultThreshold;

        diff.hideEqual = defaultHideEqual;
        diff.highlight = defaultHighlight;
        diff.threshold = defaultThreshold;

        var params = new URLSearchParams(window.location.search);
        params.delete(paramHideEqual);
        params.delete(paramHighlight);
        params.delete(paramThreshold);
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        updateIndicator();
        monitorUpdateCatalogTable();
    }

    function onClickHideEqual() {
        var cb = document.getElementById(idHideEqual);
        diff.hideEqual = cb.checked;
    
        var params = new URLSearchParams(window.location.search);
        if (diff.hideEqual === defaultHideEqual) {
            params.delete(paramHideEqual);
        } else {
            params.set(paramHideEqual, diff.hideEqual);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);
    
        updateIndicator();
        monitorUpdateCatalogTable();
    }

    function onClickHighlight() {
        var cb = document.getElementById(idHighlight);
        diff.highlight = cb.checked;
    
        var params = new URLSearchParams(window.location.search);
        if (diff.highlight === defaultHighlight) {
            params.delete(paramHighlight);
        } else {
            params.set(paramHighlight, diff.highlight);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);
    
        updateIndicator();
        monitorUpdateCatalogTable();
    }

    function onChangeThreshold() {
        var ctrl = document.getElementById(idThreshold);
        diff.threshold = ctrl.value;
    
        var params = new URLSearchParams(window.location.search);
        if (diff.threshold == defaultThreshold) {
            params.delete(paramThreshold);
        } else {
            params.set(paramThreshold, diff.threshold);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);
    
        updateIndicator();
        monitorUpdateCatalogTable();
    }

    init();

    return {
        hideEqual: initvalHideEqual,
        highlight: initvalHighlight,
        threshold: initvalThreshold,
    };
}());