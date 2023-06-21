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

	$paramRS = preg_replace("/[^0-9]/", '', $paramRS);
	$paramRS = substr($paramRS, 0, 15);

	$filePath = '../assets/geojson-' . date('Y') . '/' . date('Y-m') . '/' . $paramRS . '.geojson';

	function getWorkingData() {
		global $filePath;

		$dir = dirname($filePath);
		mkdir($dir, 0777, true);

		$data = file_get_contents($filePath);
		if (false === $data) {
			return null;
		}

		return $data;
	}

	function setWorkingData($data) {
		global $filePath;

		file_put_contents($filePath, $data);
	}

	$data = getWorkingData();

	if (is_null($data)) {
		$ars = $paramRS;
		$output = '&OUTPUTFORMAT=application%2Fjson';
		$crs = '&srsName=urn:ogc:def:crs:EPSG::4326';
		$getFeature = '&Service=WFS&Version=2.0.0&Request=GetFeature';
		$filter = '&FILTER=%3CFilter%3E%3CPropertyIsEqualTo%3E%3CValueReference%3Ears%3C/ValueReference%3E%3CLiteral%3E' . $ars . '%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/Filter%3E';
		$uri = 'https://sgx.geodatenzentrum.de/wfs_vg250?TYPENAMES=vg250:vg250_lan' . $getFeature . $output . $crs . $filter;

		$data = file_get_contents($uri);

		setWorkingData($data);
	}

	echo $data;
?>