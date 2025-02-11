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
		$uri .= '/datasets/count?link=' . urlencode($link);

		$data = curl($uri);
		$json = json_decode($data);

		if ($json->error) {
			$json = null;
		} else {
			$json = $json->number;
		}

		return $json;
	}

	function getNextData($data) {
		foreach ($data as &$organization) {
			$link = $organization->link;
			$datasetCountTimestamp = $organization->datasetCountTimestamp;

			if (!empty($link) && is_null($datasetCountTimestamp)) {
				$now = microtime(true);
				$organization->datasetCount = getCKANData($link);
				$organization->datasetCountDuration = round(microtime(true) - $now, 3);
				$organization->datasetCountTimestamp = date('Y-m-d H:i:s');

				return $data;
			}
		}

		return $data;
	}

	$data = getWorkingData();
	$dataHash = md5(serialize($data));

	if (empty($data)) {
		echo json_encode(array('result' => 'error - no data found'));

		return;
	} else {
		$data = getNextData($data);
	}

	// do not sort (a second time)
	//usort($data, 'sortArray');

	if ($dataHash == md5(serialize($data))) {
		echo json_encode(array('result' => 'done'));
	} else {
		setWorkingData($data);

		echo json_encode(array('result' => 'in progress'));
	}
?>