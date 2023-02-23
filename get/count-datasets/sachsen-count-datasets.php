<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$sachsenSuffix = 'https://www.opendata.sachsen.de';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($sachsenSuffix != substr($paramLink, -strlen($sachsenSuffix))) {
		echo 'Parameter "link" must end with "' . $sachsenSuffix . '"';
		exit;
	}

	$uri = 'https://register.opendata.sachsen.de/store/';

	$query = 'search' .
		'?type=solr' .
		'&query=(' .
			'rdfType:http%5C%3A%2F%2Fwww.w3.org%2Fns%2Fdcat%23Dataset' .
			'+OR+' .
			'rdfType:http%5C%3A%2F%2Fentryscape.com%2Fterms%2FIndependentDataService)' .
			'+AND+' .
			'public:true' .
			'+AND+' .
			'(title.de:*^1' .
			'+OR+' .
			'title.nolang:*' .
			')' .
		'&limit=1';

	$json = json_decode(file_get_contents($uri . $query));

	echo $json->results;
?>