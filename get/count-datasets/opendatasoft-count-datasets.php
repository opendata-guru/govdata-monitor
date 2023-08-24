<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$opendatasoftSuffix = '/api/v2/catalog/facets';
	$countSuffix = '/api/v2/catalog/datasets?limit=0';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($opendatasoftSuffix != substr($paramLink, -strlen($opendatasoftSuffix))) {
		echo 'Parameter "link" must end with "' . $opendatasoftSuffix . '"';
		exit;
	}

	$uri = substr($paramLink, 0, -strlen($opendatasoftSuffix)) . $countSuffix;

	$json = json_decode(file_get_contents($uri));

	echo $json->total_count;
?>