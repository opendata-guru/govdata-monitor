<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$entryScapeSuffix = '/store/';

	$versionHackSuffix = '/theme/local.js';
	$statusSuffix = '/store/management/status';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($entryScapeSuffix != substr($paramLink, -strlen($entryScapeSuffix))) {
		echo 'Parameter "link" must end with "' . $entryScapeSuffix . '"';
		exit;
	}

	$baseURI = substr($paramLink, 0, -strlen($entryScapeSuffix));

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

		$ret = [];

		if ($str) {
			$arr = explode(',', $str);

			foreach($arr as $item) {
				$ret[] = trim(trim(trim($item), '\''), '"');
			}
		}

		return $ret;
	}

	function getDefaultBundles($str) {
		$str = strstr($str, 'itemstore');
		$str = strstr($str, '!defaultBundles');
		$str = ltrim(strstr($str, '['), '[');
		$str = strstr($str, ']', true);

		$ret = [];

		if ($str) {
			$arr = explode(',', $str);

			foreach($arr as $item) {
				if ('//' === substr(trim($item), 0, 2)) {
					$lines = explode("\n", $item);
					foreach($lines as $line) {
						$line = trim($line);
						if ($line && ('//' !== substr($line, 0, 2))) {
							$ret[] = trim(trim(trim($line), '\''), '"');
						}
					}
					// nope
				} else {
					$item = trim($item);
					if ($item) {
						$ret[] = trim(trim($item, '\''), '"');
					}
				}
			}
		}

		return $ret;
	}
//	$js = file_get_contents($baseURI . $versionHackSuffix);
	$js = get_contents($baseURI . $versionHackSuffix);

	if ($js) {
		echo json_encode((object) array(
			'extensions' => array_merge(getDefaultBundles($js), getBundles($js)),
			'system' => 'entryscape',
			'url' => getEntryStore($js),
			'version' => getVersion($js),
		));
	} else {
		echo 'error';
	}
?>