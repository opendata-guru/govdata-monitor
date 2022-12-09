<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$filePath = '../assets/organizations.temp.json';

	function getWorkingData() {
		global $filePath;

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

	function getCKANData() {
		$uri = '../get/ckan-organizations.php';

		ob_start();
		include $uri;
		return json_decode(ob_get_clean());
	}

	function getStartData() {
		$data = array();

		$data[] = array(
			'id' => 'govdata.de',
			'name' => 'govdata',
			'title' => 'GovData',
			'created' => '',
			'packages' => '',
			'contributor' => '',
			'type' => 'root',
			'link' => 'https://ckan.govdata.de/api/3/action/organization_list',
		);

		return $data;
	}

	function getNextData($data) {
/*		$data[] = array(
			'id' => 'next',
		);*/

		return $data;
	}

//	$data = getCKANData();
//	var_dump($data);

	$data = getWorkingData();
	if (empty($data)) {
		$data = getStartData();
	} else {
		$data = getNextData($data);
	}
	setWorkingData($data);

	var_dump($data);
?>