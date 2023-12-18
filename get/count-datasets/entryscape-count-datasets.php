<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$entryScapeSuffix = '/store/';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($entryScapeSuffix != substr($paramLink, -strlen($entryScapeSuffix))) {
		echo 'Parameter "link" must end with "' . $entryScapeSuffix . '"';
		exit;
	}

	$uri = $paramLink;

	$query = 'search' .
		'?type=solr' .
		'&query=(' .
			'rdfType:http%5C%3A%2F%2Fwww.w3.org%2Fns%2Fdcat%23Dataset' .
			'+OR+' .
			'rdfType:http%5C%3A%2F%2Fentryscape.com%2Fterms%2FIndependentDataService' .
			'+OR+' .
			'rdfType:http%5C%3A%2F%2Fentryscape.com%2Fterms%2FServedByDataService' .
		')' .
		'+AND+' .
		'public:true' .
		'&limit=1';

	$json = json_decode(file_get_contents($uri . $query));

	echo $json->results;
?>