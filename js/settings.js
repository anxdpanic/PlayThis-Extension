var default_enabled = true;
var default_port = '80';

function toBool(val) {
    if (val == 'true' || val == true) return true;
    else return false;
}

function loadSettings() {
    var is_enabled = localStorage['extension_enabled'];
    if (typeof is_enabled === 'undefined') {
        is_enabled = default_enabled;
    };
    var element = document.getElementById('extension-enabled');
    element.checked = toBool(is_enabled);

    var elements = document.getElementsByClassName('settings text');
    for (var i = 0; i < elements.length; i++) {
        var val = localStorage[elements[i].id];
        if (typeof val === 'undefined') {
            if (elements[i].id == 'input-port') {
                val = default_port;
            }
            else {
                val = '';
            }
        }
        elements[i].value = val;
    }
}

function saveEnabled() {
    var element = document.getElementById('extension-enabled');
    localStorage['extension_enabled'] = element.checked;
}

function saveSettings() {
    saveEnabled();
    var elements = document.getElementsByClassName('settings text');
    for (var i = 0; i < elements.length; i++) {
        localStorage[elements[i].id] = elements[i].value;
    }
}

function clearSettings() {
    var elements = document.getElementsByClassName('settings text');
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].id == 'input-port') {
            elements[i].value = default_port;
        }
        else {
            elements[i].value = '';
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadSettings();
});

document.getElementById('extension-enabled').addEventListener('click', function () {
    saveEnabled();
});

document.getElementById('button-clear').addEventListener('click', function () {
    clearSettings();
});

document.getElementById('button-save').addEventListener('click', function () {
    saveSettings();
});
