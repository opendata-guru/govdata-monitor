<?php
	$link = htmlspecialchars($_GET['link']);
	$piveauEndpoint = '/api/hub/search/catalogues';
	$opendatasoftEndpoint = '/api/v2/catalog/facets';

/*	if ('https://geoportal.de' === $link) {
		include 'gdide-organizations.php';
	} else if ('https://datenadler.de/publisher' === $link) {
		include 'adler-organizations.php';
	} else if ('https://www.mcloud.de/web/guest/suche/' === $link) {
		include 'mcloud-organizations.php';
	} else if ('https://www.opendata.sachsen.de' === $link) {
		include 'list-organizations/sachsen-list-organizations.php';
	} else if ('https://ckan.open.nrw.de/api/3/action/organization_list' === $link) {
		// for bug in NRW
		include 'list-organizations/nrw-list-organizations.php';
	} else */ if (substr($link, -strlen($piveauEndpoint)) === $piveauEndpoint) {
		include 'system-status/piveau-system-status.php';
	} else if (substr($link, -strlen($opendatasoftEndpoint)) === $opendatasoftEndpoint) {
		include 'system-status/opendatasoft-system-status.php';
	} else {
		include 'system-status/ckan-system-status.php';
	}
?>