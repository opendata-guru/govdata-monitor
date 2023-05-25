<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$orgaListSuffix = '/api/3/action/organization_list';
	$groupListSuffix = '/api/3/action/group_list';
	$statusShowSuffix = '/api/3/action/status_show';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if (($orgaListSuffix != substr($paramLink, -strlen($orgaListSuffix))) && ($groupListSuffix != substr($paramLink, -strlen($groupListSuffix)))) {
		echo 'Parameter "link" must end wirh "' . $orgaListSuffix . '"';
		exit;
	}

	if ($orgaListSuffix == substr($paramLink, -strlen($orgaListSuffix))) {
		$uriCKAN = substr($paramLink, 0, -strlen($orgaListSuffix));
	} else {
		$uriCKAN = substr($paramLink, 0, -strlen($groupListSuffix));
	}

	$json = json_decode(file_get_contents($uriCKAN . $statusShowSuffix));

	if ($json) {
		echo json_encode((object) array(
			'extensions' => $json->result->extensions,
			'system' => 'CKAN',
			'url' => $json->result->site_url,
			'version' => $json->result->ckan_version,
		));
	} else {
		echo 'error';
	}
?>