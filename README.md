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

Get a list of all contributors and some more meta data:
https://opendata.guru/govdata/get/ckan-organizations.php

And service endpoints:

- https://opendata.guru/govdata/service/artery.php
- https://opendata.guru/govdata/service/get-and-store-ckan-organizations.php
- https://opendata.guru/govdata/service/get-and-store-ckan-dataset-counts.php

(use a cron job service like https://cron-job.org)

## Ideas

### Organisations

- start with GovData (or data.europe.eu ?)
- get a list of all organisations (data providers)
  - the CKAN endpoint for organisations count the datasets
  - classify the data provider per hand (other portal, municipal unit, museum, ...)
  - go to the origial portal / website and count the datasets (if possible)
    - get a list of all organisations ...
    - check for recursion!!!