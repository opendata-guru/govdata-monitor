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

	$mappingFile = 'contributor-uri-map.csv';
	$mappingList = explode("\n", file_get_contents($mappingFile));
	$mapping = [];

	array_shift($mappingList);
	foreach($mappingList as $line) {
		if ($line != '') {
			$mapping[] = explode(',', $line);
		}
	}

	$data = [];

	function semanticContributor($obj) {
		global $mapping, $uriDomain;

		$obj['contributor'] = '';
		$obj['type'] = '';
		$obj['wikidata'] = '';
		$obj['link'] = '';

		foreach($mapping as $line) {
			if ($line[0] == $obj['uri']) {
				$obj['title'] = $line[1];
				$obj['contributor'] = $line[2];
				$obj['type'] = $line[3];
				$obj['wikidata'] = $line[4];
				$obj['link'] = $line[5];
			} else if ($line[0] == ($uriDomain . '|' . $obj['name'])) {
				$obj['title'] = $line[1];
				$obj['contributor'] = $line[2];
				$obj['type'] = $line[3];
				$obj['wikidata'] = $line[4];
				$obj['link'] = $line[5];
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