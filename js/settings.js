function load_settings() {
    chrome.storage.sync.get({
        extension_enabled: true,
        input_ip: '',
        input_port: '9090',
    }, function (items) {
        document.getElementById('extension-enabled').checked = items.extension_enabled;
        document.getElementById('input-ip').value = items.input_ip;
        document.getElementById('input-port').value = items.input_port;
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
    chrome.storage.sync.set({
        input_ip: input_ip.value,
        input_port: input_port.value
    });
}

function clear_settings() {
    var elements = document.getElementsByClassName('settings text');
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].id == 'input-port') {
            elements[i].value = '9090';
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
