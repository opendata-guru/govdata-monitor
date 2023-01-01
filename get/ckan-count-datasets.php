<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$orgaListSuffix = '/api/3/action/organization_list';
	$orgaShowSuffix = '/api/3/action/package_search?rows=1&start=0';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($orgaListSuffix != substr($paramLink, -strlen($orgaListSuffix))) {
		echo 'Parameter "link" must end wirh "' . $orgaListSuffix . '"';
		exit;
	}

	$uriCKAN = substr($paramLink, 0, -strlen($orgaListSuffix));

	$json = json_decode(file_get_contents($uriCKAN . $orgaShowSuffix));
	echo $json->result->count;
?>