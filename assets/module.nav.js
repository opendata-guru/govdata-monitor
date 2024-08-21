var nav = (function () {
    var NAV_MAIN = 'MAIN',
        NAV_MENU = 'MENU',
        NAV_TEST = 'TEST',
        navDict = {
            moreApps: {
                de: 'Mehr Apps',
                en: 'More Apps',
            },
        };
        navigation = [
        {
            icon: 'map-pin',
            position: NAV_MAIN,
            title: {
                de: 'Karte',
                en: 'Map',
            },
            url: 'https://opendata.guru/govdata/index.html',
        },
        {
            icon: 'git-merge',
            position: NAV_MAIN,
            title: {
                de: 'Kataloge',
                en: 'Catalogs',
            },
            url: 'https://opendata.guru/govdata/catalogs.html',
        },
        {
            icon: 'shield',
            position: NAV_MAIN,
            title: {
                de: 'Systeme',
                en: 'Systems',
            },
            url: 'https://opendata.guru/govdata/systems.html',
        },
        {
            icon: 'terminal',
            position: NAV_MENU,
            title: {
                de: 'API',
                en: 'API',
            },
            url: 'https://opendata.guru/govdata/api.html',
        },
        {
            icon: 'activity',
            position: NAV_MENU,
            title: {
                de: 'Metrik',
                en: 'Meter',
            },
            url: 'https://opendata.guru/govdata/meter.html',
        },
        {
            icon: 'inbox',
            position: NAV_TEST,
            title: {
                de: 'Datensätze',
                en: 'Datasets',
            },
            url: 'https://opendata.guru/govdata/datasets.html',
        },
        {
            icon: 'play',
            position: NAV_TEST,
            title: {
                de: 'Daten-Rennen',
                en: 'Chart Race',
            },
            url: 'https://opendata.guru/govdata/race.html',
        },
        {
            icon: 'crosshair',
            position: NAV_TEST,
            title: {
                de: 'Verfolgen',
                en: 'Trace',
            },
            url: 'https://opendata.guru/govdata/trace.html',
        },
        {
            icon: 'sun',
            position: NAV_MAIN,
            title: {
                de: 'HVD',
                en: 'HVD',
            },
            url: 'https://opendata.guru/govdata/hvd.html',
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
        var lang = 'en';

        navigation.forEach(nav => {
            if (NAV_MAIN === nav.position) {
                var html = '';
                html += '<a class="nav-link" href="' + nav.url + '">';
                html += '  <i class="align-middle" data-feather="' + nav.icon + '"></i> <span class="align-middle">' + nav.title[lang] + '</span>';
                html += '</a>';

                var listItem = document.createElement('li');
                listItem.classList.add('nav-item');
                if (pathname === nav.url.split('/').splice(-1)[0]) {
                    listItem.classList.add('border-bottom', 'border-4', 'border-info');
                }
                listItem.innerHTML = html;

                navBar.appendChild(listItem);
            }
        });

        var listItem = document.createElement('li');
        listItem.classList.add('nav-item', 'dropdown');

        var html = '';
        html += '<a class="nav-link dropdown-toggle d-inline-block" href="#" data-bs-toggle="dropdown">';
        html += '  <i class="align-middle" data-feather="grid"></i> <span class="align-middle">' + navDict.moreApps[lang] + '</span>';
        html += '</a>';

        html += '<div class="dropdown-menu">';
        navigation.forEach(nav => {
            if (NAV_MENU === nav.position) {
//            if (NAV_TEST === nav.position) {
                    var classes = ''; 
                if (pathname === nav.url.split('/').splice(-1)[0]) {
                    classes += 'border-start border-4 border-info';
                    listItem.classList.add('border-bottom', 'border-4', 'border-info');
                }

                html += '<a class="nav-link ' + classes + '" href="' + nav.url + '">';
                html += '  <i class="align-middle" data-feather="' + nav.icon + '"></i> <span class="align-middle">' + nav.title[lang] + '</span>';
                html += '</a>';
            }
        });
        html += '</div>';

        listItem.innerHTML = html;

        navBar.appendChild(listItem);
    }

    function init() {
    }

    install();

    document.addEventListener('DOMContentLoaded', function() {
        init();
    });

    return {
    };
}());
