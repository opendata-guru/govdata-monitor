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
			'uri' => $uris[0]
		));
	}

	echo json_encode($data);
?>