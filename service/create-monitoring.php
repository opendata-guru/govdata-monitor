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
		$headers = [
			'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
		];

		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

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
				$errors[] = (object) array('object' => $system->title, 'message' => 'noLinkFound');
				continue;
			}

			$orga = [];
			foreach($organisations as $organisation) {
                if ($organisation->link === $system->link) {
					$orga[] = $organisation;
				}
			}

			if ((count($orga) === 0) && ($system->type !== 'root')) {
				$errors[] = (object) array('object' => $system->link, 'message' => 'noOrganisationFound');
				continue;
			} /* elseif (count($orga) > 1) {
				$errors[] = (object) array('object' => $system->link, 'message' => 'duplicateOrganisationEntriesFound', 'test' => $orga);
				continue;
			} */
			$theOrga = $orga[0];

			if($theOrga->datasetCount && ($theOrga->datasetCount !== '')) {
				// done
			} else {
				$errors[] = (object) array('object' => $system->link, 'message' => 'couldNotCountDatasets');
				continue;
			}

			// continue with more checks here
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

		file_put_contents($filePath, json_encode($data));
	}

	echo json_encode(array('result' => 'done'));
?>