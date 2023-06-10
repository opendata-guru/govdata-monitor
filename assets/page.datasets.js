var page = {
	catalog: '',
	catalogParent: '',
    dataURI: 'https://data.europa.eu/api/hub/search/',
	service: 'piveau',
};

var params = new URLSearchParams(window.location.search);

if (params.has('cat')) {
	page.catalog = params.get('cat');
}
if (params.has('in')) {
	page.catalogParent = params.get('in');
}

// sample:
// cat=8196e75f-c45e-4281-ac8f-1803c4e1f3be&in=govdata
// cat=8196e75f-c45e-4281-ac8f-1803c4e1f3be

if (page.catalogParent === 'govdata') {
	page.service = 'ckan';
	page.dataURI = 'https://www.govdata.de/ckan/api/action/';
} else {
	page.service = 'ckan';
//	page.dataURI = 'https://opendata.guru/proxy/cors?url=https://mobilithek.info/mobilithek/api/v1.0/export/datasets/dcatapde';
	page.dataURI = 'https://opendata.guru/proxy/cors?url=https://www.mcloud.de/export/datasets';

//	page.service = MobilithekDistributions;
//	page.dataURI = 'https://mobilithek.info/mobilithek/api/v1.0/export/datasets/dcatapde?page=0&size=10';
//	page.dataURI = 'https://mobilithek.info/mobilithek/api/v1.0/export/datasets/dcatapde';
}

// ----------------------------------------------------------------------------
/*
class MobilithekDistributions {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * @description GET a distribution with the given ID.
   * @returns {Promise}
   */
/*  getSingle(id) {
    return new Promise((resolve, reject) => {
      const endpoint = 'resource_show';
      const reqStr = `${this.baseUrl}${endpoint}`;
      axios.get(reqStr, {
        params: {
          id,
        },
      })
        .then((response) => {
          const dist = response.data.result;
          const distribution = {};
          distribution.accessUrl = dist.access_url;
          distribution.description = dist.description;
          distribution.downloadUrl = dist.url;
          distribution.format = dist.format;
          distribution.id = dist.id;
          distribution.licence = 'unknown';
          distribution.modificationDate = dist.last_modified;
          distribution.releaseDate = dist.created;
          distribution.title = dist.name;
          distribution.urlType = dist.url_type;
          resolve(distribution);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}*/

// ----------------------------------------------------------------------------

var CONFIG_APP_TITLE = "GovData Monitor Portal",
    CONFIG_APP_DATA_URL = page.dataURI,
    CONFIG_APP_DATA_SERVICE = page.service,
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

// ----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
});

// ----------------------------------------------------------------------------
