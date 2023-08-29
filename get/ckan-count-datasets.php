<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$orgaListSuffix = '/api/3/action/organization_list';
	$groupListSuffix = '/api/3/action/group_list';
	$packageShowSuffix = '/api/3/action/package_search?rows=1&start=0';
	$packageShowAllSuffix = '/api/3/action/package_search';
	$resourcesShowSuffix = '/api/3/action/current_package_list_with_resources?limit=1000';
	$countWebsiteSuffix = '/search';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if (($orgaListSuffix != substr($paramLink, -strlen($orgaListSuffix))) && ($groupListSuffix != substr($paramLink, -strlen($groupListSuffix)))) {
		echo 'Parameter "link" must end wirh "' . $orgaListSuffix . '"';
		exit;
	}

	function scrapeWebsite($uriCKAN) {
		global $countWebsiteSuffix;

		$uri = $uriCKAN . $countWebsiteSuffix;
		$source = file_get_contents($uri);

		$html = $source;
		$start = stripos($html, 'view-header');
		$end = stripos($html, '</div>', $start);
		$length = $end - $start;
		$html = trim(substr($html, $start, $length));
		$html = explode(' ', $html);
		$packageCount = $html[count($html) - 2];

		return intval($packageCount);
	}

	if ($orgaListSuffix == substr($paramLink, -strlen($orgaListSuffix))) {
		$uriCKAN = substr($paramLink, 0, -strlen($orgaListSuffix));
	} else {
		$uriCKAN = substr($paramLink, 0, -strlen($groupListSuffix));
	}

	$json = json_decode(file_get_contents($uriCKAN . $packageShowSuffix));

	if ($json) {
		echo $json->result->count;
	} else {
		$json = json_decode(file_get_contents($uriCKAN . $packageShowAllSuffix));

		if ($json) {
			echo $json->result->count;
		} else {
			$json = json_decode(file_get_contents($uriCKAN . $resourcesShowSuffix));

			if ($json) {
				echo count($json->result[0]);
			} else {
				echo scrapeWebsite($uriCKAN);
			}
		}
	}
?>