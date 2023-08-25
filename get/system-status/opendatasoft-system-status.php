<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$opendatasoftSuffix = '/api/v2/catalog/facets';
	$opendatasoftEndpoint = '/api/v2/catalog/facets';
	$opendatasoftEndpoint2_0 = '/api/explore/v2.0/catalog/facets';
	$opendatasoftEndpoint2_1 = '/api/explore/v2.1/catalog/facets';
	$base = '/api/v2/';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	$uri = '';
	$version = '';

	if (substr($paramLink, -strlen($opendatasoftEndpoint)) === $opendatasoftEndpoint) {
		$uri = substr($paramLink, 0, -strlen($opendatasoftEndpoint)) . $base;
		$version = 'v2';
	} else if(substr($paramLink, -strlen($opendatasoftEndpoint2_0)) === $opendatasoftEndpoint2_0) {
		$uri = substr($paramLink, 0, -strlen($opendatasoftEndpoint2_0)) . $base;
		$version = 'v2.0';
	} else if(substr($paramLink, -strlen($opendatasoftEndpoint2_1)) === $opendatasoftEndpoint2_1) {
		$uri = substr($paramLink, 0, -strlen($opendatasoftEndpoint2_1)) . $base;
		$version = 'v2.1';
	} else {
		echo 'Parameter "link" must end with "' . $opendatasoftEndpoint . '"';
		exit;
	}

	echo json_encode((object) array(
		'extensions' => array(),
		'system' => 'Opendatasoft',
		'url' => $uri,
		'version' => $version,
	));
?>