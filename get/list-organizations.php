<?php
	$link = htmlspecialchars($_GET['link']);
	$groupEndpoint = '/group_list';
	$piveauEndpoint = '/api/hub/search/catalogues';

	if ('https://geoportal.de' === $link) {
		include 'list-organizations/gdide-list-organizations.php';
	} else if ('https://datenadler.de/publisher' === $link) {
		include 'adler-organizations.php';
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
	} else {
		include 'list-organizations/ckan-list-organizations.php';
	}
?>