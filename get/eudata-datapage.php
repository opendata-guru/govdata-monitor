<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');

	$json = json_decode(file_get_contents('https://data.europa.eu/api/hub/search/search?filter=dataset&limit=1&dataServices=false&includes=id,title.de&facets={%22catalog%22:[%22govdata%22]}'));
	echo $json->result->count;
?>