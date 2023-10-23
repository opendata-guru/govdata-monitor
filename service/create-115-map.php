<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$filePath = '../assets/map-115-' . date('Y') . '/' . date('Y-m-d') . '.geojson';

	function curl($url) {
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

		$ret = curl_exec($curl);
		curl_close($curl);

		return $ret;
	}

	function getGeoJSON($rs) {
		$arrayRS = [];
		$arrayStatus = [];
		foreach ($rs as $value) {
			$arrayRS[] = $value->title;
			$arrayStatus[] = $value->properties->status;
		}
		$paramRS = implode(',', $arrayRS);
		$paramStatus = implode(',', $arrayStatus);

		$uri = 'https://' . $_SERVER[HTTP_HOST] . htmlspecialchars($_SERVER[REQUEST_URI]);
		$uri = dirname(dirname($uri));

		$params = 'rs=' . str_replace('%2C', ',', urlencode($paramRS));
		$params .= '&status=' . str_replace('%2C', ',', urlencode($paramStatus));
		$uri .= '/get/rs-to-geojson.php';

		$ch = curl_init();

		curl_setopt($ch, CURLOPT_URL, $uri);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		$ret = curl_exec($ch);

		curl_close($ch);

		return $ret;
	}

	function sortRS($a, $b) {
		if (strlen($a->title) == strlen($b->title)) {
			if ($a->title == $b->title) {
				return 0;
			}
			return ($a->title < $b->title) ? -1 : 1;
		}
		return (strlen($a->title) < strlen($b->title)) ? -1 : 1;
	}

	function load115data($file, &$mapping) {
		$idRS = null;
		$idTitle = null;
		$idStatus = null;
		$idDescription = null;
		$idParticipant = null;

		$lines = explode("\n", file_get_contents($file));
		$mappingHeader = str_getcsv($lines[0], ',');

		for ($m = 0; $m < count($mappingHeader); ++$m) {
			if ($mappingHeader[$m] === 'DSET_JOINT_sd_kreis::DSET_sd::kurzname') {
				$idTitle = $m;
			} else if ($mappingHeader[$m] === 'DSET_JOINT_sd_kreis::DSET_sd::regionkey') {
				$idRS = $m;
			} else if ($mappingHeader[$m] === 'DSET_JOINT_sd_kreis::DSET_sd::beschreibung') {
				$idDescription = $m;
			} else if ($mappingHeader[$m] === 'DSET_JOINT_sd_kreis::DSET_sd::teilnehmernummer') {
				$idParticipant = $m;
			} else if ($mappingHeader[$m] === 'DSET_JOINT_sd_kreis::DSET_sd::status') {
				$idStatus = $m;
			}
		}

		array_shift($lines);
		foreach($lines as $line) {
			if ($line != '') {
				$arr = str_getcsv($line, ',');
				$mapping[] = [
					$arr[$idTitle] ?: '',
					$arr[$idRS] ?: '',
					$arr[$idStatus] ?: '',
					$arr[$idDescription] ?: '',
					$arr[$idParticipant] ?: '',
				];
			}
		}
	}

	function getRSList() {
		$mappingTitle = 0;
		$mappingRS = 1;
		$mappingStatus = 2;
		$mappingDescription = 3;
		$mappingParticipant = 4;
		$mapping = [];

		load115data('tbd.', $mapping);

		$ret = [];

		foreach($mapping as $line) {
			if ($line[$mappingRS]) {
				$status = $line[$mappingStatus];
				if ($status === '115-Teilnehmer') {
					$ret[] = (object) [
						'title' => $line[$mappingRS],
						'properties' => (object) [
							'status' => $status
						]
					];
				} else if ($status === 'Basisabdeckung') {
					$ret[] = (object) [
						'title' => $line[$mappingRS],
						'properties' => (object) [
							'status' => $status
						]
					];
				} else if ($status === 'Kein 115-Teilnehmer') {
					// ignore me
				} else if ($status === 'Informationsbereitsteller') {
					// ignore me
				} else if ($status === 'Ungültig') {
					// ignore me
				} else if ($status === '') {
					// ignore me
				} else {
					// ignore me
//echo $line[$mappingTitle] . ' | ' . $line[$mappingDescription] . ' | ' . $line[$mappingParticipant] . ' ';
				}
			}
		}

		$ret = array_unique($ret, SORT_REGULAR);
		return $ret;
	}

	$dir = dirname($filePath);
	mkdir($dir, 0777, true);

	if (!file_exists($filePath)) {
		$rs = getRSList();
		usort($rs, 'sortRS');

		$data = getGeoJSON($rs);

		file_put_contents($filePath, $data);
	}

	echo json_encode(array('result' => 'done'));
?>