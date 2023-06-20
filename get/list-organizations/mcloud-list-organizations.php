<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	include('_semantic.php');

	$searchUri = 'https://www.mcloud.de/web/guest/suche/';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($searchUri != substr($paramLink, -strlen($searchUri))) {
		echo 'Parameter "link" must end with "' . $searchUri . '"';
		exit;
	}

	$uriDomain = 'mcloud.de';
	$source = file_get_contents($searchUri);

	$data = [];

	$html = $source;
	$start = stripos($html, 'Datenanbieter');
	$end = stripos($html, '</li>', $start);
	$length = $end - $start;
	$html = substr($html, $start, $length);
	$list = explode('control__indicator', $html);

	for ($l = 1; $l < count($list); ++$l) {
		$html = $list[$l];
		$html = explode('</div>', $html)[1];
		$title = trim(explode('<', $html)[0]);
		$html = explode('<', $html)[1];
		$html = explode('>', $html)[1];
		$html = explode('(', $html)[1];
		$packages = intval($html);

		$name = preg_replace('#[^a-z0-9]#i', '', $title);
		$data[] = semanticContributor($uriDomain, array(
			'id' => $name,
			'name' => $name,
			'title' => $title,
			'created' => '',
			'packages' => $packages,
			'uri' => ''
		));
	}

	echo json_encode($data);
?>