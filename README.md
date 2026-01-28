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

The OpenAPI description: /openapi.yaml

Count all datasets:

- use new OpenAPI documentation: https://opendata.guru/govdata/api.html

Get a list of all contributors and some more meta data:

- use new OpenAPI documentation: https://opendata.guru/govdata/api.html

Get a list of all datasets:

- use new OpenAPI documentation: https://opendata.guru/govdata/api.html

Get system status information:

- use new OpenAPI documentation: https://opendata.guru/govdata/api.html

Convert RS (Regionalschlüssel) to GEOJSON file:

- https://opendata.guru/govdata/get/rs-to-geojson.php
- https://opendata.guru/govdata/get/rs-to-geojson.php?rs=04
- https://opendata.guru/govdata/get/rs-to-geojson.php?rs=04,06

Parameter length in GET method is limited to some KByte (depend on Browser support).
You can use `rs` as POST parameter to prevent this limitation.

- https://opendata.guru/govdata/get/rs-to-geojson.php and POST parameter `rs=04,06`

And service endpoints:

- https://opendata.guru/govdata/service/artery.php
- https://opendata.guru/govdata/service/get-and-store-ckan-organizations.php
- https://opendata.guru/govdata/service/get-and-store-ckan-dataset-counts.php
- https://opendata.guru/govdata/service/get-and-store-systems.php
- https://opendata.guru/govdata/service/create-map.php
- https://opendata.guru/govdata/service/create-monitoring.php

Regionalschlüssel:

- https://www.dcat-ap.de/def/politicalGeocoding/regionalKey/

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
5     | hvd                 | :new: api/cronjob/cronjob-hvd.php | write file ```/api-data/temp-YEAR/YEAR-MONTH-DAY-hvd.json```
6     | monitoring-old      | :x:   create-monitoring.php | write file ```/assets/monitoring-YEAR/YEAR-MONTH-DAY.json```
7     | monitoring          | :new: api/cronjob/cronjob-monitoring.php | write file ```/api-data/monitor-date/YEAR-MONTH/monitor-YEAR-MONTH-DAY.json```
8     | create-map-old      | :x:   create-map.php | write file ```/assets/map-YEAR/YEAR-MONTH-DAY-de.geojson```
9     | create-map          | :new: api/cronjob/cronjob-map.php | write file ```/assets/map-YEAR/YEAR-MONTH-DAY-map.geojson```
10     | insights            | :new: api/cronjob/cronjob-insights.php | write file ```/api-data/temp-YEAR/YEAR-MONTH-DAY-insights.json```

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


## Used Libraries

- [Folder and File Explorer](https://github.com/cubiclesoft/js-fileexplorer)
- [OrgChart.js](https://github.com/dabeng/OrgChart.js)
