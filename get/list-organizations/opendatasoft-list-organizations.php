<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	include('_semantic.php');

	$opendatasoftSuffix = '/api/v2/catalog/facets';
	$opendatasoftEndpoint = '/api/v2/catalog/facets';
	$opendatasoftEndpoint2_0 = '/api/explore/v2.0/catalog/facets';
	$opendatasoftEndpoint2_1 = '/api/explore/v2.1/catalog/facets';
	$catalogSuffix = '/';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	$uriPortal = '';

	if (substr($paramLink, -strlen($opendatasoftEndpoint)) === $opendatasoftEndpoint) {
		$uriPortal = substr($paramLink, 0, -strlen($opendatasoftEndpoint));
	} else if(substr($paramLink, -strlen($opendatasoftEndpoint2_0)) === $opendatasoftEndpoint2_0) {
		$uriPortal = substr($paramLink, 0, -strlen($opendatasoftEndpoint2_0));
	} else if(substr($paramLink, -strlen($opendatasoftEndpoint2_1)) === $opendatasoftEndpoint2_1) {
		$uriPortal = substr($paramLink, 0, -strlen($opendatasoftEndpoint2_1));
	} else {
		echo 'Parameter "link" must end with "' . $opendatasoftEndpoint . '"';
		exit;
	}

	$uri = $paramLink;
	$uriDomain = end(explode('/', $uriPortal));

	$source = file_get_contents($uri);

	$data = [];

	$json = json_decode($source);
	$facets = $json->facets;
	$list = [];

	for ($f = 0; $f < count($facets); ++$f) {
		if ('publisher' === $facets[$f]->name) {
			$list = array_merge($list, $facets[$f]->facets);
		}
	}

	for ($l = 0; $l < count($list); ++$l) {
		$entry = $list[$l];

		$title = $entry->value;
		$name = preg_replace('#[^a-z0-9]#i', '', $entry->name);

		$count = $entry->count;

		$data[] = semanticContributor($uriDomain, array(
			'id' => $name,
			'name' => $name,
			'title' => $title,
			'created' => '',
			'packages' => $count,
			'uri' => ''
		));
	}

	echo json_encode($data);
?>