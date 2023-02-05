<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$orgaListSuffix = '/api/3/action/organization_list';
	$orgaShowSuffix = '/api/3/action/organization_show?id=';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($orgaListSuffix != substr($paramLink, -strlen($orgaListSuffix))) {
		echo 'Parameter "link" must end with "' . $orgaListSuffix . '"';
		exit;
	}

	$uriCKAN = substr($paramLink, 0, -strlen($orgaListSuffix));
	$uri = $paramLink;
	$uriDomain = end(explode('/',$uriCKAN));
	$json = json_decode(file_get_contents($uri));

	$mappingFile = 'contributor-uri-map.csv';
	$mappingList = explode("\n", file_get_contents($mappingFile));
	$mappingHeader = explode(',', $mappingList[0]);
	$mappingURI = null;
	$mappingLink = null;
	$mappingType = null;
	$mappingTitle = null;
	$mappingWikidata = null;
	$mappingContributor = null;
	$mapping = [];

	for ($m = 0; $m < count($mappingHeader); ++$m) {
		if ($mappingHeader[$m] === 'id') {
			$mappingURI = $m;
		} else if ($mappingHeader[$m] === 'title') {
			$mappingTitle = $m;
		} else if ($mappingHeader[$m] === 'uri') {
			$mappingContributor = $m;
		} else if ($mappingHeader[$m] === 'type') {
			$mappingType = $m;
		} else if ($mappingHeader[$m] === 'wikidata') {
			$mappingWikidata = $m;
		} else if ($mappingHeader[$m] === 'link') {
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
		global $mapping, $uriDomain, $mappingURI, $mappingLink, $mappingType, $mappingTitle, $mappingWikidata, $mappingContributor;

		$obj['contributor'] = '';
		$obj['type'] = '';
		$obj['wikidata'] = '';
		$obj['link'] = '';

		foreach($mapping as $line) {
			if ($line[$mappingURI] == $obj['uri']) {
				$obj['title'] = $line[$mappingTitle];
				$obj['contributor'] = $line[$mappingContributor];
				$obj['type'] = $line[$mappingType];
				$obj['wikidata'] = $line[$mappingWikidata];
				$obj['link'] = $line[$mappingLink];
			} else if ($line[$mappingURI] == ($uriDomain . '|' . $obj['name'])) {
				$obj['title'] = $line[$mappingTitle];
				$obj['contributor'] = $line[$mappingContributor];
				$obj['type'] = $line[$mappingType];
				$obj['wikidata'] = $line[$mappingWikidata];
				$obj['link'] = $line[$mappingLink];
			}
		}

		unset($obj['uri']);

		return $obj;
	}

	foreach($json->result as $orgaID) {
		$uri = $uriCKAN . $orgaShowSuffix;
		$json = json_decode(file_get_contents($uri . $orgaID));
		$uris = json_decode($json->result->extras[0]->value);

		$data[] = semanticContributor(array(
			'id' => $json->result->id,
			'name' => $json->result->name,
			'title' => $json->result->title,
			'created' => $json->result->created,
			'packages' => $json->result->package_count,
			'uri' => (!is_null($uris) && is_array($uris)) ? $uris[0] : ''
		));
	}

	echo json_encode($data);
?>