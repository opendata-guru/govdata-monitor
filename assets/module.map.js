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
        var rs = catalogObj.rs;

//        console.log('RS:', rs);
/*        console.log(data.view);
        if (data.view) {
            data.view.forEach((view) => {
    
            });
        }*/

        return [rs];
    }

    function setupLayer() {
        if (isMapLoaded && isDataLoaded) {
//            isMapLoaded = false; // hack
        } else {
            return;
        }

        var rs = getRSList().join(',');
        var source = rs === '' ? {'type':'FeatureCollection','features':[]} : ('https://opendata.guru/govdata/get/rs-to-geojson.php?rs=' + rs);

        if (rs !== '') {
            map.once('data', onLayerLoaded);
        }

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
                    'fill-color': '#ff0',
                    'fill-outline-color': '#f00',
                    'fill-opacity': .5
                },
//	        'filter': ['==', '$type', 'Polygon']
            });
        }

        if (rs === '') {
            map.jumpTo({
                center: defaultCenter,
                zoom: defaultZoom
            });
        }
    }

    function onLayerLoaded(e) {
        if (!e.isSourceLoaded) {
            map.once('data', onLayerLoaded);
            return;
        }

        var features = map.querySourceFeatures(idSource);
//        var features = map.querySourceFeatures('gml-polygons', {sourceLayer: idSource});
//        var features = map.queryRenderedFeatures();
//        var features = map.queryRenderedFeatures({layers: ['gml-polygons']});
        console.log(features);

        var gml = map.getSource(idSource);
        console.log(gml);
        console.log(gml.tileBounds);

        var bounds = turf.bbox(features);
        map.fitBounds(bounds, {padding: 20});
        console.log(bounds);

/*        map.fitBounds([
            [32.958984, -5.353521],
            [43.50585, 5.615985]
        ]);*/
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