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
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

		$ret = curl_exec($curl);
		curl_close($curl);

		return $ret;
	}

	function getCKANData($link) {
		$uri = 'https://' . $_SERVER[HTTP_HOST] . htmlspecialchars($_SERVER[REQUEST_URI]);
		$uri = dirname(dirname($uri));
		$uri .= '/get/ckan-organizations.php?link=' . urlencode($link);

		$data = curl($uri);
		return json_decode($data);
	}

	function getStartData() {
		$data = array();

		$data[] = array(
			'id' => 'govdata.de',
			'name' => 'govdata',
			'title' => 'GovData',
			'created' => '',
			'packages' => '',
			'contributor' => '',
			'type' => 'root',
			'link' => 'https://ckan.govdata.de/api/3/action/organization_list',
		);

		return $data;
	}

	function getLinkData($data, $link) {
		$processData = getCKANData($link);
		var_dump($processData);

		foreach($processData as $newOrga) {
			$found = false;
			foreach($data as $existingOrga) {
				if ($newOrga->id == $existingOrga->id) {
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
				$data = getLinkData($data, $link);
				$organization->linkDuration = round(microtime(true) - $now, 3);
				$organization->linkTimestamp = date('Y-m-d H:i:s');

				return $data;
			}
		}

		return $data;
	}

	function sortArray($a, $b) {
		if ($a->packages == $b->packages) {
			return 0;
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
		echo 'No updates';
	} else {
		setWorkingData($data);

		var_dump($data);
	}
?>