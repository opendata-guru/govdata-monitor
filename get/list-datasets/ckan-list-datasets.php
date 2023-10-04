<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$orgaListSuffix = '/api/3/action/organization_list';
	$orgaShowSuffix = '/api/3/action/organization_show?include_dataset_count=false&include_datasets=true&include_extras=false&include_followers=false&include_groups=false&include_tags=false&include_users=false&id=';
	$packListSuffix = '/api/3/action/package_list';

	$paramLink = htmlspecialchars($_GET['link']);
	$paramId = htmlspecialchars($_GET['id']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($orgaListSuffix != substr($paramLink, -strlen($orgaListSuffix))) {
		echo 'Parameter "link" must end with "' . $orgaListSuffix . '"';
		exit;
	}

	$uriCKAN = substr($paramLink, 0, -strlen($orgaListSuffix));

	if ($paramId === '') {
		$uri = $uriCKAN . $packListSuffix;
		$json = json_decode(file_get_contents($uri));
		echo json_encode($json->result);
	} else {
		$uri = $uriCKAN . $orgaShowSuffix . $paramId;
		$json = json_decode(file_get_contents($uri));

		$data = [];

		foreach($json->result->packages as $dataset) {
//			$data[] = $dataset->id;
			$data[] = $dataset->name;
		}

		echo json_encode($data);
	}
?>