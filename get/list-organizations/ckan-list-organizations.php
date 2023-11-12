<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	include('_semantic.php');

	$orgaListSuffix = '/api/3/action/organization_list';
	$orgaShowSuffix = '/api/3/action/organization_show?id=';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($orgaListSuffix != substr($paramLink, -strlen($orgaListSuffix))) {
		echo 'Parameter "link" must end with "' . $orgaListSuffix . '"';
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

	$uriCKAN = substr($paramLink, 0, -strlen($orgaListSuffix));
	$uri = $paramLink;
//	$uriDomain = end(explode('/',$uriCKAN));
	$uriDomain = explode('/',$uriCKAN)[2];
//	$json = json_decode(file_get_contents($uri));
	$json = json_decode(get_contents($uri));

	$data = [];

	foreach($json->result as $orgaID) {
		$uri = $uriCKAN . $orgaShowSuffix;
//		$json = json_decode(file_get_contents($uri . $orgaID));
		$json = json_decode(get_contents($uri . $orgaID));
		$uris = json_decode($json->result->extras[0]->value);
		$title = $json->result->title;

		if (is_object($title)) {
			if ($title->en && ($title->en !== '')) {
				$title = $title->en;
			} else {
				foreach(get_object_vars($title) as $val) {
					$title = $val ?: $title;
				}
			}
		}

		$data[] = semanticContributor($uriDomain, array(
			'id' => $json->result->id,
			'name' => $json->result->name,
			'title' => $title,
			'created' => $json->result->created,
			'packages' => $json->result->package_count,
			'uri' => (!is_null($uris) && is_array($uris)) ? $uris[0] : ''
		));
	}

	echo json_encode($data);
?>