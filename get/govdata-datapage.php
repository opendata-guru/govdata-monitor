<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header("Access-Control-Allow-Headers: X-Requested-With");

    $html = file_get_contents('https://www.govdata.de/web/guest/daten');

	$start = stripos($html, 'hitscount');
	$end = stripos($html, '</h2>', $start);
	$length = $end - $start;

	$html = substr($html, $start, $length);

	$start = stripos($html, 'hitscount', 1);
	$start = stripos($html, '>', $start) + 1;
	$end = stripos($html, '</span>', $start);
	$length = $end - $start;

	$htmlSection = substr($html, $start, $length);

	echo $htmlSection;
?>