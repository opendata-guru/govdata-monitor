<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$filePath = '../assets/monitoring-' . date('Y') . '/' . date('Y-m-d') . '.json';

	$basePath = 'https://opendata.guru/govdata';
	$systemsPath = $basePath . '/assets/data-' . date('Y') . '/' . date('Y-m-d') . '-systems.json';
	$organisationPath = $basePath . '/assets/data-' . date('Y') . '/' . date('Y-m-d') . '-organizations.json';
	$errors = array();

	function curl($url) {
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

		$ret = curl_exec($curl);
		curl_close($curl);

		return $ret;
	}

	function getSystems() {
		global $systemsPath;

		return json_decode(curl($systemsPath));
	}

	function getOrganisations() {
		global $organisationPath;

		return json_decode(curl($organisationPath));
	}

	function analyseSystems($systems, $organisations) {
		global $errors;

		foreach($systems as $system) {
			if($system->link && ($system->link !== '')) {
				// done
			} else {
				$errors.push((object) array('object' => $system->title, 'message' => 'noLinkFound'));
				continue;
			}

			foreach($organisations as $organisation) {
                if ($organisation->link === $system->link) {
					var_dump($system->link, $organisation->datasetCount);
				}
			}
		}
	}

	$dir = dirname($filePath);
	mkdir($dir, 0777, true);

	if (!file_exists($filePath)) {
		$systems = getSystems();
		$organisations = getOrganisations();

		analyseSystems($systems, $organisations);

		$data = (object) array(
			'errors' => $errors,
		);
var_dump($data);
exit;

		file_put_contents($filePath, $data);
	}

	echo json_encode(array('result' => 'done'));
?>