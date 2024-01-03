<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$arcGISHubSuffix = '.arcgis.com/';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($arcGISHubSuffix != substr($paramLink, -strlen($arcGISHubSuffix))) {
		echo 'Parameter "link" must end with "' . $arcGISHubSuffix . '"';
		exit;
	}

	$baseURI = substr($paramLink, 0, -strlen($arcGISHubSuffix));

	function get_contents($url){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, $url);
		$data = curl_exec($ch);
		curl_close($ch);

		return $data;
	}

	function getVersion($str) {
		$str = strstr($str, 'opendata-ui version');
		$str = strstr($str, ':');
		$str = strstr($str, '-->', true);

		return trim(trim($str, ':'));
	}

//	$html = file_get_contents($_GET['link']);
	$html = get_contents($_GET['link']);

	if ($html) {
		echo json_encode((object) array(
			'extensions' => null,
			'system' => 'ArcGIS Hub',
			'url' => null,
			'version' => getVersion($html),
		));
	} else {
		echo 'error';
	}
?>