var page = {
};

// ----------------------------------------------------------------------------

var CONFIG_APP_TITLE = "GovData Monitor Portal",
    CONFIG_APP_DATA_URL = "https://data.europa.eu/api/hub/search/",
    CONFIG_APP_DATA_SERVICE = "piveau",
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
