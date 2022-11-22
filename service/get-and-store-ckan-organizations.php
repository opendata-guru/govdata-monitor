<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

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
			'type' => 'start',
			'link' => 'https://ckan.govdata.de/api/3/action/organization_list',
		);

		return $data;
	}

	function getWorkingData() {
		$workingFile = '../assets/organizationa.temp.json';
		$data = json_decode(file_get_contents($workingFile));

		if (is_null($data)) {
			$data = getStartData();
		}
		return $data;
	}

//	$data = getCKANData();
//	var_dump($data);

	$data = getWorkingData();
	var_dump($data);

$data = 'hello world';
	echo json_encode($data);
?>