<?php
	header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$paramRS = htmlspecialchars($_GET['rs']);
	if ($paramRS == '') {
		echo 'Parameter "rs" is not set';
		exit;
	}

	$paramRS = preg_replace("/[^0-9,]/", '', $paramRS);
	$listRS = explode(',', $paramRS);

	function loadGeoJSON($filePath) {
		$dir = dirname($filePath);
		mkdir($dir, 0777, true);

		$data = file_get_contents($filePath);
		if (false === $data) {
			return null;
		}

		return $data;
	}

	function saveGeoJSON($filePath, $data) {
		file_put_contents($filePath, $data);
	}

	function getGeoJSON($rs) {
		$rs = substr($rs, 0, 15);
		$filePath = '../assets/geojson-' . date('Y') . '/' . date('Y-m') . '/' . $rs . '.geojson';

		$data = loadGeoJSON($filePath);

		if (is_null($data)) {
			$output = '&OUTPUTFORMAT=application%2Fjson';
			$crs = '&srsName=urn:ogc:def:crs:EPSG::4326';
			$getFeature = '&Service=WFS&Version=2.0.0&Request=GetFeature';
			$filter = '&FILTER=%3CFilter%3E%3CPropertyIsEqualTo%3E%3CValueReference%3Ears%3C/ValueReference%3E%3CLiteral%3E' . $rs . '%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/Filter%3E';
			$uri = 'https://sgx.geodatenzentrum.de/wfs_vg250?TYPENAMES=vg250:vg250_lan' . $getFeature . $output . $crs . $filter;

			$data = file_get_contents($uri);

			saveGeoJSON($filePath, $data);
		}

		return $data;
	}

	function concatFeatures(&$geoJSON, $geoJSON2) {
		$geoJSON->features = array_merge($geoJSON->features, $geoJSON2->features);
	}

	$geojson = (object) [
		'type' => 'FeatureCollection',
		'crs' => array(
			'type' => 'name',
			'properties' => array(
				'name' => 'urn:ogc:def:crs:EPSG::4326'
			)
		),
		'features' => []
/*
  ["totalFeatures"]=>
  int(5)
  ["numberMatched"]=>
  int(5)
  ["numberReturned"]=>
  int(5)
  ["timeStamp"]=>
  string(24) "2023-06-22T20:40:58.575Z"
  ["bbox"]=>
  array(4) {
    [0]=>
    float(7.521)
    [1]=>
    float(53.3598)
    [2]=>
    float(11.6725)
    [3]=>
    float(55.0992)
  }
*/
	];

	foreach($listRS as $rs) {
		$data = json_decode(getGeoJSON($rs), false);
		concatFeatures($geojson, $data);
	}

	echo json_encode($geojson);
?>