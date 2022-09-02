<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');

	$xml = file_get_contents('https://ckan.govdata.de/catalog.rdf');

	$start = stripos($xml, '<hydra:PagedCollection');
	$end = stripos($xml, '</hydra:PagedCollection>', $start);
	$length = $end - $start;

	$xml = substr($xml, $start, $length);

	$start = stripos($xml, '<hydra:totalItems', 1);
	$start = stripos($xml, '>', $start) + 1;
	$end = stripos($xml, '</hydra:totalItems>', $start);
	$length = $end - $start;

	$xmlSection = substr($xml, $start, $length);

	echo $xmlSection;
?>