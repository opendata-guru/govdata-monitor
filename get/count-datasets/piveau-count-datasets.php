<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$piveauSuffix = '/api/hub/search/search?filter=dataset';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($piveauSuffix != substr($paramLink, -strlen($piveauSuffix))) {
		echo 'Parameter "link" must end with "' . $piveauSuffix . '"';
		exit;
	}

	$uri = $paramLink;

	$json = json_decode(file_get_contents($uri));

	echo $json->result->count;
?>