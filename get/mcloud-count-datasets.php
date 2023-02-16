<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$searchUri = 'https://www.mcloud.de/web/guest/suche';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($searchUri != substr($paramLink, -strlen($searchUri))) {
		echo 'Parameter "link" must end with "' . $searchUri . '"';
		exit;
	}

	$source = file_get_contents($searchUri);

	$html = $source;
	$start = stripos($html, 'class="result-number"');
	$end = stripos($html, '<span', $start);
	$length = $end - $start;
	$html = trim(substr($html, $start, $length));
	$html = explode('>', $html);
	$packageCount = trim($html[1]);

	echo intval($packageCount);
?>