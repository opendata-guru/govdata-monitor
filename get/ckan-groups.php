<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$groupListSuffix = '/api/3/action/group_list';
	$groupShowSuffix = '/api/3/action/group_show?id=';
	$groupWebsiteSuffix = '/group/';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($groupListSuffix != substr($paramLink, -strlen($groupListSuffix))) {
		echo 'Parameter "link" must end with "' . $groupListSuffix . '"';
		exit;
	}

	$uriCKAN = substr($paramLink, 0, -strlen($groupListSuffix));
	$uri = $paramLink;
	$uriDomain = end(explode('/',$uriCKAN));
	$json = json_decode(file_get_contents($uri));

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

	function scrapeWebsite($groupID) {
		global $uriCKAN, $groupWebsiteSuffix;

		$uri = $uriCKAN . $groupWebsiteSuffix . $groupID;
		$source = file_get_contents($uri);

		$html = $source;
		$start = stripos($html, 'breadcrumb');
		$end = stripos($html, '</ul>', $start);
		$length = $end - $start;
		$html = substr($html, $start, $length);
		$html = explode('<', $html);
		$html = $html[count($html) - 2];
		$title = explode('>', $html)[1];

		$html = $source;
		$start = stripos($html, 'view-header');
		$end = stripos($html, '</div>', $start);
		$length = $end - $start;
		$html = trim(substr($html, $start, $length));
		$html = explode(' ', $html);
		$packageCount = $html[count($html) - 2];

		return array(
			'id' => $groupID,
			'name' => $groupID,
			'title' => $title,
			'created' => '',
			'packages' => intval($packageCount),
			'uri' => ''
		);
	}

	foreach($json->result as $groupID) {
		$uri = $uriCKAN . $groupShowSuffix;
		$json = json_decode(file_get_contents($uri . $groupID->name));

		if ($json) {
			$uris = json_decode($json->result->extras[0]->value);
			$data[] = semanticContributor(array(
				'id' => $json->result->id,
				'name' => $json->result->name,
				'title' => $json->result->title,
				'created' => $json->result->created,
				'packages' => $json->result->package_count,
				'uri' => $uris[0]
			));
		} else {
			$data[] = semanticContributor(scrapeWebsite($groupID->name));
		}
	}

	echo json_encode($data);
?>