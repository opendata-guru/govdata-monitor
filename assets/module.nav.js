var nav = (function () {
    var lang = '',
        langParam = '',
        defaultLang = 'en';
    var paramLang = 'lang';
    var NAV_MAIN = 'MAIN',
        NAV_MENU = 'MENU',
        NAV_TEST = 'TEST',
        NAV_BASE_URL = 'https://opendata.guru/govdata/',
        navDict = {
            moreApps: {
                de: 'Mehr Apps',
                en: 'More Apps',
            },
        };
        languages = [
        {
            code: 'en',
            image: 'https://opendata.guru/api-data/assets/svqE0.svg',
            title: 'English',
        },
        {
            code: 'de',
            image: 'https://opendata.guru/api-data/assets/smZ1A.svg',
            title: 'Deutsch',
        },
        ],
        navigation = [
        {
            icon: 'map-pin',
            position: NAV_MAIN,
            title: {
                de: 'Karte',
                en: 'Map',
            },
            url: 'index.html',
        },
        {
            icon: 'git-merge',
            position: NAV_MAIN,
            title: {
                de: 'Kataloge',
                en: 'Catalogs',
            },
            url: 'catalogs.html',
        },
        {
            icon: 'shield',
            position: NAV_MAIN,
            title: {
                de: 'Systeme',
                en: 'Systems',
            },
            url: 'systems.html',
        },
        {
            icon: 'terminal',
            position: NAV_MENU,
            title: {
                de: 'API',
                en: 'API',
            },
            url: 'api.html',
        },
        {
            icon: 'activity',
            position: NAV_MENU,
            title: {
                de: 'Metrik',
                en: 'Meter',
            },
            url: 'meter.html',
        },
        {
            icon: 'inbox',
            position: NAV_TEST,
            title: {
                de: 'Datensätze',
                en: 'Datasets',
            },
            url: 'datasets.html',
        },
        {
            icon: 'play',
            position: NAV_TEST,
            title: {
                de: 'Daten-Rennen',
                en: 'Chart Race',
            },
            url: 'race.html',
        },
        {
            icon: 'crosshair',
            position: NAV_TEST,
            title: {
                de: 'Verfolgen',
                en: 'Trace',
            },
            url: 'trace.html',
        },
        {
            icon: 'sun',
            position: NAV_MAIN,
            title: {
                de: 'HVD',
                en: 'HVD',
            },
            url: 'hvd.html',
        },
        {
            icon: 'shopping-cart',
            position: NAV_TEST,
            title: {
                de: 'Fanartikel',
                en: 'Merchandise',
            },
            url: 'https://opendata.guru/shop',
        },
    ];

    function install() {
        var navBar = document.getElementsByClassName('navbar-nav')[0];
        var pathname = document.location.pathname.split('/').splice(-1)[0];
        var submenu = '';

        var submenuItem = document.createElement('li');
        submenuItem.classList.add('nav-item', 'dropdown');

        navigation.forEach(nav => {
            var url = (window.location.protocol === 'file:' ? '' : NAV_BASE_URL) + nav.url;
            var page = url.split('/').splice(-1)[0];
            if (langParam !== '') {
                url += '?' + langParam;
            }

            if (NAV_MAIN === nav.position) {
                var html = '';
                html += '<a class="nav-link" href="' + url + '">';
                html += '  <i class="align-middle" data-feather="' + nav.icon + '"></i> <span class="align-middle">' + nav.title[lang] + '</span>';
                html += '</a>';

                var listItem = document.createElement('li');
                listItem.classList.add('nav-item');
                if (pathname === page) {
                    listItem.classList.add('border-bottom', 'border-4', 'border-info');
                }
                listItem.innerHTML = html;

                navBar.appendChild(listItem);
            } else if (NAV_MENU === nav.position) {
                var classes = ''; 
                if (pathname === page) {
                    classes += 'border-start border-4 border-info';
                    submenuItem.classList.add('border-bottom', 'border-4', 'border-info');
                }

                submenu += '<a class="nav-link ' + classes + '" href="' + url + '">';
                submenu += '  <i class="align-middle" data-feather="' + nav.icon + '"></i> <span class="align-middle">' + nav.title[lang] + '</span>';
                submenu += '</a>';
            } else if (NAV_TEST === nav.position) {
            }
        });

        var html = '';
        html += '<a class="nav-link dropdown-toggle d-inline-block" href="#" data-bs-toggle="dropdown">';
        html += '  <i class="align-middle" data-feather="grid"></i> <span class="align-middle">' + navDict.moreApps[lang] + '</span>';
        html += '</a>';

        html += '<div class="dropdown-menu">';
        html += submenu;
        html += '<div class="dropdown-divider"></div>';
        html += '<div class="text-center">';
        languages.forEach(language => {
            html += '<a href="#" onclick="nav.setLanguage(\'' + language.code + '\')" style="margin:0 .5em">';
            html += '<img src="' + language.image + '" style="height:1.4em" alt="' + language.title + '" title="' + language.title + '">';
            html += '</a>';
        });
        html += '</div>';
        html += '</div>';

        submenuItem.innerHTML = html;

        navBar.appendChild(submenuItem);
    }

    function init() {
    }

    function initLanguage() {
        var params = new URLSearchParams(window.location.search);

        if (params.has(paramLang)) {
            lang = params.get(paramLang);
        } else {
            lang = defaultLang;
        }
        langParam = (lang === defaultLang ? '' : 'lang=' + encodeURIComponent(lang));
    }

    initLanguage();
    install();

    function funcSetLanguage(language) {
        if (lang === language) {
            return;
        }

        lang = language;
        langParam = (lang === defaultLang ? '' : 'lang=' + encodeURIComponent(lang));

        if (nav) {
            nav.lang = lang;
            nav.langAsURLParam = langParam;
        }

        var params = new URLSearchParams(window.location.search);
        if (lang === defaultLang) {
            params.delete(paramLang);
        } else {
            params.set(paramLang, lang);
        }
        window.history.pushState({}, '', `${location.pathname}?${params}`);

        window.location.reload();
    }

    document.addEventListener('DOMContentLoaded', function() {
        init();
    });

    return {
        lang: lang,
        langAsURLParam: langParam,
        setLanguage: funcSetLanguage,
    };
}());
