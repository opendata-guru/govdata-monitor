<?php
	$link = htmlspecialchars($_GET['link']);
	$groupEndpoint = '/group_list';
	$piveauEndpoint = '/api/hub/search/catalogues';
	$opendatasoftEndpoint = '/api/v2/catalog/facets';
	$opendatasoftEndpoint2_0 = '/api/explore/v2.0/catalog/facets';
	$opendatasoftEndpoint2_1 = '/api/explore/v2.1/catalog/facets';

	if ('https://geoportal.de' === $link) {
		include 'list-organizations/gdide-list-organizations.php';
	} else if ('https://datenadler.de/publisher' === $link) {
		include 'list-organizations/adler-list-organizations.php';
	} else if ('https://www.mcloud.de/web/guest/suche/' === $link) {
		include 'list-organizations/mcloud-list-organizations.php';
	} else if ('https://www.opendata.sachsen.de' === $link) {
		include 'list-organizations/sachsen-list-organizations.php';
	} else if ('https://ckan.open.nrw.de/api/3/action/organization_list' === $link) {
		// for bug in NRW
		include 'list-organizations/nrw-list-organizations.php';
	} else if (substr($link, -strlen($groupEndpoint)) === $groupEndpoint) {
		include 'list-organizations/ckan-list-groups.php';
	} else if (substr($link, -strlen($piveauEndpoint)) === $piveauEndpoint) {
		include 'list-organizations/piveau-list-organizations.php';
	} else if ((substr($link, -strlen($opendatasoftEndpoint)) === $opendatasoftEndpoint) || (substr($link, -strlen($opendatasoftEndpoint2_0)) === $opendatasoftEndpoint2_0) || (substr($link, -strlen($opendatasoftEndpoint2_1)) === $opendatasoftEndpoint2_1)) {
		include 'list-organizations/opendatasoft-list-organizations.php';
	} else {
		include 'list-organizations/ckan-list-organizations.php';
	}
?>