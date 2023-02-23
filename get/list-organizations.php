<?php
	$link = htmlspecialchars($_GET['link']);
	$groupEndpoint = '/group_list';

	if ('https://geoportal.de' === $link) {
		include 'gdide-organizations.php';
	} else if ('https://datenadler.de/publisher' === $link) {
		include 'adler-organizations.php';
	} else if ('https://www.mcloud.de/web/guest/suche/' === $link) {
		include 'mcloud-organizations.php';
	} else if ('https://www.opendata.sachsen.de' === $link) {
		include 'list-organizations/sachsen-list-organizations.php';
	} else if (substr($link, -strlen($groupEndpoint)) === $groupEndpoint) {
		include 'ckan-groups.php';
	} else {
		include 'ckan-organizations.php';
	}
?>