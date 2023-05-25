<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$piveauSuffix = '/api/hub/search/catalogues';
	$piveauSearch = '/api/hub/search/openapi.yaml';
	$piveauRegistry = '/api/hub/repo/openapi.yaml';
	$piveauMQA = '/api/mqa/cache/openapi.yaml';
	$piveauSHACLMetadataValidation = '/api/mqa/shacl/openapi-shacl.yaml';
	// $piveauSPARQL = '/sparql';
	// $piveauUseCases = '/en/export-use-cases';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($piveauSuffix != substr($paramLink, -strlen($piveauSuffix))) {
		echo 'Parameter "link" must end with "' . $piveauSuffix . '"';
		exit;
	}

	$uri = $paramLink;
	$uriBase = substr($paramLink, 0, -strlen($piveauSuffix));

	function getVersion($path) {
		$yaml = file_get_contents($path);

		if ($yaml) {
			$lines = preg_split("/\r\n|\n|\r/", $yaml);
			$version = '';
			$l = 0;
			for (; $l < count($lines); ++$l) {
				$line = $lines[$l];
				if ($line === 'info:') {
					break;
				}
			}
			for (; $l < count($lines); ++$l) {
				$line = $lines[$l];
				if (0 === strpos($line, '  version:')) {
					return trim(str_replace('version:', '', $line));
				}
			}
		}

		return '';
	}

	$versionSearch = getVersion($uriBase . $piveauSearch);
	$versionRegistry = getVersion($uriBase . $piveauRegistry);
	$versionMQA = getVersion($uriBase . $piveauMQA);
	$versionSHACLMetadataValidation = getVersion($uriBase . $piveauSHACLMetadataValidation);

	if ($version !== '') {
		echo json_encode((object) array(
			'extensions' => array(
				'MQA' => $versionMQA,
				'registry' => $versionRegistry,
				'search' => $versionSearch,
				'SHACL metadata validation' => $versionSHACLMetadataValidation,
			),
			'system' => 'Piveau',
			'url' => $uriBase,
			'version' => $versionSearch,
		));
	} else {
		echo 'error';
	}
?>