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

    $xml = file_get_contents($endpoint . urlencode($sparql));

	$start = stripos($xml, '<binding name="datasets">');
	$end = stripos($xml, '</binding>', $start);
	$length = $end - $start;

	$xml = substr($xml, $start, $length);

	$start = stripos($xml, '<literal', 1);
	$start = stripos($xml, '>', $start) + 1;
	$end = stripos($xml, '</literal>', $start);
	$length = $end - $start;

	$xmlValue = substr($xml, $start, $length);

	echo $xmlValue;
?>