<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$filePath = '../assets/data-' . date('Y') . '/' . date('Y-m-d') . '-organizations.json';

	function getWorkingData() {
		global $filePath;

		$dir = dirname($filePath);
		mkdir($dir, 0777, true);

		$data = json_decode(file_get_contents($filePath));

		if (is_null($data)) {
			$data = array();
		}
		return $data;
	}

	function setWorkingData($data) {
		global $filePath;

		file_put_contents($filePath, json_encode($data));
	}

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

	function getCKANData($link) {
		$uri = 'https://opendata.guru/api/2';
		$uri .= '/suppliers?link=' . urlencode($link);

		$data = curl($uri);
		$json = json_decode($data);

		if ($json->error) {
			$json = null;
		}

		return $json;
	}

	function getStartData() {
		$data = array();

		/*$data[] = array(
			'id' => 'govdata.de',
			'name' => 'govdata',
			'title' => 'GovData',
			'created' => '',
			'packages' => '',
			'packagesInId' => '',
			'packagesInPortal' => '',
			'contributor' => '',
			'type' => 'root',
			'wikidata' => 'Q59273239',
			'link' => 'https://ckan.govdata.de/api/3/action/organization_list',
		);*/
		$data[] = array(
			'id' => 'data.europa.eu',
			'name' => 'data.europa.eu',
			'title' => '🇪🇺 data.europa',
			'created' => '',
			'packages' => '',
			'packagesInId' => '',
			'packagesInPortal' => '',
			'contributor' => '',
			'type' => 'root',
			'wikidata' => 'Q458',
			'link' => 'https://data.europa.eu/api/hub/search/catalogues',
		);

		return $data;
	}

	function getLinkData($data, $link, $portalId, $portalTitle) {
		$processData = getCKANData($link);

		foreach($processData as $newOrga) {
			$newOrga->packagesInId = $portalId;
			$newOrga->packagesInPortal = $portalTitle;
			$found = false;

			foreach($data as $existingOrga) {
				if ($newOrga->id == $existingOrga->id) {
//				if (($newOrga->id == $existingOrga->id) && ($newOrga->packagesInPortal == $existingOrga->packagesInPortal)) {
					$found = true;
					break;
				}
			}

			if ($found == false) {
				$data[] = $newOrga;
			}
		}

		return $data;
	}

	function getNextData($data) {
		foreach ($data as &$organization) {
			$link = $organization->link;
			$linkTimestamp = $organization->linkTimestamp;

			if (!empty($link) && is_null($linkTimestamp)) {
				$now = microtime(true);
				$data = getLinkData($data, $link, $organization->id, $organization->title);
				$organization->linkDuration = round(microtime(true) - $now, 3);
				$organization->linkTimestamp = date('Y-m-d H:i:s');

				return $data;
			}
		}

		return $data;
	}

	function sortArray($a, $b) {
		if ($a->packages == $b->packages) {
			if ($a->title == $b->title) {
				if ($a->id == $b->id) {
					return 0;
				}
				return ($a->id < $b->id) ? -1 : 1;
			}
			return ($a->title < $b->title) ? -1 : 1;
		}
		return ($a->packages > $b->packages) ? -1 : 1;
	}

	$data = getWorkingData();
	$dataHash = md5(serialize($data));

	if (empty($data)) {
		$data = getStartData();
	} else {
		$data = getNextData($data);
	}
	usort($data, 'sortArray');

	if ($dataHash == md5(serialize($data))) {
		echo json_encode(array('result' => 'done'));
	} else {
		setWorkingData($data);

		echo json_encode(array('result' => 'in progress'));
	}
?>