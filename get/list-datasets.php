<?php
	$link = htmlspecialchars($_GET['link']);
	$piveauEndpoint = '/api/hub/search/catalogues';
	$opendatasoftEndpoint = '/api/v2/catalog/facets';
	$opendatasoftEndpoint2_0 = '/api/explore/v2.0/catalog/facets';
	$opendatasoftEndpoint2_1 = '/api/explore/v2.1/catalog/facets';

/*	if ('https://geoportal.de' === $link) {
		include 'gdide-organizations.php';
	} else if ('https://datenadler.de/publisher' === $link) {
		include 'adler-organizations.php';
	} else if ('https://www.mcloud.de/web/guest/suche/' === $link) {
		include 'mcloud-organizations.php';
	} else if ('https://www.opendata.sachsen.de' === $link) {
		include 'list-datasets/sachsen-list-datasets.php';
	} else if ('https://ckan.open.nrw.de/api/3/action/organization_list' === $link) {
		// for bug in NRW
		include 'list-datasets/nrw-list-datasets.php';
	} else */ if (substr($link, -strlen($piveauEndpoint)) === $piveauEndpoint) {
		include 'list-datasets/piveau-list-datasets.php';
/*	} else if ((substr($link, -strlen($opendatasoftEndpoint)) === $opendatasoftEndpoint) || (substr($link, -strlen($opendatasoftEndpoint2_0)) === $opendatasoftEndpoint2_0) || (substr($link, -strlen($opendatasoftEndpoint2_1)) === $opendatasoftEndpoint2_1)) {
		include 'list-datasets/opendatasoft-list-datasets.php';*/
	} else {
		include 'list-datasets/ckan-list-datasets.php';
	}
?>