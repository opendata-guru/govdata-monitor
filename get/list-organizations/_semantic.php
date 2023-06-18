<?php
	$mappingTitle = 0;
	$mappingContributor = 1;
	$mappingType = 2;
	$mappingGML = 3;
	$mappingWikidata = 4;
	$mappingLink = 5;
	$mappingURI1 = 6;
	$mappingURI2 = 7;
	$mappingURI3 = 8;
	$mappingURI4 = 9;
	$mapping = [];

	loadMappingFile('../data/opendataportals.csv', $mapping);
	loadMappingFile('../data/opendataportals.at.csv', $mapping);
	loadMappingFile('../data/opendataportals.ch.csv', $mapping);

	function loadMappingFile($file, &$mapping) {
		$idGML = null;
		$idURI1 = null;
		$idURI2 = null;
		$idURI3 = null;
		$idURI4 = null;
		$idLink = null;
		$idType = null;
		$idTitle = null;
		$idWikidata = null;
		$idContributor = null;

		$lines = explode("\n", file_get_contents($file));
		$mappingHeader = explode(',', $lines[0]);

		for ($m = 0; $m < count($mappingHeader); ++$m) {
			if ($mappingHeader[$m] === 'parent_and_id_1') {
				$idURI1 = $m;
			} else if ($mappingHeader[$m] === 'parent_and_id_2') {
				$idURI2 = $m;
			} else if ($mappingHeader[$m] === 'parent_and_id_3') {
				$idURI3 = $m;
			} else if ($mappingHeader[$m] === 'parent_and_id_4') {
				$idURI4 = $m;
			} else if ($mappingHeader[$m] === 'title') {
				$idTitle = $m;
			} else if ($mappingHeader[$m] === 'url') {
				$idContributor = $m;
			} else if ($mappingHeader[$m] === 'type') {
				$idType = $m;
			} else if ($mappingHeader[$m] === 'gml') {
				$idGML = $m;
			} else if ($mappingHeader[$m] === 'wikidata') {
				$idWikidata = $m;
			} else if ($mappingHeader[$m] === 'api_list_children') {
				$idLink = $m;
			}
		}

		array_shift($lines);
		foreach($lines as $line) {
			if ($line != '') {
				$arr = explode(',', $line);
				$mapping[] = [
					$arr[$idTitle] ?: '',
					$arr[$idContributor] ?: '',
					$arr[$idType] ?: '',
					$arr[$idGML] ?: '',
					$arr[$idWikidata] ?: '',
					$arr[$idLink] ?: '',
					$arr[$idURI1] ?: '',
					$arr[$idURI2] ?: '',
					$arr[$idURI3] ?: '',
					$arr[$idURI4] ?: ''
				];
			}
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

	function semanticGetAllPortals() {
		global $mapping, $mappingLink, $mappingType, $mappingTitle, $mappingGML, $mappingWikidata, $mappingContributor;

		$ret = [];

		foreach($mapping as $line) {
			if ($line[$mappingLink] && ($line[$mappingLink] !== '')) {
				$obj = [];
				$obj['title'] = $line[$mappingTitle];
				$obj['contributor'] = $line[$mappingContributor];
				$obj['type'] = $line[$mappingType];
				$obj['gml'] = $line[$mappingGML];
				$obj['wikidata'] = $line[$mappingWikidata];
				$obj['link'] = $line[$mappingLink];

				$ret[] = $obj;
			}
		}

		return $ret;
	}
?>