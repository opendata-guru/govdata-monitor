<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$opendatasoftSuffix = '/api/v2/catalog/facets';
	$opendatasoftEndpoint = '/api/v2/catalog/facets';
	$opendatasoftEndpoint2_0 = '/api/explore/v2.0/catalog/facets';
	$opendatasoftEndpoint2_1 = '/api/explore/v2.1/catalog/facets';
	$countSuffix = '/api/v2/catalog/datasets?limit=0';
	$countSuffix2_0 = '/api/explore/v2.0/catalog/datasets?limit=0';
	$countSuffix2_1 = '/api/explore/v2.1/catalog/datasets?limit=0';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	$uri = '';

	if (substr($paramLink, -strlen($opendatasoftEndpoint)) === $opendatasoftEndpoint) {
		$uri = substr($paramLink, 0, -strlen($opendatasoftEndpoint)) . $countSuffix;
	} else if(substr($paramLink, -strlen($opendatasoftEndpoint2_0)) === $opendatasoftEndpoint2_0) {
		$uri = substr($paramLink, 0, -strlen($opendatasoftEndpoint2_0)) . $countSuffix2_0;
	} else if(substr($paramLink, -strlen($opendatasoftEndpoint2_1)) === $opendatasoftEndpoint2_1) {
		$uri = substr($paramLink, 0, -strlen($opendatasoftEndpoint2_1)) . $countSuffix2_1;
	} else {
		echo 'Parameter "link" must end with "' . $opendatasoftEndpoint . '"';
		exit;
	}

	$json = json_decode(file_get_contents($uri));

	echo $json->total_count;
?>