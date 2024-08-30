<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$filePath = '../assets/map-' . date('Y') . '/' . date('Y-m-d') . '-de.geojson';

	function curl($url) {
		$headers = [
			'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:28.0) Gecko/20100101 Firefox/28.0',
		];

		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

		$ret = curl_exec($curl);
		curl_close($curl);

		return $ret;
	}

	function getGeoJSON($param) {
		$headers = [
			'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:28.0) Gecko/20100101 Firefox/28.0',
		];

		$uri = 'https://' . $_SERVER['HTTP_HOST'] . htmlspecialchars($_SERVER['REQUEST_URI']);
		$uri = dirname(dirname($uri));

		$encodedParams = str_replace('%2C', ',', urlencode($param));
		$uri .= '/get/rs-to-geojson.php';

		$ch = curl_init();

		curl_setopt($ch, CURLOPT_URL, $uri);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, 'rs=' . $encodedParams);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

		$ret = curl_exec($ch);

		curl_close($ch);

		return $ret;
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
		$uri = 'https://opendata.guru/api/2';
		$uri .= '/data-providers';

		$data = curl($uri);
		$json = json_decode($data);

		$ret = [];

		foreach($json as $line) {
			if ($line->rs) {
				$ret[] = $line->rs;
			}
			if ($line->associated_rs) {
				$ret[] = $line->associated_rs;
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