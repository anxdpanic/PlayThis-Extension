var remote_settings = null;


load_settings()


chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name == 'SettingsSocket');
    port.onMessage.addListener(function (msg) {
        switch (msg.action) {
            case 'load':
                load_settings();
                break;
            default:
                console.log('SettingsSocket: No valid action provided');
        }
    });
});


function load_settings() {
    chrome.storage.sync.get({
        input_ip: '',
        input_port: '9090',
    }, function (items) {
        remote_settings = items;
        if ((items.input_ip !== '') && (items.input_port !== '')) {
			chrome.contextMenus.removeAll();
            chrome.contextMenus.create({
                'title': i18n('sendto'),
                'contexts': ['page', 'frame', 'selection', 'link', 'video'],
                'onclick': context_playthis
            });
        }
        else {
            chrome.contextMenus.removeAll();
        }
    });
}


function execute_rpc(ip, port, action, url) {
    var kodi_url = 'ws://' + ip + ':' + port + '/jsonrpc';
    switch (action) {
        case 'playthis':
            if (url) {
                var kodi_socket = new WebSocket(kodi_url);
                var jrpc = executeaddon_json(url);
                kodi_socket.onopen = function (event) {
                    kodi_socket.send(jrpc);
                };
                kodi_socket.onmessage = function (event) {
                    console.log(event.data);
                    kodi_socket.close();
                };
            }
            break;
        default:
            console.log('execute_rpc: No action provided');
    }
}


function executeaddon_json(url) {
    var jrpc = {
        jsonrpc: '2.0',
        id: 1,
        method: 'Addons.ExecuteAddon',
        params: {
            wait: false,
            addonid: 'plugin.video.playthis',
            params: {
                path: encodeURIComponent(url),
                mode: 'play'
            }
        }
    };
    return JSON.stringify(jrpc);
}


var context_playthis = function (event) {
    var url = null;
    if (event.selectionText) {
        url = event.selectionText;
    }
    else if (event.frameUrl) {
        url = event.frameUrl;
    }
	else if (event.srcUrl) {
        url = event.srcUrl;
    }
	else if (event.linkUrl) {
        url = event.linkUrl;
    }
    else if (event.pageUrl) {
        url = event.pageUrl;
    }
    if (url) {
        execute_rpc(remote_settings.input_ip, remote_settings.input_port, 'playthis', url);
    }
};


function i18n(i18n_data) {
    return chrome.i18n.getMessage(i18n_data);
}
