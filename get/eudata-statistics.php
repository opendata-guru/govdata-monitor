<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');

	$json = json_decode(file_get_contents('https://data.europa.eu/api/hub/statistics/data/ds-per-country-and-catalogue'));
	foreach($json->result as $catalog) {
		if ($catalog->name === 'GovData') {
			$len = count($catalog->stats);
			echo $catalog->stats[$len - 1]->count;
		}
	}
?>