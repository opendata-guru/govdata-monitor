<?php
	$link = htmlspecialchars($_GET['link']);
	$piveauEndpoint = '/api/hub/search/catalogues';
	$entryScapeSuffix = '/store/';
	$opendatasoftEndpoint = '/api/v2/catalog/facets';
	$opendatasoftEndpoint2_0 = '/api/explore/v2.0/catalog/facets';
	$opendatasoftEndpoint2_1 = '/api/explore/v2.1/catalog/facets';

/*	if ('https://geoportal.de' === $link) {
		include 'gdide-organizations.php';
	} else if ('https://datenadler.de/publisher' === $link) {
		include 'adler-organizations.php';
	} else if ('https://www.mcloud.de/web/guest/suche/' === $link) {
		include 'mcloud-organizations.php';
	} else */ if (substr($link, -strlen($entryScapeSuffix)) === $entryScapeSuffix) {
		include 'system-status/entryscape-system-status.php';
/*	} else if ('https://ckan.open.nrw.de/api/3/action/organization_list' === $link) {
		// for bug in NRW
		include 'list-organizations/nrw-list-organizations.php'; */
	} else if (substr($link, -strlen($piveauEndpoint)) === $piveauEndpoint) {
		include 'system-status/piveau-system-status.php';
	} else if ((substr($link, -strlen($opendatasoftEndpoint)) === $opendatasoftEndpoint) || (substr($link, -strlen($opendatasoftEndpoint2_0)) === $opendatasoftEndpoint2_0) || (substr($link, -strlen($opendatasoftEndpoint2_1)) === $opendatasoftEndpoint2_1)) {
		include 'system-status/opendatasoft-system-status.php';
	} else {
		include 'system-status/ckan-system-status.php';
	}
?>