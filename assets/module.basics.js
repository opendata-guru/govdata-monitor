var basics = (function () {
    var layers = [];
    var dict = {
        de: {
            international: 'International',
            supranational: 'Europa',
            supranationalAgency: 'Europäische Behörde',
            country: 'Staat',
            countryAgency: 'Staatliche Behörde',
            federal: 'Bund',
            federalAgency: 'Bundesbehörde',
            state: 'Land',
            stateAgency: 'Landesamt',
            state_municipality: 'Land und Stadt',
            governmentRegion: 'Regierungsbezirk',
            regionalNetwork: 'Region',
            district: 'Kreis',
            districtAgency: 'Kreisverwaltung',
            collectiveMunicipality: 'Gemeindeverband',
            municipality: 'Stadt',
            municipalityAgency: 'Stadtverwaltung',
            business: 'Unternehmen',
            civilSociety: 'Zivilgesellschaft',
            research: 'Forschung',
            religiousCommunity: 'Religionsgemeinschaft',
        },
        en: {
            international: 'International',
            supranational: 'Europe',
            supranationalAgency: 'European authority',
            country: 'Country',
            countryAgency: 'Country authority',
            federal: 'Federal',
            federalAgency: 'Federal agency',
            state: 'State',
            stateAgency: 'State authority',
            state_municipality: 'State and municipality',
            governmentRegion: 'Government region',
            regionalNetwork: 'Regional network',
            district: 'District',
            districtAgency: 'District authority',
            collectiveMunicipality: 'Collective municipality',
            municipality: 'Municipality',
            municipalityAgency: 'Municipal authority',
            business: 'Business',
            civilSociety: 'Civil society',
            research: 'Research',
            religiousCommunity: 'Religious Community',
        },
        };

    function init() {
//        var lang = nav ? nav.lang : 'de';
        var lang = 'de';

        layers['international'] = dict[lang].international;
        layers['supranational'] = dict[lang].supranational;
        layers['supranationalAgency'] = dict[lang].supranationalAgency;
        layers['country'] = dict[lang].country;
        layers['countryAgency'] = dict[lang].countryAgency;
        layers['federal'] = dict[lang].federal;
        layers['federalAgency'] = dict[lang].federalAgency;
        layers['state'] = dict[lang].state;
        layers['stateAgency'] = dict[lang].stateAgency;
        layers['state+municipality'] = dict[lang].state_municipality;
        layers['governmentRegion'] = dict[lang].governmentRegion;
        layers['regionalNetwork'] = dict[lang].regionalNetwork;
        layers['district'] = dict[lang].district;
        layers['districtAgency'] = dict[lang].districtAgency;
        layers['collectiveMunicipality'] = dict[lang].collectiveMunicipality;
        layers['municipality'] = dict[lang].municipality;
        layers['municipalityAgency'] = dict[lang].municipalityAgency;
        layers['business'] = dict[lang].business;
        layers['civilSociety'] = dict[lang].civilSociety;
        layers['research'] = dict[lang].research;
        layers['religiousCommunity'] = dict[lang].religiousCommunity;
    }

    function funcGetTypeString(type) {
        var ret = '';
        Object.keys(layers).forEach(key => {
            if (type === key) {
                ret = dict[nav.lang][key];
            }
        });
        if (ret !== '') {
            return ret;
        }

        if ((type === 'state+municipality') || (type === 'municipality+state')) {
            return dict[nav.lang].state_municipality;
        } else if (type !== '') {
            return '?';
        }

        return '';
    }

    function funcSObjectGetTitle(sObject) {
        if (sObject && sObject.title) {
            if (sObject.title[nav.lang]) {
                return sObject.title[nav.lang];
            }
            if (sObject.title.en) {
                return sObject.title.en;
            }
            return sObject.title[Object.keys(sObject.title)[0]];
        }

        return '';
    }

    function funcPObjectGetTitle(pObject) {
        if (pObject) {
            return funcSObjectGetTitle(pObject.sobject);
        }

        return '';
    }
    function funcLObjectGetTitle(lObject) {
        if (lObject) {
            if (lObject.sobject) {
                return funcSObjectGetTitle(lObject.sobject);
            } else if (lObject.pobject) {
                return funcPObjectGetTitle(lObject.pobject);
            }
            return lObject.title;
        }

        return '';
    }

    init();

    return {
        layer: {
            layers: layers,
            getTypeString: funcGetTypeString,
        },
        lObject: {
            getTitle: funcLObjectGetTitle,
        },
        pObject: {
            getTitle: funcPObjectGetTitle,
        },
        sObject: {
            getTitle: funcSObjectGetTitle,
        },
    };
}());
