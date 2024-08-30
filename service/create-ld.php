<?php
	header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: X-Requested-With');
	header('Content-Type: application/json; charset=utf-8');

	$filePath = '../assets/ld-' . date('Y') . '/' . date('Y-m-d') . '/';

	$basePath = 'https://opendata.guru/govdata';
	$systemsPath = $basePath . '/assets/data-' . date('Y') . '/' . date('Y-m-d') . '-systems.json';
	$organisationPath = $basePath . '/assets/data-' . date('Y') . '/' . date('Y-m-d') . '-organizations.json';

	function curl($url) {
		$headers = [
			'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:28.0) Gecko/20100101 Firefox/28.0',
		];

		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

		$ret = curl_exec($curl);
		curl_close($curl);

		return $ret;
	}

	function getSystems() {
		global $systemsPath;

		return json_decode(curl($systemsPath));
	}

	function getOrganisations() {
		global $organisationPath;

		return json_decode(curl($organisationPath));
	}

	function getSubjectPage($organisations, $organisation) {
		$politicalGeocodingURI = '';
		$isPartOf = array();
		$location = '';
		$hasPart = array();
		$sameAs = array();
		$type = '';
		$ret = '';

		if ($organisation->rs !== '') {
			$politicalGeocodingURI = 'http://dcat-ap.de/def/politicalGeocoding/stateKey/05';
			$layer = 'lan';
			$filter = '&FILTER=%3CFilter%3E%3CPropertyIsEqualTo%3E%3CValueReference%3Ears%3C/ValueReference%3E%3CLiteral%3E' . $organisation->rs . '%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/Filter%3E';

			if (0 === strlen($organisation->rs)) {
				$layer = 'sta'; // Staat
				$filter = '';
			} else if (2 === strlen($organisation->rs)) {
				$layer = 'lan'; // Land
			} else if (3 === strlen($organisation->rs)) {
				$layer = 'rbz'; // Regierungsbezirk
			} else if (5 === strlen($organisation->rs)) {
				$layer = 'krs'; // Kreis
			} else if (9 === strlen($organisation->rs)) {
				$layer = 'vwg'; // Verwaltungsgemeinschaft
			} else if (12 === strlen($organisation->rs)) {
				$layer = 'gem'; // Gemeinde
			}
			$location = 'https://sgx.geodatenzentrum.de/wfs_vg250?TYPENAMES=vg250:vg250_' . $layer . '&Service=WFS&Version=2.0.0&Request=GetFeature&OUTPUTFORMAT=application%2Fjson&srsName=urn:ogc:def:crs:EPSG::4326 '. $filter;
		}
		foreach($organisations as $orga) {
			if ($orga->name === $organisation->name) {
				if ($orga->id !== $organisation->id) {
					$sameAs[] = (object) array(
						'href' => $orga->id . '.html',
						'title' => $orga->title,
					);
				}
			}
			if ($orga->packagesInId === $organisation->id) {
				$hasPart[] = (object) array(
					'href' => $orga->id . '.html',
					'title' => $orga->title,
				);
			}
		}
		if ($organisation->wikidata !== '') {
			$sameAs[] = (object) array(
				'href' => 'https://www.wikidata.org/wiki/' . $organisation->wikidata,
				'title' => 'Wikidata',
			);
		}
		if ($organisation->packagesInPortal !== '') {
			$isPartOf[] = (object) array(
				'href' => $organisation->packagesInId . '.html',
				'title' => $organisation->packagesInPortal,
			);
		}
		if ($organisation->type === 'country') {
			$type = 'Der Staat';
		} else if ($organisation->type === 'state') {
			$type = 'Das Bundesland';
		} else if ($organisation->type === 'governmentRegion') {
			$type = 'Der Regierungsbezirk';
		} else if ($organisation->type === 'district') {
			$type = 'Der Kreis';
		} else if ($organisation->type === 'collectiveMunicipality') {
			$type = 'Der Gemeindeverband';
		} else if ($organisation->type === 'municipality') {
			$type = 'Die Stadt';
		}

		$ret .= '
<div prefix="
  schema: http://schema.org/ 
  dcterms: http://purl.org/dc/terms/
  dcatde: http://dcatap.de/def/">

  <div resource="nrw">';
		if ($politicalGeocodingURI !== '') {
			$ret .= '    <span property="dcatde:politicalGeocodingURI" resource="' . $politicalGeocodingURI . '"></span>';
		}
		$ret .= '
    <div>' . $type . '
      <span property="schema:name" style="font-weight:bold">' . $organisation->title . '</span>
';
		if ($location !== '') {
			$ret .= '      <span property="dcterms:location" style="display:none">' . $location . '</span> (<a href="' . $location . '">Karte</a>)';
		}
		$ret .= '
      ist gleichbedeutend mit:
    </div>

    <ul>
';
		if (count($sameAs) > 0) {
			foreach($sameAs as $same) {
				$ret .= '      <li><a rel="dcterms:sameAs" href="' . $same->href . '">' . $same->title . '</a></li>' . "\n";
			}
		}
		$ret .= '
    </ul>

    <div>und wird geerntet von:</div>

    <ul>
';
		if (count($isPartOf) > 0) {
			foreach($isPartOf as $part) {
				$ret .= '      <li><a rel="dcterms:isPartOf" href="' . $part->href . '">' . $part->title . '</a></li>' . "\n";
			}
		}
		$ret .= '
    </ul>

    <div>und erntet Daten aus folgenden Portalen:</div>

    <ul>
';
		if (count($hasPart) > 0) {
			foreach($hasPart as $part) {
				$ret .= '      <li><a rel="dcterms:hasPart" href="' . $part->href . '">' . $part->title . '</a></li>' . "\n";
			}
		}
		$ret .= '
    </ul>
   
  </div>
</div>
		';

		$ret = '<html><body>' . $ret . '</html>';
		return $ret;
	}

	$dir = $filePath;
	mkdir($dir, 0777, true);

//	if (!file_exists($filePath)) {
		$systems = getSystems();
		$organisations = getOrganisations();

		foreach($organisations as $organisation) {
			$page = getSubjectPage($organisations, $organisation);
			$file = $filePath . $organisation->id . '.html';

			file_put_contents($file, $page);
		}
//	}

	echo json_encode(array('result' => 'done'));
?>