var map = (function () {
    var defaultCenter = [10, 51],
        defaultZoom = 4,
        map = null,
        mapCatalog = null,
        isMapLoaded = false,
        isDataLoaded = false,
        layerCountryName = 'layer-country',
        layerStateName = 'layer-state',
        layerGovernmentRegionName = 'layer-government-region',
        layerDistrictName = 'layer-district',
        layerCollectiveMunicipalityName1 = 'layer-collective-municipality1',
        layerCollectiveMunicipalityName2 = 'layer-collective-municipality2',
        layerMunicipalityName = 'layer-municipality',
        pMaps = [];
    var eventListenerMapLoaded = [],
        eventListenerMapClicked = [];
    var idMap = 'map',
//        mapStyle = 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json',
        mapStyle = 'https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json',
        idSource = 'gml';
    var mouseHover = [];

    function init() {
        var elem = document.getElementById(idMap);
        if (elem) {
            map = new maplibregl.Map({
                center: defaultCenter,
                container: idMap,
                style: mapStyle,
                zoom: defaultZoom
            });

            map.on('mousemove', onMouseMoveReset);
            map.on('load', onMapLoaded);
        }
    }

    function funcAdd(pObject) {
        var newMap = new maplibregl.Map({
            center: defaultCenter,
            container: 'map-' + pObject.pid,
            style: mapStyle,
            zoom: defaultZoom
        });

//		newMap.on('mousemove', onMouseMoveReset);
        newMap.on('load', onPMapLoaded);

        pMaps.push({
            ars: getARSList(pObject),
            map: newMap,
            pid: pObject.pid,
        });
    }

    function getRSList() {
        var catalogObj = catalog.get(catalog.id);
        var ret = [];

        if (catalogObj && catalogObj.rs) {
            ret.push(catalogObj.rs);
        }

        if (data.view) {
            data.view.forEach((view) => {
                var viewCatalog = catalog.get(view.linkId);
                if (viewCatalog && viewCatalog.rs) {
                    ret.push(viewCatalog.rs);
                }
                if (viewCatalog && viewCatalog.associated_rs) {
                    ret.push(viewCatalog.associated_rs);
                }
            });
        }

        return [ ...new Set(ret) ];
    }

    function getARSList(pObject) {
        var ret = [];

        if (pObject && pObject.lObjects) {
            pObject.lObjects.forEach((lObject) => {
                if (lObject.sobject && lObject.sobject.geocoding && lObject.sobject.geocoding.germanRegionalKey) {
                    ret.push(lObject.sobject.geocoding.germanRegionalKey);
                }
            });
        }

        return [ ...new Set(ret) ];
    }

    function generateSingleLayer(idLayer, paint, filter) {
        map.addLayer({
            'id': idLayer,
            'type': 'fill',
            'source': idSource,
            'paint': paint,
            'layout': { 'visibility': 'visible' },
            'filter': filter
        });
        map.on('click', idLayer, onClick);
        map.on('mousemove', idLayer, onMouseMove);
    }

    function generateSinglePLayer(mapItem, idLayer, paint, filter) {
        mapItem.map.addLayer({
            'id': idLayer,
            'type': 'fill',
            'source': idSource,
            'paint': paint,
            'layout': { 'visibility': 'visible' },
            'filter': filter
        });
//        mapItem.map.on('click', idLayer, onClick);
//        mapItem.map.on('mousemove', idLayer, onMouseMove);
    }

    function generateLayer() {
/*        generateSingleLayer(layerCountryName, {
            'fill-color': '#ffffff',
            'fill-outline-color': '#B8B8B8',
            'fill-opacity': 1
        }, ['all', ['==', 'gf', 4], ['==', 'ibz', 10]]);*/

        generateSingleLayer(layerStateName, {
            'fill-color': '#ffc819',
            'fill-outline-color': '#8F6D00',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['>=', 'ibz', 20], ['<=', 'ibz', 23]]);

        generateSingleLayer(layerGovernmentRegionName, {
            'fill-color': '#e89532',
            'fill-outline-color': '#814D0E',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['==', 'ibz', 30]]);

        generateSingleLayer(layerDistrictName, {
            'fill-color': '#63af4f',
            'fill-outline-color': '#2F5426',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['>=', 'ibz', 40], ['<=', 'ibz', 46]]);

        generateSingleLayer(layerCollectiveMunicipalityName1, {
            'fill-color': '#8c4877',
            'fill-outline-color': '#361C2E',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['>=', 'ibz', 50], ['<=', 'ibz', 56]]);

        generateSingleLayer(layerCollectiveMunicipalityName2, {
            'fill-color': '#8c4877',
            'fill-outline-color': '#361C2E',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['>=', 'ibz', 80], ['<=', 'ibz', 88]]);

        generateSingleLayer(layerMunicipalityName, {
            'fill-color': '#bf2026',
            'fill-outline-color': '#460C0E',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['>=', 'ibz', 60], ['<=', 'ibz', 66]]);
    }

    function generatePLayer(mapItem) {
/*        generateSinglePLayer(mapItem, layerCountryName, {
            'fill-color': '#ffffff',
            'fill-outline-color': '#B8B8B8',
            'fill-opacity': 1
        }, ['all', ['==', 'gf', 4], ['==', 'ibz', 10]]);*/

        generateSinglePLayer(mapItem, layerStateName, {
            'fill-color': '#ffc819',
            'fill-outline-color': '#8F6D00',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['>=', 'ibz', 20], ['<=', 'ibz', 23]]);

        generateSinglePLayer(mapItem, layerGovernmentRegionName, {
            'fill-color': '#e89532',
            'fill-outline-color': '#814D0E',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['==', 'ibz', 30]]);

        generateSinglePLayer(mapItem, layerDistrictName, {
            'fill-color': '#63af4f',
            'fill-outline-color': '#2F5426',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['>=', 'ibz', 40], ['<=', 'ibz', 46]]);

        generateSinglePLayer(mapItem, layerCollectiveMunicipalityName1, {
            'fill-color': '#8c4877',
            'fill-outline-color': '#361C2E',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['>=', 'ibz', 50], ['<=', 'ibz', 56]]);

        generateSinglePLayer(mapItem, layerCollectiveMunicipalityName2, {
            'fill-color': '#8c4877',
            'fill-outline-color': '#361C2E',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['>=', 'ibz', 80], ['<=', 'ibz', 88]]);

        generateSinglePLayer(mapItem, layerMunicipalityName, {
            'fill-color': '#bf2026',
            'fill-outline-color': '#460C0E',
            'fill-opacity': .8
        }, ['all', ['==', 'gf', 4], ['>=', 'ibz', 60], ['<=', 'ibz', 66]]);
    }

    function setLayer(source) {
        if (map.getSource(idSource)) {
            map.getSource(idSource).setData(source);
        } else {
            map.addSource(idSource, {
                'type': 'geojson',
                'data': source
            });

            generateLayer();
        }
    }

    function setPLayer(mapItem, source) {
        if (mapItem.map.getSource(idSource)) {
            mapItem.map.getSource(idSource).setData(source);
        } else {
            mapItem.map.addSource(idSource, {
                'type': 'geojson',
                'data': source
            });

            generatePLayer(mapItem);
        }
 
        var item = document.getElementById('map-' + mapItem.pid);
        item.classList.remove('loading-bar');
    }

    function setupLayerWithGeoJSON(geoJSON) {
        setLayer(geoJSON);

        map.jumpTo({
            center: defaultCenter,
            zoom: defaultZoom
        });
    }

    function setupPLayerWithGeoJSON(mapItem, geoJSON) {
        setPLayer(mapItem, geoJSON);

        mapItem.map.jumpTo({
            center: defaultCenter,
            zoom: defaultZoom - 1
        });
    }

    function funcSetZoom(zoom) {
        defaultZoom = zoom;

        map.jumpTo({
            zoom: defaultZoom
        });
    }

    function funcLoadGeoJSON(path) {
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

    function funcPLoadGeoJSON(mapItem, path) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                features = JSON.parse(this.responseText);
                setPLayer(mapItem, features);

                var bounds = turf.bbox(features);
                mapItem.map.fitBounds(bounds, {padding: 20});
            } else if (this.readyState == 4) {
                mapItem.map.jumpTo({
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
            funcLoadGeoJSON('https://opendata.guru/govdata/get/rs-to-geojson.php?rs=' + rs);
        }
    }

    function setupPLayer(mapItem) {
        var ars = mapItem.ars.join(',');
        if (ars === '') {
            setupPLayerWithGeoJSON(mapItem, {'type':'FeatureCollection','features':[]});
        } else {
            funcPLoadGeoJSON(mapItem, 'https://opendata.guru/govdata/get/rs-to-geojson.php?rs=' + ars);
        }
    }

    function onMapLoaded() {
        isDataLoaded = true;

        setupLayer();

        dispatchEventStartLoading();
    }

    function onPMapLoaded(event) {
        var pid = event?.target?._container?.id;
        pid = pid.split('-')[1];

        var mapItem = pMaps.filter((item) => item.pid === pid)[0];

        setupPLayer(mapItem);

//        dispatchEventStartLoading();
    }

    function onClick(e) {
        dispatchEventClickedOnMap(mouseHover, e.lngLat);
    }

    function onMouseMoveReset() {
        mouseHover = [];
    }

    function onMouseMove(e) {
        if (undefined !== e.features) {
            for (var f = 0; f < e.features.length; ++f) {
                var feat = e.features[f];
                mouseHover.push({
                    layer: feat.layer.id,
                    obj: feat.properties,
                    title: feat.properties.gen
                });
            }
        }
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

    function funcPopup(html, lngLat) {
        new maplibregl.Popup()
            .setLngLat(lngLat)
            .setHTML(html)
            .addTo(map);
    }

    function funcGetLayoutProperty(layer, property) {
        return map.getLayoutProperty(layer, property);
    }

    function funcSetLayoutProperty(layer, property, value) {
        map.setLayoutProperty(layer, property, value);
    }

    function funcAddEventListenerMapLoaded(func) {
        eventListenerMapLoaded.push(func);
    }

    function funcAddEventListenerMapClicked(func) {
        eventListenerMapClicked.push(func);
    }

    function dispatchEventStartLoading() {
        eventListenerMapLoaded.forEach(func => func());
    }

    function dispatchEventClickedOnMap(mouseHover, lngLat) {
        eventListenerMapClicked.forEach(func => func(mouseHover, lngLat));
    }

    init();

    return {
        add: funcAdd,
        addEventListenerMapLoaded: funcAddEventListenerMapLoaded,
        addEventListenerMapClicked: funcAddEventListenerMapClicked,
        getLayoutProperty: funcGetLayoutProperty,
        layerCountry: layerCountryName,
        layerState: layerStateName,
        layerGovernmentRegion: layerGovernmentRegionName,
        layerDistrict: layerDistrictName,
        layerCollectiveMunicipality1: layerCollectiveMunicipalityName1,
        layerCollectiveMunicipality2: layerCollectiveMunicipalityName2,
        layerMunicipality: layerMunicipalityName,
        loadGeoJSON: funcLoadGeoJSON,
        popup: funcPopup,
        setCatalog: funcSetCatalog,
        setLayoutProperty: funcSetLayoutProperty,
        setZoom: funcSetZoom,
        update: funcUpdate
    };
}());