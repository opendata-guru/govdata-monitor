var page = {
	catalog: {},
	catalogLeft: {},
	catalogRight: {},
};

// ----------------------------------------------------------------------------

function getServiceInformation(keyCatalog, keyParent) {
	var params = new URLSearchParams(window.location.search);
	var ret = {
		catalog: '',
		catalogParent: '',
		dataURI: 'https://data.europa.eu/api/hub/search/',
		service: 'piveau'
	};

	if (params.has(keyCatalog)) {
		ret.catalog = params.get(keyCatalog);
	}
	if (params.has(keyParent)) {
		ret.catalogParent = params.get(keyParent);
	} else {
		ret.catalogParent = ret.catalog;
		ret.catalog = '';
	}

	if (ret.catalogParent === 'govdata') {
		ret.service = ckanV2;
		ret.dataURI = 'https://www.govdata.de/ckan/api/action/';
	} else if (ret.catalogParent === 'ec74990f-c51f-4378-845d-132b1f75a550') {
		ret.service = ckanV2;
		ret.dataURI = 'https://opendata.guru/proxy/cors?url=https://open.nrw/api/3/action/';
	} else if (ret.catalogParent === 'ab7713f4-008d-4932-bd81-192a108da8a3') {
		ret.service = ckanV2;
		ret.dataURI = 'https://opendata.guru/proxy/cors?url=https://opendata.ruhr/api/3/action/';
	} else if (ret.catalogParent === '23e91bf6-9968-4a0f-bafe-6bad1a0f5be8') {
		ret.service = ckanV2;
		ret.dataURI = 'https://opendata.guru/proxy/cors?url=https://www.offenesdatenportal.de/api/3/action/';
	} else {
		ret.service = ckanV2;
	//	ret.dataURI = 'https://opendata.guru/proxy/cors?url=https://mobilithek.info/mobilithek/api/v1.0/export/datasets/dcatapde';
		ret.dataURI = 'https://opendata.guru/proxy/cors?url=https://www.mcloud.de/export/datasets';

	//	ret.service = MobilithekDistributions;
	//	ret.dataURI = 'https://mobilithek.info/mobilithek/api/v1.0/export/datasets/dcatapde?ret=0&size=10';
	//	ret.dataURI = 'https://mobilithek.info/mobilithek/api/v1.0/export/datasets/dcatapde';
	}

	return ret;
}

// ----------------------------------------------------------------------------

const getCommonResponseData = (dataset) => {
  const ds = {};
  const language = dataset.language || 'de';

  ds.catalog = {
    id: 'ckan-catalog',
    title: 'Default Catalog',
    description: 'CKAN does not define a catalog',
  };
  ds.categories = [];
  let group;
  for (group of dataset.groups) {
    ds.categories.push({
      id: group.id ? group.id : 0,
      title: group.display_name,
      resource: undefined,
    });
  }
  // ds.categories = datasetGetters.getCategories(dataset);
  ds.country = {
    id: language,
    title: language === 'de' ? 'Deutschland' : language,
  };
  ds.distributions = [];
  ds.distributionFormats = [];

  ds.licences = [];
  if (dataset.license_title) {
    let id = dataset.license_title.replace(/ /g, '_');
    if (dataset.license_title === 'Datenlizenz Deutschland - Namensnenung 2.0') {
      id = 'DL-DE BY 2.0';
    }

    ds.licences.push({
      id,
      resource: dataset.license_url,
      title: dataset.license_title,
      la_url: undefined,
    });
  }

  let dist;
  for (dist of dataset.resources) {
    const distribution = {};
    distribution.accessUrl = dist.access_url;
    if (dist.description) {
      distribution.description = {};
      distribution.description[language] = dist.description;
    } else {
      distribution.description = {
        en: 'No description given',
      };
    }
    distribution.downloadUrls = [];
    distribution.downloadUrls.push(dist.url);
    const formats = dist.format.split('/');
    distribution.format = {
      id: formats[formats.length - 1],
      title: formats[formats.length - 1],
    };
    distribution.id = dist.id;
    if (dist.license) {
      distribution.licence = {
        id: undefined,
        title: dist.license,
        resource: undefined,
        description: undefined,
        la_url: undefined,
      };
    } else if (ds.licences.length > 0) {
      distribution.licence = {
        id: ds.licences[0].id,
        title: ds.licences[0].title,
        resource: ds.licences[0].resource,
        description: undefined,
        la_url: ds.licences[0].la_url,
      };
    } else {
      distribution.licence = {
        id: undefined,
        title: undefined,
        resource: undefined,
        description: undefined,
        la_url: undefined,
      };
    }
    distribution.modificationDate = dist.last_modified;
    distribution.releaseDate = dist.created;
    distribution.title = {};
    distribution.title[language] = dist.name;
    ds.distributions.push(distribution);
    ds.distributionFormats.push(distribution.format);
  }
  ds.id = dataset.id;
  ds.idName = dataset.name;
  ds.keywords = [];
  let tag;
  for (tag of dataset.tags) {
    ds.keywords.push({
      id: tag.id,
      title: tag.display_name,
    });
  }
  ds.languages = [];
  if (dataset.language) ds.languages.push(dataset.language);

  ds.modificationDate = dataset.metadata_modified;
  ds.publisher = {
    type: dataset.organization.type,
    name: dataset.organization.title,
    email: undefined,
    resource: undefined,
  };
  ds.releaseDate = dataset.metadata_created;
  ds.title = {};
  ds.title[language] = dataset.title;
  ds.translationMetaData = {
    fullAvailableLanguages: [],
    details: {},
    status: undefined,
  };

  return ds;
};

const getResponseData = (dataset) => {
  const ds = getCommonResponseData(dataset);
  const language = dataset.language || 'de';

  /* ds.conformsTo = datasetGetters.getConformsTo(dataset);
  ds.contactPoints = datasetGetters.getContactPoints(dataset);
  ds.documentations = datasetGetters.getDocumentations(dataset);
  ds.frequency = datasetGetters.getFrequency(dataset);
  ds.identifiers = datasetGetters.getIdentifiers(dataset);
  ds.landingPages = datasetGetters.getLandingPages(dataset);
  ds.originalLanguage = datasetGetters.getOriginalLanguage(dataset);
  ds.otherIdentifiers = datasetGetters.getOtherIdentifiers(dataset);
  ds.provenances = datasetGetters.getProvenances(dataset);
  ds.relatedResources = datasetGetters.getRelatedResources(dataset);
  ds.sources = datasetGetters.getSources(dataset);
  ds.spatial = datasetGetters.getSpatial(dataset);
  ds.translationMetaData = datasetGetters.getTranslationMetaData(dataset);
  return ds; */

  ds.conformsTo = [];
  ds.contactPoints = [];
  ds.description = {};
  ds.description[language] = dataset.description;

  return ds;
};

const getSingleResponseData = (dataset) => {
  const ds = getCommonResponseData(dataset);
  const language = dataset.language || 'de';

  ds.description = {};
  ds.description[language] = dataset.notes;

  return ds;
};

function buildQueryString(query, facets) {
  let queryString = query;
  Object.keys(facets).forEach((field) => {
    let facet;
    for (facet of facets[field]) {
      queryString += ` ${field}:${facet}`;
    }
  });
  return queryString;
}

var ckanV2 = class CKANAdapterV2{
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
	}

	/**
	* @description GET dataset by given id.
	* @param id
	*/
	getSingle(id) {
		return new Promise((resolve, reject) => {
		  const endpoint = 'package_show';
		  const reqStr = `${this.baseUrl}${endpoint}?id=${id}`;
		  axios.get(reqStr, {
			params: {},
		  })
			.then((response) => {
			  const dataset = response.data.contents ? response.data.contents.result : response.data.result;
			  let ds = {};
			  try {
				ds = getSingleResponseData(dataset);
			  } catch (error) {
				console.warn('Error in datasets-adapter-ckan.js while checking response:', error.message); // eslint-disable-line no-console
				console.error(error.stack); // eslint-disable-line no-console
			  }
			  resolve(ds);
			})
			.catch((error) => {
			  reject(error);
			});
		});
	}

	/**
	* @description GET all datasets matching the given criteria.
	* @param q
	* @param facets
	* @param limit
	* @param page
	* @param sort
	* @param facetOperator
	* @param facetGroupOperator
	* @param geoBounds
	* @returns {Promise}
	*/
	get(q, facets, limit, pageNum = 0 /* , sort = 'relevance+asc, last_modified+asc, name+asc', facetOperator = "AND", facetGroupOperator = "AND", geoBounds */) {
		// The request parameters
		var params = `q=${buildQueryString(q, facets)}`
		  // + `&sort=${ searchParams.sort }`
		  + `&rows=${limit}`
		  + `&start=${pageNum - 1}`
		  + '&facet.field=["tags", "groups"]';

		if (page.catalog.catalog) {
//			params = 'portal=' + page.catalog.catalog + '&' + params;
//			params = 'fq=portal:' + page.catalog.catalog + '&' + params;
			params = 'fq=organization:' + page.catalog.catalog + '&' + params;
//			params = 'organization=' + page.catalog.catalog + '&' + params;
		}

	return new Promise((resolve, reject) => {
      const endpoint = 'package_search';
      const reqStr = `${this.baseUrl}${endpoint}?${params}`;
      axios.get(reqStr, {
        params: {},
      })
        .then((response) => {
          /**
           * @property availableFacets
           * @type JSON
           * @description The set union of all available facets for the .
           */
          const resData = {
            availableFacets: [],
            datasetsCount: response.data.contents ? response.data.contents.result.count : response.data.result.count,
            datasets: [],
          };
          // Transform Facets Data model
          const searchFacets = response.data.contents ? response.data.contents.result.search_facets : response.data.result.search_facets;
          Object.keys(searchFacets).forEach((field) => {
            if (searchFacets[field].items.length > 0) {
              const newField = {};
              newField.title = searchFacets[field].title;
              newField.items = [];
              let f;
              for (f of searchFacets[field].items) {
                const facet = {};
                facet.count = f.count;
                facet.idName = f.name;
                facet.title = f.display_name;
                newField.items.push(facet);
              }
              resData.availableFacets.push(newField);
            }
          });
          // Transform Datasets Data model
          const datasets = response.data.contents ? response.data.contents.result.results : response.data.result.results;
          let dataset;
          for (dataset of datasets) {
            /**
             * @property dataset
             * @type JSON
             * @description A dataset object.
             */
            let ds = {};
            ds = getResponseData(dataset);
            resData.datasets.push(ds);
          }
          resolve(resData);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
};

// ----------------------------------------------------------------------------

var diffService = class DiffAdapter {
	constructor(baseUrl) {
		this.left = new page.catalogLeft.service(page.catalogLeft.dataURI);
		this.leftData = {
			availableFacets: [],
			datasets: [],
			datasetsCount: 0
		};
		this.right = new page.catalogRight.service(page.catalogRight.dataURI);
		this.rightData = {
			availableFacets: [],
			datasets: [],
			datasetsCount: 0
		};
		this.initialized = false;
	}

	getSingle(id) {
		return this.left.getSingle(id);
	}

	get(q, facets, limit, pageNum = 0 /* , sort = 'relevance+asc, last_modified+asc, name+asc', facetOperator = "AND", facetGroupOperator = "AND", geoBounds */) {
		if (!this.initialized) {
			this.initialized = true;
			return this.loadLeft(q, facets, limit, pageNum);
		}

		return this.left.get(q, facets, limit, pageNum);
	}

	loadLeft(q, facets, limit, pageNum) {
		return new Promise((resolve) => {
			this.left.get(q, facets, limit, pageNum).then((data) => {
				this.leftData.availableFacets = data.availableFacets;
				this.leftData.datasets = this.leftData.datasets.concat(data.datasets);
				this.leftData.datasetsCount = data.datasetsCount;

				console.log(this.leftData.datasetsCount);

				if (this.leftData.datasets.length >= this.leftData.datasetsCount) {
    CONFIG_APP_DATA_URL = page.catalog.dataURI,
    CONFIG_APP_DATA_SERVICE = page.catalog.service,
					resolve(this.loadRight(q, facets, limit, 0));
				} else {
					resolve(this.loadLeft(q, facets, limit, pageNum + limit));
				}
			});
		});
	}

	loadRight(q, facets, limit, pageNum) {
		return new Promise((resolve) => {
			this.left.get(q, facets, limit, pageNum).then((data) => {
				this.rightData.availableFacets = data.availableFacets;
				this.rightData.datasets = this.rightData.datasets.concat(data.datasets);
				this.rightData.datasetsCount = data.datasetsCount;

				console.log(this.rightData.datasetsCount);

				if (this.rightData.datasets.length >= this.rightData.datasetsCount) {
					resolve(this.rightData);
				} else {
					resolve(this.loadRight(q, facets, limit, pageNum + limit));
				}
			});
		});
	}
};

// ----------------------------------------------------------------------------

page.catalog = getServiceInformation('cat', 'in');
page.catalogLeft = getServiceInformation('cat', 'in');
page.catalogRight = getServiceInformation('cat2', 'in2');

if (page.catalogRight.catalog !== '') {
	page.catalog.service = diffService;
}

// ----------------------------------------------------------------------------

var CONFIG_APP_TITLE = "GovData Monitor Portal",
    CONFIG_APP_DATA_URL = page.catalog.dataURI,
    CONFIG_APP_DATA_SERVICE = page.catalog.service,
    CONFIG_APP_DATA_CACHE_BUSTING = !0,
    CONFIG_APP_GAZETTEER_URL = "https://data.europa.eu/api/hub/search/gazetteer/",
    CONFIG_APP_UPLOAD_URL = "https://www.europeandataportal.eu/data/api/",
    CONFIG_APP_MATOMO_URL = "",
    CONFIG_APP_LOCALE = "en",
    CONFIG_APP_LOCALE_FALLBACK = "en",
    CONFIG_APP_LANGUAGES = {},
    CONFIG_APP_LOAD_LANGUAGE_1 = "",
    CONFIG_APP_LOAD_LANGUAGE_URL_1 = "",
    CONFIG_APP_AUTH_ENABLE = !1,
    CONFIG_APP_AUTH_SERVICE = "keycloak",
    CONFIG_APP_ENABLE_DATASET_CATEGORIES = !1,
    CONFIG_APP_ENABLE_DATASET_SIMILARDATASETS = !1,
    CONFIG_APP_ENABLE_DATASET_FEEDBACK = !1,
    CONFIG_APP_ENABLE_FILTER_GAZETTEER = !1,
    CONFIG_APP_ENABLE_FILTER_OPERATOR = !1,
    CONFIG_APP_ENABLE_FAVORITES = !1,
    CONFIG_APP_ENABLE_DARK_MODE = !1,
    CONFIG_APP_HEADER_CUSTOM_HTML = "",
    CONFIG_APP_FOOTER_CUSTOM_HTML = "",
    CONFIG_APP_DATASET_DISTRIBUTION_CUSTOM_HTML = "",
    CONFIG_APP_DATASET_INFO_CUSTOM_HTML = "",

    CONFIG_APP_ROUTER_BASE = '/govdata/',
    CONFIG_APP_ROUTER_LIB_BASE = 'https://unpkg.com/peacock-user-ui@latest/dist/',
    CONFIG_APP_ROUTER_REDIRECT_ROOT_TO = "Datasets",
    CONFIG_APP_ROUTER_MODE = "history",

    CONFIG_APP_ROUTER_ROUTE_1_NAME = "foo",
    CONFIG_APP_ROUTER_ROUTE_1_PATH = "/datasets.html",
    CONFIG_APP_ROUTER_ROUTE_1_COMPONENT = "Datasets",
    CONFIG_APP_ROUTER_ROUTE_1_REQUIRES_AUTH = !1;

CONFIG_APP_LANGUAGES = {
  'en': {
    'message': {
      'datasetFacets': {
        'facets': {
          'groups': 'Groups',
          'tags': 'Tags'
        }
      }
    }
  }
};

// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
});

// ----------------------------------------------------------------------------
