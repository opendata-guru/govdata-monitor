# GovData monitor

| image | text endpoint | svg endpoint | data source | description |
|-------|---------------|--------------|-------------|-------------|
| <img src="https://opendata.guru/govdata/get/govdata-startpage.svg" style="height:10rem"> | [txt](https://opendata.guru/govdata/get/govdata-startpage.php) | [svg](https://opendata.guru/govdata/get/govdata-startpage.svg) | [govdata.de](https://www.govdata.de/) | Info box on start page
| <img src="https://opendata.guru/govdata/get/govdata-datapage.svg" style="height:10rem"> | [txt](https://opendata.guru/govdata/get/govdata-datapage.php) | [svg](https://opendata.guru/govdata/get/govdata-datapage.svg) | [govdata.de/web/guest/daten](https://www.govdata.de/web/guest/daten) | Data counter on data page
| <img src="https://opendata.guru/govdata/get/govdata-sparql-countdatasets.svg" style="height:10rem"> | [txt](https://opendata.guru/govdata/get/govdata-sparql-countdatasets.php) | [svg](https://opendata.guru/govdata/get/govdata-sparql-countdatasets.svg) | [govdata.de/web/guest/sparql-assistent](https://www.govdata.de/web/guest/sparql-assistent) | Result of the SPARQL query ```SELECT (COUNT(?dataset) AS ?datasets) WHERE { ?dataset a dcat:Dataset . }```
| <img src="https://opendata.guru/govdata/get/govdata-sparql-countdistributiondatasets.svg" style="height:10rem"> | [txt](https://opendata.guru/govdata/get/govdata-sparql-countdistributiondatasets.php) | [svg](https://opendata.guru/govdata/get/govdata-sparql-countdistributiondatasets.svg) | [govdata.de/web/guest/sparql-assistent](https://www.govdata.de/web/guest/sparql-assistent) | Result of the SPARQL query ```SELECT ?datasets ?distributions (?distributions / ?datasets AS ?averageDistributionsPerDataset) WHERE {{ SELECT (COUNT(?dataset) AS ?datasets) (SUM(?distributionsPerDataset) AS ?distributions) WHERE {{ SELECT ?dataset (COUNT(?distribution) AS ?distributionsPerDataset) WHERE { ?dataset a dcat:Dataset . ?dataset dcat:distribution ?distribution . } GROUP BY ?dataset }}}} LIMIT 100```
| <img src="https://opendata.guru/govdata/get/govdata-ckan.svg" style="height:10rem"> | [txt](https://opendata.guru/govdata/get/govdata-ckan.php) | [svg](https://opendata.guru/govdata/get/govdata-ckan.svg) | [ckan.govdata.de/api/3/action/package_list](https://ckan.govdata.de/api/3/action/package_list) | Length of the dataset list on CKAN endpoint
| <img src="https://opendata.guru/govdata/get/govdata-dcatapde.svg" style="height:10rem"> | [txt](https://opendata.guru/govdata/get/govdata-dcatapde.php) | [svg](https://opendata.guru/govdata/get/govdata-dcatapde.svg) | [ckan.govdata.de/catalog.rdf](https://ckan.govdata.de/catalog.rdf) | Total items count of pagination info in DCAT-AP.de endpoint and data counter on this page: https://ckan.govdata.de/dataset/
| <img src="https://opendata.guru/govdata/get/eudata-datapage.svg" style="height:10rem"> | [txt](https://opendata.guru/govdata/get/eudata-datapage.php) | [svg](https://opendata.guru/govdata/get/eudata-datapage.svg) | [data.europa.eu/data/datasets?catalog=govdata](https://data.europa.eu/data/datasets?catalog=govdata) | Data counter for GovData on EU data portal
| <img src="https://opendata.guru/govdata/get/eudata-statistics.svg" style="height:10rem"> | [txt](https://opendata.guru/govdata/get/eudata-statistics.php) | [svg](https://opendata.guru/govdata/get/eudata-statistics.svg) | [data.europa.eu/catalogue-statistics/CurrentState](https://data.europa.eu/catalogue-statistics/CurrentState) | Data counter for GovData on the EU data portal statistic page (updated monthly)
| https://ckan.govdata.de/api/3/action/package_search?rows=1&start=0 |

## More endpoints

A monitoring dashboard:
https://opendata.guru/govdata/index.html

The OLD OpenAPI description: /openapi.yaml . Use NEW OpenAPI documentation: https://opendata.guru/govdata/api.html

And OLD service endpoints:

- https://opendata.guru/govdata/service/artery.php
- https://opendata.guru/govdata/service/get-and-store-ckan-organizations.php
- https://opendata.guru/govdata/service/get-and-store-ckan-dataset-counts.php
- https://opendata.guru/govdata/service/get-and-store-systems.php
- https://opendata.guru/govdata/service/create-map.php
- https://opendata.guru/govdata/service/create-monitoring.php

## Cron job

What happens at night?

The script [service/artery.php](https://opendata.guru/govdata/service/artery.php) is executed automatically every 2 minutes. It can either be started locally via a cron job or using an online service like [cron-job.org](https://cron-job.org).

Order | Level               | Asset | Task
------|---------------------|-------|------
0     | root                |       | void
1     | ckan-organizations  | :x:   get-and-store-ckan-organizations.php | write file ```/assets/data-YEAR/YEAR-MONTH-DAY-organizations.json```
2     | ckan-dataset-counts | :x:   get-and-store-ckan-dataset-counts.php | write / append in file ```/assets/data-YEAR/YEAR-MONTH-DAY-organizations.json```
3     | systems             | :x:   get-and-store-systems.php |	write file ```/assets/data-YEAR/YEAR-MONTH-DAY-systems.json```
4     | providers           | :new: api/cronjob/cronjob-providers.php | write file ```/api-data/temp-YEAR/YEAR-MONTH-DAY-providers.json```
5     | monitoring-old      | :x:   create-monitoring.php | write file ```/assets/monitoring-YEAR/YEAR-MONTH-DAY.json```
6     | monitoring          | :new: api/cronjob/cronjob-monitoring.php | write file ```/api-data/monitor-date/YEAR-MONTH/monitor-YEAR-MONTH-DAY.json```
7     | create-map          | :new: api/cronjob/cronjob-map.php | write file ```/assets/map-YEAR/YEAR-MONTH-DAY-map.geojson```
8     | hvd                 | :new: api/cronjob/cronjob-hvd.php | write file ```/api-data/temp-YEAR/YEAR-MONTH-DAY-hvd.json```
9     | insights            | :new: api/cronjob/cronjob-insights.php | write file ```/api-data/temp-YEAR/YEAR-MONTH-DAY-insights.json```

## Ideas

- https://codeberg.org/opengovtech/ars-tool/src/branch/main
- https://www.opengovtech.de/ars/

## Shapes: Nutzungsbestimmungen und Quellenvermerk

Die hier angebotenen Geodaten stehen über Geodatendienste gemäß der Open Data
Datenlizenz Deutschland – Namensnennung – Version 2.0 geldleistungsfrei zum Download
und zur Online-Nutzung zur Verfügung.
Insbesondere hat jeder Nutzer den Quellenvermerk zu allen Geodaten, Metadaten und
Geodatendiensten erkennbar und in optischem Zusammenhang zu platzieren.
Veränderungen, Bearbeitungen, neue Gestaltungen oder sonstige Abwandlungen sind mit
einem Veränderungshinweis im Quellenvermerk zu versehen.
Quellenvermerk und Veränderungshinweis sind wie folgt zu gestalten. Bei der Darstellung auf
einer Webseite ist der Quellenvermerk mit der URL "http://www.bkg.bund.de" zu verlinken.
© GeoBasis-DE / BKG (Jahr des letzten Datenbezugs)
© GeoBasis-DE / BKG (Jahr des letzten Datenbezugs) (Daten verändert)

### Organisations

- start with GovData (or data.europe.eu ?)
- get a list of all organisations (data providers)
  - the CKAN endpoint for organisations count the datasets
  - classify the data provider per hand (other portal, municipal unit, museum, ...)
  - go to the origial portal / website and count the datasets (if possible)
    - get a list of all organisations ...
    - check for recursion!!!

### SPARQL

Go to open data portal SPARQL query page:

- learn SPARQL https://data.europa.eu/de/about/sparql
- https://data.europa.eu/data/sparql?locale=en
  - endpoint ```https://data.europa.eu/sparql```

Run some queries:

**List 10 datasets**

```
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX odp:  <http://data.europa.eu/euodp/ontologies/ec-odp#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT * WHERE { ?d a dcat:Dataset } LIMIT 10
```

**Get a list of all catalogues on data.europa.eu**

```
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT DISTINCT ?parentCatalog ?catalog ?title ?spatial ?typePublisher ?homepage ?email
WHERE {?catalog ?p ?o.
FILTER (?o=<http://www.w3.org/ns/dcat#Catalog>)
OPTIONAL {?catalog <http://purl.org/dc/terms/title> ?title}
OPTIONAL {?parentCatalog <http://purl.org/dc/terms/hasPart> ?catalog}
OPTIONAL {?catalog <http://purl.org/dc/terms/spatial> ?spatial.}
OPTIONAL {?catalog <http://purl.org/dc/terms/publisher> ?publisher.
OPTIONAL {?publisher <http://xmlns.com/foaf/0.1/homepage> ?homepage.}
OPTIONAL {?publisher <http://xmlns.com/foaf/0.1/mbox> ?email.}
OPTIONAL {?publisher <http://purl.org/dc/terms/type> ?typePublisher.}
}
}
ORDER BY DESC (?spatial)
```

**Publishers by catalogue**

```
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX odp: <http://data.europa.eu/euodp/ontologies/ec-odp#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?publisher ?publisherName ?publisherLabel
WHERE {
<http://data.europa.eu/88u/catalogue/govdata> a dcat:Catalog;
dcat:dataset ?datatsetURI.
?datatsetURI dct:publisher ?publisher.
OPTIONAL {?publisher foaf:name ?publisherName}
OPTIONAL {?publisher skos:prefLabel ?publisherLabel}
}
LIMIT 25
```

**Show HVD datasets

Bsp. für keyword = Georaum (insgesamt haben 375 Datensätze dieses Schlüsselwort)

https://gdk.gdi-de.org/gdi-de/srv/eng/csw?request=GetRecords&version=2.0.2&service=CSW&resultType=results&outputSchema=http://www.isotc211.org/2005/gmd&NAMESPACE=xmlns(gmd=http://www.isotc211.org/2005/gmd)&typeNames=gmd:MD_Metadata&CONSTRAINTLANGUAGE=FILTER&CONSTRAINT_LANGUAGE_VERSION=1.1.0&elementSetName=full&startPosition=1&maxRecords=10&CONSTRAINT=%3Cogc:Filter%20xmlns:ogc=%22http://www.opengis.net/ogc%22%20xmlns:apiso=%22http://www.opengis.net/cat/csw/apiso/1.0%22%20xmlns:gmd=%22http://www.isotc211.org/2005/gmd%22%3E%3Cogc:And%3E%20%3Cogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyName%3Eapiso:type%3C/ogc:PropertyName%3E%20%3Cogc:Literal%3Edataset%3C/ogc:Literal%3E%20%3C/ogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyName%3Eapiso:subject%3C/ogc:PropertyName%3E%20%3Cogc:Literal%3EGeoraum%3C/ogc:Literal%3E%20%3C/ogc:PropertyIsEqualTo%3E%20%3C/ogc:And%3E%3C/ogc:Filter%3E

https://gdk.gdi-de.org/gdi-de/srv/eng/csw
?request=GetRecords
&version=2.0.2
&service=CSW
&resultType=results
&outputSchema=http://www.isotc211.org/2005/gmd
&NAMESPACE=xmlns(gmd=http://www.isotc211.org/2005/gmd)
&typeNames=gmd:MD_Metadata
&CONSTRAINTLANGUAGE=FILTER
&CONSTRAINT_LANGUAGE_VERSION=1.1.0
&elementSetName=full
&startPosition=1
&maxRecords=10
&CONSTRAINT=%3Cogc:Filter%20xmlns:ogc=%22http://www.opengis.net/ogc%22%20xmlns:apiso=%22http://www.opengis.net/cat/csw/apiso/1.0%22%20xmlns:gmd=%22http://www.isotc211.org/2005/gmd%22%3E%3Cogc:And%3E%20%3Cogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyName%3Eapiso:type%3C/ogc:PropertyName%3E%20%3Cogc:Literal%3Edataset%3C/ogc:Literal%3E%20%3C/ogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyName%3Eapiso:subject%3C/ogc:PropertyName%3E%20%3Cogc:Literal%3EGeoraum%3C/ogc:Literal%3E%20%3C/ogc:PropertyIsEqualTo%3E%20%3C/ogc:And%3E%3C/ogc:Filter%3E

<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc" xmlns:apiso="http://www.opengis.net/cat/csw/apiso/1.0" xmlns:gmd="http://www.isotc211.org/2005/gmd"><ogc:And> <ogc:PropertyIsEqualTo> <ogc:PropertyName>apiso:type</ogc:PropertyName> <ogc:Literal>dataset</ogc:Literal> </ogc:PropertyIsEqualTo> <ogc:PropertyIsEqualTo> <ogc:PropertyName>apiso:subject</ogc:PropertyName> <ogc:Literal>Georaum</ogc:Literal> </ogc:PropertyIsEqualTo> </ogc:And></ogc:Filter>

<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc" xmlns:apiso="http://www.opengis.net/cat/csw/apiso/1.0" xmlns:gmd="http://www.isotc211.org/2005/gmd">
  <ogc:And>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>apiso:type</ogc:PropertyName>
      <ogc:Literal>dataset</ogc:Literal>
    </ogc:PropertyIsEqualTo>
    <ogc:PropertyIsEqualTo>
      <ogc:PropertyName>apiso:subject</ogc:PropertyName>
      <ogc:Literal>Georaum</ogc:Literal>
    </ogc:PropertyIsEqualTo>
  </ogc:And>
</ogc:Filter>

--------
Mapping
https://github.com/geopython/pycsw/blob/70f1a19f764757a459501ae59f75982a50a14acb/pycsw/plugins/profiles/apiso/apiso.py#L65
--------
- 'apiso:Type' -> 'xpath': 'gmd:hierarchyLevel/gmd:MD_ScopeCode'
- 'apiso:Subject' -> 'xpath': 'gmd:identificationInfo/gmd:MD_Identification/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString|gmd:identificationInfo/gmd:MD_DataIdentification/gmd:topicCategory/gmd:MD_TopicCategoryCode'
--------


Result:
<csw:GetRecordsResponse>
  <csw:SearchResults>
    <gmd:MD_Metadata>
      <gmd:hierarchyLevel>
        <gmd:MD_ScopeCode codeList="https://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="dataset">dataset</gmd:MD_ScopeCode>
      <gmd:identificationInfo>
        <gmd:MD_DataIdentification>
          <gmd:descriptiveKeywords>
            <gmd:MD_Keywords>
              <gmd:keyword>
                <gco:CharacterString>Georaum</gco:CharacterString>

Ansonsten müsstest du den Term „Georaum“ dann für die anderen fünf Kategorien jeweils austauschen.

Die HVD-Kennzeichnung verdient diesen Namen aber erst, wenn auch der Thesaurus angegeben ist wie vorgesehen.

<csw:GetRecordsResponse>
  <csw:SearchResults>
    <gmd:MD_Metadata>
      <gmd:identificationInfo>
        <gmd:MD_DataIdentification>
          <gmd:descriptiveKeywords>
            <gmd:MD_Keywords>
              <gmd:thesaurusName>
                <gmd:CI_Citation>
                  <gmd:title>
                    <gco:CharacterString>High-value dataset categories</gco:CharacterString>

- https://www.ogc.org/de/publications/standard/filter/
- https://docs.geoserver.org/main/en/user/filter/filter_reference.html
- InGrid CSW Schnittstelle:
  - Die CSW-Schnittstelle bietet Zugang zur InGrid-Suche über die OGC CSW 2.0.2 AP ISO 1.0 Schnittstellenspezifikation
  - https://www.ingrid-oss.eu/5.2.0/components/interface_csw.html
  - https://www.ogc.org/de/publications/standard/cat/
- https://redmine.gdi-de.org/projects/gdi-de-registry/wiki/Tipps
- https://schemas.opengis.net/csw/2.0.2/profiles/apiso/1.0.0/apiso.xsd
- API description for Catalogue Service for the Web 2.0.2 (CSW)
  - https://help.wetransform.to/de/docs/users-roles-orgs/harvesting-metadata/2015-03-07-csw/

Iteration 2 (only 1 dataset):

https://gdk.gdi-de.org/gdi-de/srv/eng/csw?request=GetRecords&version=2.0.2&service=CSW&resultType=results&outputSchema=http://www.isotc211.org/2005/gmd&NAMESPACE=xmlns(gmd=http://www.isotc211.org/2005/gmd)&typeNames=gmd:MD_Metadata&CONSTRAINTLANGUAGE=FILTER&CONSTRAINT_LANGUAGE_VERSION=1.1.0&elementSetName=full&startPosition=1&maxRecords=1&CONSTRAINT=%3Cogc:Filter%20xmlns:ogc=%22http://www.opengis.net/ogc%22%20xmlns:apiso=%22http://www.opengis.net/cat/csw/apiso/1.0%22%20xmlns:gmd=%22http://www.isotc211.org/2005/gmd%22%3E%3Cogc:And%3E%20%3Cogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyName%3Eapiso:type%3C/ogc:PropertyName%3E%20%3Cogc:Literal%3Edataset%3C/ogc:Literal%3E%20%3C/ogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyName%3Eapiso:subject%3C/ogc:PropertyName%3E%20%3Cogc:Literal%3EGeoraum%3C/ogc:Literal%3E%20%3C/ogc:PropertyIsEqualTo%3E%20%3C/ogc:And%3E%3C/ogc:Filter%3E

Iteration 3 (replace apiso:Subject with xpath):

https://gdk.gdi-de.org/gdi-de/srv/eng/csw?request=GetRecords&version=2.0.2&service=CSW&resultType=results&outputSchema=http://www.isotc211.org/2005/gmd&NAMESPACE=xmlns(gmd=http://www.isotc211.org/2005/gmd)&typeNames=gmd:MD_Metadata&CONSTRAINTLANGUAGE=FILTER&CONSTRAINT_LANGUAGE_VERSION=1.1.0&elementSetName=full&startPosition=1&maxRecords=1&CONSTRAINT=%3Cogc:Filter%20xmlns:ogc=%22http://www.opengis.net/ogc%22%20xmlns:apiso=%22http://www.opengis.net/cat/csw/apiso/1.0%22%20xmlns:gmd=%22http://www.isotc211.org/2005/gmd%22%3E%3Cogc:And%3E%20%3Cogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyName%3E/csw:GetRecordsResponse/csw:SearchResults/gmd:MD_Metadata/gmd:hierarchyLevel/gmd:MD_ScopeCode%3C/ogc:PropertyName%3E%20%3Cogc:Literal%3Edataset%3C/ogc:Literal%3E%20%3C/ogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyIsEqualTo%3E%20%3Cogc:PropertyName%3Eapiso:subject%3C/ogc:PropertyName%3E%20%3Cogc:Literal%3EGeoraum%3C/ogc:Literal%3E%20%3C/ogc:PropertyIsEqualTo%3E%20%3C/ogc:And%3E%3C/ogc:Filter%3E

- CSW service
  - https://gdk.gdi-de.org/gdi-de/srv/eng/csw
- Portal
  - https://gdk.gdi-de.org/gdi-de/srv/ger/catalog.search#/home
- GeoNetwork Api Documentation (beta)
  - https://gdk.gdi-de.org/gdi-de/doc/api/
  - https://gdk.gdi-de.org/gdi-de/srv/v2/api-docs
  - https://gdk.gdi-de.org/geonetwork/srv/api/0.1/records (too big to get a valid request)
- INSPIRE
  - INSPIRE theme, artical from Jesper: https://open-north.de/blog/2023-07-24_inspire_abkuerzungen/
  - INSPIRE theme registry: https://inspire.ec.europa.eu/theme
- Building functions
  - Artical from Jesper: https://open-north.de/blog/2022-09-04_geobasisdaten_nutzung/
  - Code lists by ADV: https://repository.gdi-de.org/schemas/adv/citygml/Codelisten/BuildingFunctionTypeAdV.xml

## Used Libraries

- [Folder and File Explorer](https://github.com/cubiclesoft/js-fileexplorer)
- [OrgChart.js](https://github.com/dabeng/OrgChart.js)
