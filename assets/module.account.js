var account = (function () {
    var idUserUnknown = 'account-user-unknown',
        idUserKnown = 'account-user-known',
        idCredentials = 'account-credentials',
        idHello = 'account-hello',
        idLogin = 'account-login',
        idLogout = 'account-logout',
        idName = 'account-name',
        idToken = 'account-token';
    var eventListenerLogin = [];
    var valName = '',
        valToken = '';
    var storageKeyName = 'username',
        storageKeyToken = 'usertoken';

    function install() {
        var html = '';

        html += '<li class="nav-item dropdown">';
        html += '  <a id="' + idUserUnknown + '" class="nav-icon dropdown-toggle d-inline-block" href="#" data-bs-toggle="dropdown">';
        html += '    <i class="align-middle" data-feather="user"></i>';
        html += '  </a>';
        html += '  <a id="' + idUserKnown + '" class="nav-icon dropdown-toggle d-inline-block d-none" href="#" data-bs-toggle="dropdown">';
        html += '    <i class="align-middle" data-feather="user-check"></i>';
        html += '  </a>';

        html += '  <div class="dropdown-menu dropdown-menu-end">';
        html += '    <div style="padding:.5rem 1rem;margin-top:-.5rem;background:#a4e9f4;color:#222;font-size:.9em">This menu is useless but looks great</div>'
        html += '    <div class="dropdown-divider" style="margin-top:0"></div>';
        html += '    <div id="' + idCredentials + '" style="padding:.5rem 1rem;margin-top:-.5rem">';
        html += '      <label for="' + idName + '">Name:</label><input type="text" id="' + idName + '" name="' + idName + '">';
        html += '      <br>';
        html += '      <label for="' + idToken + '">Token:</label><input type="password" id="' + idToken + '" name="' + idToken + '">';
        html += '    </div>'
        html += '    <div id="' + idHello + '" style="padding:.5rem 1rem;margin-top:-.5rem" class="d-none"></div>';
        html += '    <div class="dropdown-divider"></div>';
        html += '    <a id="' + idLogin + '" class="dropdown-item" onclick="accountLogin()">Log in</a>';
        html += '    <a id="' + idLogout + '" class="dropdown-item d-none" onclick="accountLogout()">Log out</a>';
        html += '  </div>';

        html += '</li>';

        var list = document.createElement('ul');
        list.classList.add('navbar-nav');
        list.classList.add('navbar-align');
        list.innerHTML = html;

        var navBars = document.getElementsByClassName('navbar-nav');
        navBars[0].parentElement.appendChild(list);
    }

    function init() {
        valName = localStorage.getItem(storageKeyName) || '';
        valToken = localStorage.getItem(storageKeyToken) || '';

        document.getElementById(idName).value = valName;
        document.getElementById(idToken).value = valToken;

        account.addEventListenerLogin(() => {
            var elems = document.getElementsByClassName('d-loggedin');
            for(var e = 0; e < elems.length; ++e) {
                var elem = elems[e];

                if (account.isLoggedIn()) {
                    elem.classList.remove('d-none');
                } else {
                    elem.classList.add('d-none');
                }
            }
        });

        funcLogin();
    }

    function funcAddEventListenerLogin(func) {
        eventListenerLogin.push(func);
    }

    function dispatchEventStartLoading() {
        eventListenerLogin.forEach(func => func());
    }

    function rapidocLogin() {
        var rapidoc = document.getElementsByTagName('rapi-doc')[0];

        if (rapidoc) {
            rapidoc.setAttribute('api-key-name', 'Authorization');
            rapidoc.setAttribute('api-key-location', 'header');
            rapidoc.setAttribute('api-key-value', 'Bearer ' + valToken);
        }
    }

    function funcIsLoggedIn() {
        return valToken !== '';
    }

    function funcLogin() {
        valName = document.getElementById(idName).value;
        valToken = document.getElementById(idToken).value;

        if (valToken !== '') {
            document.getElementById(idToken).value = '';
            document.getElementById(idHello).innerHTML = 'Hello ' + valName;

            localStorage.setItem(storageKeyName, valName);
            localStorage.setItem(storageKeyToken, valToken);

            document.getElementById(idUserUnknown).classList.add('d-none');
            document.getElementById(idUserKnown).classList.remove('d-none');
            document.getElementById(idLogin).classList.add('d-none');
            document.getElementById(idLogout).classList.remove('d-none');
            document.getElementById(idCredentials).classList.add('d-none');
            document.getElementById(idHello).classList.remove('d-none');

            rapidocLogin();
            dispatchEventStartLoading();
        }
    }

    function funcLogout() {
        valToken = '';
        document.getElementById(idToken).value = '';

        localStorage.removeItem(storageKeyToken);

        document.getElementById(idUserUnknown).classList.remove('d-none');
        document.getElementById(idUserKnown).classList.add('d-none');
        document.getElementById(idLogin).classList.remove('d-none');
        document.getElementById(idLogout).classList.add('d-none');
        document.getElementById(idCredentials).classList.remove('d-none');
        document.getElementById(idHello).classList.add('d-none');

        rapidocLogin();
        dispatchEventStartLoading();
    }

    function funcSendRequest(url, params, successCB, errorCB) {
        var query = [];
        Object.keys(params).forEach((key) => {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        });

        var uri = url + '?' + query.join('&');
        var xhr = new XMLHttpRequest();
        xhr.open('POST', uri, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + valToken);
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var res = JSON.parse(this.responseText);
				if (successCB) {
					successCB(res);
				}
            } else if (this.readyState == 4) {
				var error = JSON.parse(this.responseText);
				if (errorCB) {
					errorCB(error);
				}
            }
        }

        xhr.send();
    }

    install();

    document.addEventListener('DOMContentLoaded', function() {
        init();
    });

    return {
        addEventListenerLogin: funcAddEventListenerLogin,
        isLoggedIn: funcIsLoggedIn,
        login: funcLogin,
        logout: funcLogout,
        sendRequest: funcSendRequest
    };
}());

function accountLogin() {
    account.login();
}

function accountLogout() {
    account.logout();
}