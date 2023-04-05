<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$searchUri = 'https://www.mcloud.de/web/guest/suche/';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($searchUri != substr($paramLink, -strlen($searchUri))) {
		echo 'Parameter "link" must end with "' . $searchUri . '"';
		exit;
	}

	$source = file_get_contents($searchUri);

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
	$start = stripos($html, 'Datenanbieter');
	$end = stripos($html, '</li>', $start);
	$length = $end - $start;
	$html = substr($html, $start, $length);
	$list = explode('control__indicator', $html);

	for ($l = 1; $l < count($list); ++$l) {
		$html = $list[$l];
		$html = explode('</div>', $html)[1];
		$title = trim(explode('<', $html)[0]);
		$html = explode('<', $html)[1];
		$html = explode('>', $html)[1];
		$html = explode('(', $html)[1];
		$packages = intval($html);

		$name = preg_replace('#[^a-z0-9]#i', '', $title);
		$data[] = semanticContributor(array(
			'id' => $name,
			'name' => $name,
			'title' => $title,
			'created' => '',
			'packages' => $packages,
			'uri' => ''
		));
	}

	echo json_encode($data);
?>