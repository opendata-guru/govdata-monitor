<?php
	$mappingFile = '../data/opendataportals.csv';
	$mappingList = explode("\n", file_get_contents($mappingFile));
	$mappingHeader = explode(',', $mappingList[0]);
	$mappingGML = null;
	$mappingURI1 = null;
	$mappingURI2 = null;
	$mappingURI3 = null;
	$mappingURI4 = null;
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
		} else if ($mappingHeader[$m] === 'parent_and_id_3') {
			$mappingURI3 = $m;
		} else if ($mappingHeader[$m] === 'parent_and_id_4') {
			$mappingURI4 = $m;
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

	function semanticContributor($uriDomain, $obj) {
		global $mapping, $mappingURI1, $mappingURI2, $mappingURI3, $mappingURI4, $mappingLink, $mappingType, $mappingTitle, $mappingGML, $mappingWikidata, $mappingContributor;

		$obj['contributor'] = '';
		$obj['type'] = '';
		$obj['wikidata'] = '';
		$obj['link'] = '';

		foreach($mapping as $line) {
			if (   (($line[$mappingURI1] !== '') && ($line[$mappingURI1] == $obj['uri']))
				|| (($line[$mappingURI2] !== '') && ($line[$mappingURI2] == $obj['uri']))
				|| ($line[$mappingURI3] && ($line[$mappingURI3] !== '') && ($line[$mappingURI3] == $obj['uri']))
				|| ($line[$mappingURI4] && ($line[$mappingURI4] !== '') && ($line[$mappingURI4] == $obj['uri']))
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
				|| ($line[$mappingURI3] && ($line[$mappingURI3] !== '') && ($line[$mappingURI3] == ($uriDomain . '|' . $obj['name'])))
				|| ($line[$mappingURI4] && ($line[$mappingURI4] !== '') && ($line[$mappingURI4] == ($uriDomain . '|' . $obj['name'])))
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
?>