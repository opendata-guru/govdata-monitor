<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	include('_semantic.php');

	$sachsenSuffix = 'https://www.opendata.sachsen.de';

	$paramLink = htmlspecialchars($_GET['link']);
	if ($paramLink == '') {
		echo 'Parameter "link" is not set';
		exit;
	}

	if ($sachsenSuffix != substr($paramLink, -strlen($sachsenSuffix))) {
		echo 'Parameter "link" must end with "' . $sachsenSuffix . '"';
		exit;
	}

	$uri = 'https://register.opendata.sachsen.de/store/';
	$uriDomain = end(explode('/', $sachsenSuffix));

	$query = 'search' .
		'?type=solr' .
		'&query=(' .
			'rdfType:http%5C%3A%2F%2Fwww.w3.org%2Fns%2Fdcat%23Dataset' .
			'+OR+' .
			'rdfType:http%5C%3A%2F%2Fentryscape.com%2Fterms%2FIndependentDataService)' .
			'+AND+' .
			'public:true' .
			'+AND+' .
			'(title.de:*^1' .
			'+OR+' .
			'title.nolang:*' .
			')' .
		'&limit=0' .
		'&facetFields=' .
			'metadata.predicate.uri.9259d4c1';           // organizations
/*			'metadata.predicate.literal_s.b5d28d0a,' .   // filetype
			'metadata.predicate.uri.0ce6b231,' .         // groups
			'metadata.predicate.literal_s.a6424133,' .   // keywords
			'metadata.predicate.uri.23fc4665,' .         // access rights
			'related.metadata.predicate.uri.3494e2ce,' . // licenses
			'rdfType,' .                                 // type
			'metadata.predicate.literal_s.759a4eb7,' .   // ?
			'metadata.predicate.uri.2198789d,' .         // ?
			'metadata.predicate.uri.1c06f647';           // ?
*/

	function getRessourceQuery($organisation) {
		$str = str_replace(':', '\:', $organisation);
		$str = urlencode($str);
		$query = 'search' .
			'?type=solr' .
			'&query=' .
				'public:true' .
				'+AND+' .
				'(resource:' . $str . ')';

		return $query;
	}

	$json = json_decode(file_get_contents($uri . $query));
	$data = [];

	foreach($json->facetFields[0]->values as $organisation) {
		$name = $organisation->name;

		$ressourceQuery = getRessourceQuery($name);
		$ressourceJSON = json_decode(file_get_contents($uri . $ressourceQuery));
//		$ressourceJSON = file_get_contents($uri . $ressourceQuery);

		$metadata = $ressourceJSON->resource->children[0]->metadata;
		$nameEntry = get_object_vars(reset($metadata))['http://xmlns.com/foaf/0.1/name'];
		$title = $nameEntry[0]->value;

		$data[] = semanticContributor($uriDomain, array(
			'id' => $name,
			'name' => $name,
			'title' => $title,
			'created' => '',
			'packages' => $organisation->count,
			'uri' => ''
		));
	}

	echo json_encode($data);
?>