<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$adlerBase = 'https://datenadler.de';
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

	function getQuery($publisher) {
		return '{'.
			'"q": "",'.
			'"sort": "score",'.
			'"start": 0,'.
			'"rows": 0,'.
			'"choices": {'.
				'"dct_publisher_facet": {"' . $publisher . '": 1},'.
				'"dcat_theme_facet": {},'.
				'"dct_license_facet": {},'.
				'"dct_format_facet": {},'.
				'"rdf_type": {}'.
			'}'.
		'}';
	}

	$uri = $adlerSuffix;
	$source = file_get_contents($uri);

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

	$html = $source;
	$start = stripos($html, '<h1>');
	$end = stripos($html, '</ul>', $start);
	$length = $end - $start;
	$html = substr($html, $start, $length);
	$list = explode('<li', $html);

	for ($l = 1; $l < count($list); ++$l) {
		$html = $list[$l];
		$html = explode('<a ', $html)[1];
		$html = explode('"', $html)[1];
		$link = explode('"', $html)[0];

		$source = file_get_contents($adlerBase . $link);
		$html = $source;
		$start = stripos($html, '<main');
		$end = stripos($html, '</main>', $start);
		$length = $end - $start;
		$html = substr($html, $start, $length);
		$html = explode('<button', $html)[1];
		$html = explode('>', $html)[1];
		$html = explode('&quot;', $html)[1];
		$title = explode('&quot;', $html)[0];

		$json = json_decode(postRequest($curl, getQuery($title)));

		$name = preg_replace('#[^a-z0-9]#i', '', $title);
		$data[] = semanticContributor(array(
			'id' => $name,
			'name' => $name,
			'title' => $title,
			'created' => '',
			'packages' => $json->response->numFound,
			'uri' => ''
		));
	}

	echo json_encode($data);
?>