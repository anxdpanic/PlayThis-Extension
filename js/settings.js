var port = chrome.runtime.connect({
    name: 'PlayThisSocket'
});


var settings = {
    get: (null),
    load: function(callback_array) {
        port.postMessage({
            action: 'with_settings',
            cb_functions: callback_array
        });
    },
    update: function() {
        var active_profile = settings.get.profiles.active;
        var s = '';
        var i = 0;
        var rads = document.querySelectorAll('input[name="tabs_sub1"]');
        var _length = rads.length;
        for (i = 0; i < _length; i++) {
            if (rads[i].value === active_profile) {
                rads[i].checked = true;
                break;
            }
        }
        for (i = 1; i < 5; i++) {
            s = i.toString();
            document.querySelector('input[id="iphost_' + s + '"]').value = settings.get.profiles[s].iphost;
            document.querySelector('input[id="port_' + s + '"]').value = settings.get.profiles[s].port;
        }
    },
    save: function() {
        var new_settings = {
            profiles: {
                'active': document.querySelector('input[name="tabs_sub1"]:checked').value,
                '1': {
                    iphost: document.querySelector('input[id="iphost_1"]').value,
                    port: document.querySelector('input[id="port_1"]').value
                },
                '2': {
                    iphost: document.querySelector('input[id="iphost_2"]').value,
                    port: document.querySelector('input[id="port_2"]').value
                },
                '3': {
                    iphost: document.querySelector('input[id="iphost_3"]').value,
                    port: document.querySelector('input[id="port_3"]').value
                },
                '4': {
                    iphost: document.querySelector('input[id="iphost_4"]').value,
                    port: document.querySelector('input[id="port_4"]').value
                }
            }
        }
        port.postMessage({
            action: 'save_settings',
            settings: new_settings
        });
    }
}


function load_version() {
    var version_element = document.getElementById('extension_version');
    var inner_text = document.createTextNode(chrome.i18n.getMessage('version') + ': ' + chrome.runtime.getManifest().version);
    version_element.appendChild(inner_text);
}


document.addEventListener('DOMContentLoaded', function() {
    load_version();
    settings.load(['settings.update']);
});


document.getElementById('button-save').addEventListener('click', function() {
    settings.save();
});


radios = document.querySelectorAll('input[name="tabs_sub1"]');
_length = radios.length;
for (i = 0; i < _length; i++) {
    radios[i].addEventListener('click', function() {
        settings.save();
    });
}


port.onMessage.addListener(function(msg) {
    switch (msg.action) {
        case 'with_settings':
            if ((msg.cb_functions) && (msg.settings)) {
                settings.get = msg.settings;
                for (var i = 0; i < msg.cb_functions.length; i++) {
                    switch (msg.cb_functions[i]) {
                        case 'settings.update':
                            settings.update();
                            break;
                        default:
                            break;
                    }
                }
            }
            break;
        default:
            break;
    }
});
