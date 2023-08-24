<?php
	$link = htmlspecialchars($_GET['link']);
	$piveauEndpoint = '/api/hub/search/catalogues';
	$opendatasoftEndpoint = '/api/v2/catalog/facets';

	if ('https://geoportal.de' === $link) {
		include 'gdide-count-datasets.php';
	} else if ('https://datenadler.de/publisher' === $link) {
		include 'adler-count-datasets.php';
	} else if ('https://www.mcloud.de/web/guest/suche/' === $link) {
		include 'mcloud-count-datasets.php';
	} else if ('https://www.opendata.sachsen.de' === $link) {
		include 'count-datasets/sachsen-count-datasets.php';
	} else if (substr($link, -strlen($piveauEndpoint)) === $piveauEndpoint) {
		include 'count-datasets/piveau-count-datasets.php';
	} else if (substr($link, -strlen($opendatasoftEndpoint)) === $opendatasoftEndpoint) {
		include 'count-datasets/opendatasoft-count-datasets.php';
	} else {
		include 'ckan-count-datasets.php';
	}
?>