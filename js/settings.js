var settings_port = chrome.runtime.connect({ name: 'SettingsSocket' });


function load_settings() {
    chrome.storage.sync.get({
        input_ip: '',
        input_port: '9090',
    }, function (items) {
        document.getElementById('input-ip').value = items.input_ip;
        document.getElementById('input-port').value = items.input_port;
    });
}


function save_settings() {
    var input_ip = document.getElementById('input-ip');
    var input_port = document.getElementById('input-port');
    chrome.storage.sync.set({
        input_ip: input_ip.value,
        input_port: input_port.value
    });
    settings_port.postMessage({ action: 'load' });
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


document.getElementById('button-clear').addEventListener('click', function () {
    clear_settings();
});


document.getElementById('button-save').addEventListener('click', function () {
    save_settings();
});
