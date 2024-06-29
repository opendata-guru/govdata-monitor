var account = (function () {
    var idUserUnknown = 'account-user-unknown',
        idUserKnown = 'account-user-known',
        idLogin = 'account-login',
        idLogout = 'account-logout';

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
        html += '    <div style="padding:.5rem 1rem;margin-top:-.5rem;background:#a4e9f4;text:#222">This menu is useless but looks great</div>'
        html += '    <div class="dropdown-divider" style="margin-top:0"></div>';
        html += '    <i class="align-middle me-1" data-feather="user"></i> Profile<br>';
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
        console.log('account init');
    }

    function funcLogin() {
        document.getElementById(idUserUnknown).classList.add('d-none');
        document.getElementById(idUserKnown).classList.remove('d-none');
        document.getElementById(idLogin).classList.add('d-none');
        document.getElementById(idLogout).classList.remove('d-none');
    }

    function funcLogout() {
        document.getElementById(idUserUnknown).classList.remove('d-none');
        document.getElementById(idUserKnown).classList.add('d-none');
        document.getElementById(idLogin).classList.remove('d-none');
        document.getElementById(idLogout).classList.add('d-none');
    }

    install();

    document.addEventListener('DOMContentLoaded', function() {
        init();
    });

    return {
        login: funcLogin,
        logout: funcLogout
    };
}());

function accountLogin() {
    account.login();
}

function accountLogout() {
    account.logout();
}