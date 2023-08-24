<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	include('_semantic.php');

	$opendatasoftSuffix = '/api/v2/catalog/facets';
	$catalogSuffix = '/';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($opendatasoftSuffix != substr($paramLink, -strlen($opendatasoftSuffix))) {
		echo 'Parameter "link" must end with "' . $opendatasoftSuffix . '"';
		exit;
	}

	$uri = $paramLink;
	$uriPortal = substr($paramLink, 0, -strlen($opendatasoftSuffix));
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