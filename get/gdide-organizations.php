<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$gdideSuffix = 'https://geoportal.de';
	$max = 30000;

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($gdideSuffix != substr($paramLink, -strlen($gdideSuffix))) {
		echo 'Parameter "link" must end with "' . $gdideSuffix . '"';
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
			'"datenanbieter":{"terms":{"field":"datenanbieter.keyword","size":' . $max . '}}'.
		'},'.
		'"from":0,'.
		'"size":0,'.
		'"track_total_hits":true}';

	$json = json_decode(postRequest($uri, $query));

	$mappingFile = '../data/opendataportals.csv';
	$mappingList = explode("\n", file_get_contents($mappingFile));
	$mappingHeader = explode(',', $mappingList[0]);
	$mappingGML = null;
	$mappingURI1 = null;
	$mappingURI2 = null;
	$mappingLink = null;
	$mappingType = null;
	$mappingTitle = null;
	$mappingWikidata = null;
	$mappingContributor = null;
	$mapping = [];

	for ($m = 0; $m < count($mappingHeader); ++$m) {
		if ($mappingHeader[$m] === 'parent_and_id_1') {
			$mappingURI1 = $m;
		} else if ($mappingHeader[$m] === 'parent_and_id_2') {
			$mappingURI2 = $m;
		} else if ($mappingHeader[$m] === 'title') {
			$mappingTitle = $m;
		} else if ($mappingHeader[$m] === 'url') {
			$mappingContributor = $m;
		} else if ($mappingHeader[$m] === 'type') {
			$mappingType = $m;
		} else if ($mappingHeader[$m] === 'gml') {
			$mappingGML = $m;
		} else if ($mappingHeader[$m] === 'wikidata') {
			$mappingWikidata = $m;
		} else if ($mappingHeader[$m] === 'api_list_children') {
			$mappingLink = $m;
		}
	}

	array_shift($mappingList);
	foreach($mappingList as $line) {
		if ($line != '') {
			$mapping[] = explode(',', $line);
		}
	}

	$data = [];

	function semanticContributor($obj) {
		global $mapping, $uriDomain, $mappingURI1, $mappingURI2, $mappingLink, $mappingType, $mappingTitle, $mappingGML, $mappingWikidata, $mappingContributor;

		$obj['contributor'] = '';
		$obj['type'] = '';
		$obj['wikidata'] = '';
		$obj['link'] = '';

		foreach($mapping as $line) {
			if (   (($line[$mappingURI1] !== '') && ($line[$mappingURI1] == $obj['uri']))
				|| (($line[$mappingURI2] !== '') && ($line[$mappingURI2] == $obj['uri']))
			) {
				$obj['title'] = $line[$mappingTitle];
				$obj['contributor'] = $line[$mappingContributor];
				$obj['type'] = $line[$mappingType];
				$obj['gml'] = $line[$mappingGML];
				$obj['wikidata'] = $line[$mappingWikidata];
				$obj['link'] = $line[$mappingLink];
			} else if (
				   (($line[$mappingURI1] !== '') && ($line[$mappingURI1] == ($uriDomain . '|' . $obj['name'])))
				|| (($line[$mappingURI2] !== '') && ($line[$mappingURI2] == ($uriDomain . '|' . $obj['name'])))
			) {
				$obj['title'] = $line[$mappingTitle];
				$obj['contributor'] = $line[$mappingContributor];
				$obj['type'] = $line[$mappingType];
				$obj['gml'] = $line[$mappingGML];
				$obj['wikidata'] = $line[$mappingWikidata];
				$obj['link'] = $line[$mappingLink];
			}
		}

		unset($obj['uri']);

		return $obj;
	}

	foreach($json->aggregations->datenanbieter->buckets as $organisation) {
//		if ($organisation->key > 5) {
			$name = preg_replace('#[^a-z0-9]#i', '', $organisation->key);
			$data[] = semanticContributor(array(
				'id' => $name,
				'name' => $name,
				'title' => $organisation->key,
				'created' => '',
				'packages' => $organisation->doc_count,
				'uri' => ''
			));
//		}
	}

	echo json_encode($data);
?>