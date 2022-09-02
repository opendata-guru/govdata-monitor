<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');

	$endpoint = 'https://www.govdata.de/sparql?query=';
	$sparql = '
		PREFIX dcat: <http://www.w3.org/ns/dcat#>
		SELECT (COUNT(?dataset) AS ?datasets) WHERE {
		  ?dataset a dcat:Dataset .
		}
	';

	$opts = [
		"http" => [
			"method" => "GET",
			"header" => "Accept: application/sparql-results+json,*/*;q=0.9\r\n"
		]
	];
	$context = stream_context_create($opts);

	$json = json_decode(file_get_contents($endpoint . urlencode($sparql), false, $context));
	echo $json->results->bindings[0]->datasets->value;
?>