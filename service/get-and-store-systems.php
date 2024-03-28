<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	include('../get/list-organizations/_semantic.php');

	$filePath = '../assets/data-' . date('Y') . '/' . date('Y-m-d') . '-systems.json';

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

	function getSystemData($link) {
		$uri = 'https://opendata.guru/api/2';
		$uri .= '/system?link=' . urlencode($link);

		$data = curl($uri);
		$json = json_decode($data);

		if ($json->error) {
			$json = null;
		}

		return $json;
	}

	function getStartData() {
		return semanticGetAllPortals();
	}

	function getNextData($data) {
		foreach ($data as &$system) {
			$link = $system->link;
			$linkTimestamp = $system->linkTimestamp;

			if (!empty($link) && is_null($linkTimestamp)) {
				$now = microtime(true);
				$system->server = getSystemData($link);
				$system->linkDuration = round(microtime(true) - $now, 3);
				$system->linkTimestamp = date('Y-m-d H:i:s');

				return $data;
			}
		}

		return $data;
	}

	function sortArray($a, $b) {
		if ($a->title == $b->title) {
			if ($a->contributor == $b->contributor) {
				return 0;
			}
			return ($a->contributor < $b->contributor) ? -1 : 1;
		}
		return ($a->title < $b->title) ? -1 : 1;
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