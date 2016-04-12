function load_settings() {
    chrome.storage.sync.get({
        extension_enabled: true,
        input_ip: '',
        input_port: '80',
        input_username: '',
        input_password: ''
    }, function (items) {
        document.getElementById('extension-enabled').checked = items.extension_enabled;
        document.getElementById('input-ip').value = items.input_ip;
        document.getElementById('input-port').value = items.input_port;
        document.getElementById('input-username').value = items.input_username;
        document.getElementById('input-password').value = items.input_password;
    });
}

function save_enabled() {
    var extension_enabled = document.getElementById('extension-enabled');
    chrome.storage.sync.set({
        extension_enabled: extension_enabled.checked
    });
}

function save_settings() {
    save_enabled();
    var input_ip = document.getElementById('input-ip');
    var input_port = document.getElementById('input-port');
    var input_username = document.getElementById('input-username');
    var input_password = document.getElementById('input-password');
    chrome.storage.sync.set({
        input_ip: input_ip.value,
        input_port: input_port.value,
        input_username: input_username.value,
        input_password: input_password.value
    });
}

function clear_settings() {
    var elements = document.getElementsByClassName('settings text');
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].id == 'input-port') {
            elements[i].value = '80';
        }
        else {
            elements[i].value = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    load_settings();
});

document.getElementById('extension-enabled').addEventListener('click', function () {
    save_enabled();
});

document.getElementById('button-clear').addEventListener('click', function () {
    clear_settings();
});

document.getElementById('button-save').addEventListener('click', function () {
    save_settings();
});
