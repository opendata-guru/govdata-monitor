<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$adlerSuffix = 'https://datenadler.de/publisher';
	$curl = 'https://flask.datenadler.de/solr_search';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($adlerSuffix != substr($paramLink, -strlen($adlerSuffix))) {
		echo 'Parameter "link" must end with "' . $adlerSuffix . '"';
		exit;
	}

	function postRequest($url, $payload) {
		$headers = [
			'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,;q=0.8',
			'Accept-Language: de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
			'Cache-Control: no-cache',
			'Content-Type: application/json',
			'DNT: 1',
			'Host: flask.datenadler.de',
			'Origin: https://datenadler.de',
			'Referer: ttps://datenadler.de/',
			'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:28.0) Gecko/20100101 Firefox/28.0',
			'Accept: application/json',
		];

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

		$ret = curl_exec($ch);
		curl_close ($ch);
		return $ret;
	}

	$query = '{'.
		'"q": "",'.
		'"sort": "score",'.
		'"start": 0,'.
		'"rows": 0,'.
		'"choices": {'.
			'"dct_publisher_facet": {},'.
			'"dcat_theme_facet": {},'.
			'"dct_license_facet": {},'.
			'"dct_format_facet": {},'.
			'"rdf_type": {}'.
		'}'.
	'}';

	$json = json_decode(postRequest($curl, $query));

	if ($json) {
		echo $json->response->numFound;
	} else {
		echo 'null';
	}
?>