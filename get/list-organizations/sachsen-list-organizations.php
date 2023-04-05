<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$sachsenSuffix = 'https://www.opendata.sachsen.de';
	$max = 1000;

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
		'&query=' .
			'public:true' .
			'+AND+' .
			'(rdfType:http%5C%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2FAgent' .
			'+OR+' .
			'rdfType:http%5C%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2FOrganization' .
			'+OR+' .
			'rdfType:http%5C%3A%2F%2Fxmlns.com%2Ffoaf%2F0.1%2FPerson)' .
			'+AND+' .
			'title:*' .
		'&limit=' . $max;
/*	$query = 'search' .
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
		'&limit=1' .
		'&sort=title.de+asc,title.nolang+asc' .
		'&facetFields=' .
			'metadata.predicate.uri.9259d4c1,' .
			'metadata.predicate.literal_s.b5d28d0a,' .
			'metadata.predicate.uri.0ce6b231,' .
			'metadata.predicate.literal_s.a6424133,' .
			'metadata.predicate.uri.23fc4665,' .
			'related.metadata.predicate.uri.3494e2ce,' .
			'rdfType,' .
			'metadata.predicate.literal_s.759a4eb7,' .
			'metadata.predicate.literal_s.759a4eb7,' .
			'metadata.predicate.uri.2198789d,' .
			'metadata.predicate.uri.1c06f647';*/

	$json = json_decode(file_get_contents($uri . $query));

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

	foreach($json->resource->children as $organisation) {
		$metadata = (array) reset($organisation->metadata);
		$title = $metadata['http://xmlns.com/foaf/0.1/name'][0]->value;
		$info = (array) reset($organisation->info);
		$created = $info['http://purl.org/dc/terms/created'][0]->value;

		$name = preg_replace('#[^a-z0-9]#i', '', $title);
		$data[] = semanticContributor(array(
			'id' => $name,
			'name' => $name,
			'title' => $title,
			'created' => $created,
			'packages' => '',
			'uri' => ''
		));
	}

	echo json_encode($data);
?>