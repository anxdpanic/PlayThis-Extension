var remote_settings = null;


chrome.storage.sync.get({
    extension_enabled: true,
    input_ip: '',
    input_port: '9090',
}, function (items) {
    if ((items.extension_enabled === true) && (items.input_ip !== '') && (items.input_port !== '')) {
        remote_settings = items;
        chrome.contextMenus.create({
            'title': i18n('sendto'),
            'contexts': ['page', 'frame', 'selection', 'link', 'video'],
            'onclick': context_playthis
        });
    }
});


chrome.runtime.onConnect.addListener(function (port) {
    console.assert(port.name == 'KodiSocket');
    port.onMessage.addListener(function (msg) {
        if (msg.details.ip && msg.details.port && msg.action && msg.details.url) {
            execute_rpc(msg.details.ip, msg.details.port, msg.action, msg.details.url);
        }
        else {
            console.log('KodiSocket: missing required information')
        }
    });
});


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
        execute_rpc(remote_settings.input_ip, remote_settings.input_port, 'playthis', url)
    }
};


function i18n(i18n_data) {
    return chrome.i18n.getMessage(i18n_data);
}
