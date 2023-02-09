<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$gdideSuffix = 'https://geoportal.de';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($gdideSuffix != substr($paramLink, -strlen($gdideSuffix))) {
		echo 'Parameter "link" must end wirh "' . $gdideSuffix . '"';
		exit;
	}

	$uri = $gdideSuffix . '/es/metadata_all/_search';

	function postRequest($url, $payload) {
		$headers = [
			'Accept: */*',
			'Accept-Language: de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
			'Content-Type: application/json',
			'DNT: 1',
			'Origin: ' . $gdideSuffix,
			'Referer: https://geoportal.de/search.html?q=&filter.keyword=OPEN%20DATA&style=narrow',
			'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:28.0) Gecko/20100101 Firefox/28.0',
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
		'"query":{'.
			'"bool":{'.
				'"must":[{"match_all":{}}],'.
				'"should":[],'.
				'"filter":[{"term":{"keyword":"OPEN DATA"}}]'.
		'}},'.
		'"aggs":{'.
//			'"datenanbieter":{"terms":{"field":"datenanbieter.keyword","size":1}}'.
		'},'.
		'"from":0,'.
		'"size":0,'.
		'"track_total_hits":true}';

	$json = json_decode(postRequest($uri, $query));

	if ($json) {
		echo $json->hits->total->value;
	} else {
		echo 'null';
	}
?>