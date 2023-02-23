<?php
	$link = htmlspecialchars($_GET['link']);

	if ('https://geoportal.de' === $link) {
		include 'gdide-count-datasets.php';
	} else if ('https://datenadler.de/publisher' === $link) {
		include 'adler-count-datasets.php';
	} else if ('https://www.mcloud.de/web/guest/suche/' === $link) {
		include 'mcloud-count-datasets.php';
	} else if ('https://www.opendata.sachsen.de' === $link) {
		include 'count-datasets/sachsen-count-datasets.php';
	} else {
		include 'ckan-count-datasets.php';
	}
?>