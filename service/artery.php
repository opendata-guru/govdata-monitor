<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	function curl($url) {
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

		$ret = curl_exec($curl);
		curl_close($curl);

		return $ret;
	}

	function call($link) {
		$uri = 'https://' . $_SERVER[HTTP_HOST] . htmlspecialchars($_SERVER[REQUEST_URI]);
		$uri = dirname($uri);
		$uri .= '/' . $link;

		$data = curl($uri);
		$json = json_decode($data);

		return $json->result == 'done';
	}

	if (call('get-and-store-ckan-organizations.php')) {
		if (call('get-and-store-ckan-dataset-counts.php')) {
			echo json_encode(array('result' => 'done'));
			return;
		}
	}

	echo json_encode(array('result' => 'in progress'));
?>