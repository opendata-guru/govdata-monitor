var map = (function () {
    var defaultCenter = [10, 51],
        defaultZoom = 4,
        map = null,
        mapCatalog = null,
        isMapLoaded = false,
        isDataLoaded = false;
    var idMap = 'map',
        idSource = 'gml';

    function init() {
        map = new maplibregl.Map({
            center: defaultCenter,
            container: idMap,
            style: 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json',
            zoom: defaultZoom
        });

        map.on('load', onMapLoaded);
    }

    function getRSList() {
        var catalogObj = catalog.get(catalog.id);
        var ret = [];

        if (catalogObj.rs) {
            ret.push(catalogObj.rs);
        }

        if (data.view) {
            data.view.forEach((view) => {
                var viewCatalog = catalog.get(view.linkId);
                if (viewCatalog.rs) {
                    ret.push(viewCatalog.rs);
                }
            });
        }

        return [ ...new Set(ret) ];
    }

    function setLayer(source) {
        if (map.getSource(idSource)) {
            map.getSource(idSource).setData(source);
        } else {
            map.addSource(idSource, {
                'type': 'geojson',
                'data': source
            });
            map.addLayer({
                'id': 'gml-polygons',
                'type': 'fill',
                'source': idSource,
                'paint': {
                    'fill-color': '#f00',
                    'fill-outline-color': '#800',
                    'fill-opacity': .25
                },
//	            'filter': ['==', '$type', 'Polygon']
            });
        }
    }

    function setupLayerWithGeoJSON(geoJSON) {
        setLayer(geoJSON);

        map.jumpTo({
            center: defaultCenter,
            zoom: defaultZoom
        });
    }

    function loadLayer(path) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                features = JSON.parse(this.responseText);
                setLayer(features);

                var bounds = turf.bbox(features);
                map.fitBounds(bounds, {padding: 20});
            } else if (this.readyState == 4) {
                map.jumpTo({
                    // AUA
                    center: [9.571, 50.915],
                    zoom: 14
                });
            }
        }

        xhr.send();
    }

    function setupLayer() {
        if (isMapLoaded && isDataLoaded) {
//            isMapLoaded = false; // hack
        } else {
            return;
        }

        var rs = getRSList().join(',');
        if (rs === '') {
            setupLayerWithGeoJSON({'type':'FeatureCollection','features':[]});
        } else {
            loadLayer('https://opendata.guru/govdata/get/rs-to-geojson.php?rs=' + rs);
        }
    }

    function onMapLoaded() {
        isDataLoaded = true;

        setupLayer();
    }

    function funcSetCatalog(catalogId) {
        if (mapCatalog !== catalogId) {
            mapCatalog = catalogId;
            isMapLoaded = true;
        }

        setupLayer();
    }

    function funcUpdate() {
        funcSetCatalog(catalog.id);
    }

    init();

    return {
        setCatalog: funcSetCatalog,
        update: funcUpdate
    };
}());