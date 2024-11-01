<?php
	$repeatArtery = true;
	$repeatSeconds = 80;

	header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	function curl($url) {
		$headers = [
			'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:28.0) Gecko/20100101 Firefox/28.0',
		];

		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

		$ret = curl_exec($ch);
		curl_close($ch);

		return $ret;
	}

	function call($link) {
		$uri = 'https://' . $_SERVER['HTTP_HOST'] . htmlspecialchars($_SERVER['REQUEST_URI']);
		$uri = dirname($uri);
		$uri .= '/' . $link;

		$data = curl($uri);
		$json = json_decode($data);

		return $json->result == 'done';
	}

	$now = microtime(true);
	$count = 0;
	$level = 'root';

	do {
		$level = 'ckan-organizations';
		if (call('get-and-store-ckan-organizations.php')) {

			$level = 'ckan-dataset-counts';
			if (call('get-and-store-ckan-dataset-counts.php')) {

				$level = 'systems';
				if (call('get-and-store-systems.php')) {

					$level = 'providers';
					if (call('../../api/cronjob/cronjob-providers.php')) {

						$level = 'hvd';
						if (call('../../api/cronjob/cronjob-hvd.php')) {

							$level = 'monitoring';
							if (call('create-monitoring.php')) {

								$level = 'create-map';
								if (call('create-map.php')) {
									echo json_encode(array('result' => 'done'));
									return;
								}
							}
						}
					}
				}
			}
		}

		sleep(1);

		$duration = round(microtime(true) - $now, 3);
		++$count;
	} while($repeatArtery && ($duration < $repeatSeconds));

	echo json_encode(array('result' => 'in progress (' . $count . ' actions in ' . $duration . ' seconds on level `' . $level . '`)'));
?>