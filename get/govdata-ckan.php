<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');

	$json = json_decode(file_get_contents('https://ckan.govdata.de/api/3/action/package_list'));
	echo count($json->result);
?>