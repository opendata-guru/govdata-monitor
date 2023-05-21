<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	include('_semantic.php');

	$nrwSuffix = 'https://ckan.open.nrw.de/api/3/action/organization_list';
	$newNrwSuffix = 'https://open.nrw';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($nrwSuffix != substr($paramLink, -strlen($nrwSuffix))) {
		echo 'Parameter "link" must end with "' . $nrwSuffix . '"';
		exit;
	}

	$uri = $newNrwSuffix . '/suche?volltext=';
	$uriDomain = end(explode('/', $newNrwSuffix));

	$source = file_get_contents($uri);

	$data = [];

	$html = $source;
	$start = stripos($html, 'portal-select-facets-list');
	$end = stripos($html, '</ul>', $start);
	$length = $end - $start;
	$html = substr($html, $start, $length);
	$list = explode('<li', $html);

	for ($l = 1; $l < count($list); ++$l) {
		$html = $list[$l];

		$html = explode('value="', $html)[1];
		$name = trim(explode('"', $html)[0]);

		$html = explode('<label', $html)[1];
		$html = explode('>', $html)[1];
		$title = trim(explode('<', $html)[0]);

		$html = $list[$l];
		$html = explode('portal-count ', $html)[1];
		$html = explode('>', $html)[1];
		$count = trim(explode('<', $html)[0]);

		$data[] = semanticContributor($uriDomain, array(
			'id' => $name,
			'name' => $name,
			'title' => $title,
			'created' => '',
			'packages' => intval($count),
			'uri' => ''
		));
	}

	echo json_encode($data);
?>