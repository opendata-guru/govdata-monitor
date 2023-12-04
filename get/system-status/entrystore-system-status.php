<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$sachsenSuffix = 'https://www.opendata.sachsen.de';
	$baseURI = 'https://register.opendata.sachsen.de';

	$versionHackSuffix = '/theme/local.js';
	$statusSuffix = '/store/management/status';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($sachsenSuffix != substr($paramLink, -strlen($sachsenSuffix))) {
		echo 'Parameter "link" must end with "' . $sachsenSuffix . '"';
		exit;
	}

	function get_contents($url){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, $url);
		$data = curl_exec($ch);
		curl_close($ch);

		return $data;
	}

	function getVersion($str) {
		$str = strstr($str, 'entryscape');
		$str = strstr($str, 'version');
		$str = strstr($str, '\'');
		$str = strstr($str, ',', true);

		return trim($str, '\'');
	}

	function getBaseUrl($str) {
		$str = strstr($str, 'baseUrl');
		$str = strstr($str, '\'');
		$str = strstr($str, ',', true);

		return trim($str, '\'');
	}

	function getEntryStore($str) {
		$str = strstr($str, 'entrystore');
		$str = strstr($str, 'repository');
		$str = strstr($str, '\'');
		$str = strstr($str, ',', true);

		return trim($str, '\'');
	}

	function getBundles($str) {
		$str = strstr($str, 'itemstore');
		$str = strstr($str, 'bundles');
		$str = ltrim(strstr($str, '['), '[');
		$str = strstr($str, ']', true);

		$arr = explode(',', $str);
		$ret = [];

		foreach($arr as $item) {
			$ret[] = trim(trim(trim($item), '\''), '"');
		}

		return $ret;
	}

//	$js = file_get_contents($baseURI . $versionHackSuffix);
	$js = get_contents($baseURI . $versionHackSuffix);

	if ($js) {
		echo json_encode((object) array(
			'extensions' => getBundles($js),
			'system' => 'entrystore',
			'url' => getEntryStore($js),
			'version' => getVersion($js),
		));
	} else {
		echo 'error';
	}
?>