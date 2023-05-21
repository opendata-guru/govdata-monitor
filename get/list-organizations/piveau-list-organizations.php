<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	include('_semantic.php');

	$piveauSuffix = '/api/hub/search/catalogues';
	$catalogSuffix = '/';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($piveauSuffix != substr($paramLink, -strlen($piveauSuffix))) {
		echo 'Parameter "link" must end with "' . $piveauSuffix . '"';
		exit;
	}

	$uri = $paramLink;
	$uriCKAN = substr($paramLink, 0, -strlen($piveauSuffix));
	$uriDomain = end(explode('/', $uriCKAN));

	$source = file_get_contents($uri);

	$data = [];

	$list = json_decode($source);

	for ($l = 1; $l < count($list); ++$l) {
		$catalogURI = $paramLink . $catalogSuffix . $list[$l];
		$source = file_get_contents($catalogURI);
		$catalog = json_decode($source);

		$title = $catalog->result->title;
		$titleLang = array_keys((array)$title)[0];
		$title = ((array)$title)[$titleLang];

		$id = $catalog->result->id;
		$count = $catalog->result->count;

		$data[] = semanticContributor($uriDomain, array(
			'id' => $id,
			'name' => $id,
			'title' => $title,
			'created' => '',
			'packages' => $count,
			'uri' => ''
		));
	}

	echo json_encode($data);
?>