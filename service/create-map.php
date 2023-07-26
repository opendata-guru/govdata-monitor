<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	include('../get/list-organizations/_semantic.php');

	$filePath = '../assets/map-' . date('Y') . '/' . date('Y-m-d') . '-de.geojson';

	function curl($url) {
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

		$ret = curl_exec($curl);
		curl_close($curl);

		return $ret;
	}

	function getGeoJSON($param) {
		$uri = 'https://' . $_SERVER[HTTP_HOST] . htmlspecialchars($_SERVER[REQUEST_URI]);
		$uri = dirname(dirname($uri));

		$uri .= '/get/rs-to-geojson.php?rs=' . urlencode($param);

		return curl($uri);
	}

	function sortRS($a, $b) {
		if (strlen($a) == strlen($b)) {
			if ($a == $b) {
				return 0;
			}
			return ($a < $b) ? -1 : 1;
		}
		return (strlen($a) < strlen($b)) ? -1 : 1;
	}

	function getRSList() {
		global $mapping, $mappingRS, $mappingAssociatedRS;

		$ret = [];

		foreach($mapping as $line) {
			if ($line[$mappingRS]) {
				$ret[] = $line[$mappingRS];
			}
			if ($line[$mappingAssociatedRS]) {
				$ret[] = $line[$mappingAssociatedRS];
			}
		}

		$ret = array_unique($ret);
		return $ret;
	}

	$dir = dirname($filePath);
	mkdir($dir, 0777, true);

	if (!file_exists($filePath)) {
		$rs = getRSList();
		usort($rs, 'sortRS');

		$param = implode(',', $rs);
		$data = getGeoJSON($param);

		file_put_contents($filePath, $data);
	}

	echo json_encode(array('result' => 'done'));
?>