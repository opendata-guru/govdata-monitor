<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$uriCKAN = 'https://ckan.govdata.de';
	$uriCKAN = 'https://offenedaten.aachen.de';
	$uriCKAN = 'https://opendata.schleswig-holstein.de';
	$uri = $uriCKAN . '/api/3/action/organization_list';
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

		foreach($mapping as $line) {
			if ($line[0] == $obj['uri']) {
				$obj['contributor'] = $line[2];
			} else if ($line[0] == ($uriDomain . '|' . $obj['name'])) {
				$obj['contributor'] = $line[2];
			}
		}

		unset($obj['uri']);

		return $obj;
	}

	foreach($json->result as $orgaID) {
		$uri = $uriCKAN . '/api/3/action/organization_show?id=';
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

/*	id: "c6f6f6ba-93ab-40ed-8dcf-62d1b678260f"
	name: "auswaertiges-amt"
	title: "Auswärtiges Amt"
	display_name: "Auswärtiges Amt"
	created: "2020-06-11T10:43:29.894113"
	package_count: 7
	approval_status: "approved"
	description: ""
	image_display_url: ""
	image_url: ""
	is_organization: true
	num_followers: 0
	state: "active"
	type: "organization"
	extras: {
		{
			group_id: "c6f6f6ba-93ab-40ed-8dcf-62d1b678260f"
			id: "a479c82c-b3bd-48ed-9cd6-4c4a11e39571"
			key: "contributorID"
			state: "active"
			value: "["http://dcat-ap.de/def/contributors/auswaertigesAmt"]"
		}
	}
	tags: array(0)
	groups: array(0) */
?>