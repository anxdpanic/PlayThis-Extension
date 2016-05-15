var settings = {
    _storage: function(action, arg1, arg2) {
        var has_sync = (chrome.storage.sync !== undefined) ? true : false;
        if (has_sync) {
            switch (action) {
                case 'set':
                    chrome.storage.sync.set(arg1, arg2);
                    break;
                case 'get':
                    chrome.storage.sync.get(arg1, arg2);
                    break;
                default:
                    break;
            }
        } else {
            switch (action) {
                case 'set':
                    chrome.storage.local.set(arg1, arg2);
                    break;
                case 'get':
                    chrome.storage.local.get(arg1, arg2);
                    break;
                default:
                    break;
            }
        }
    },
    defaults: {
        profiles: {
            'active': '1',
            '1': {
                iphost: '',
                port: '9090',
                addonid: ''
            },
            '2': {
                iphost: '',
                port: '9090',
                addonid: ''
            },
            '3': {
                iphost: '',
                port: '9090',
                addonid: ''
            },
            '4': {
                iphost: '',
                port: '9090',
                addonid: ''
            }
        }
    },
    get: (this.defaults),
    save: function(new_settings) {
        settings._storage(
            'set',
            new_settings,
            function() {
                settings.get = new_settings;
            }
        );
    },
    load: function(callback) {
        settings._storage(
            'get',
            settings.defaults,
            function(items) {
                settings.get = items;
                if (callback) {
                    callback();
                }
            });
    }
};


var context_menu = function() {
    var active = settings.get.profiles.active;
    if ((settings.get.profiles[active].iphost !== '') && (settings.get.profiles[active].port)) {
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
}


var rpc = {
    can_connect: function() {
        var active = settings.get.profiles.active;
        if ((settings.get.profiles[active].iphost !== '') && (settings.get.profiles[active].port)) {
            return true;
        } else {
            return false;
        }
    },
    connection: function() {
        var active = settings.get.profiles.active;
        this.url = 'ws://' + settings.get.profiles[active].iphost + ':' + settings.get.profiles[active].port + '/jsonrpc';
        this.socket = new WebSocket(this.url);
    },
    execute: function(action, params) {
        if (rpc.can_connect() !== true) {
            console.log('rpc.execute(): Connection information missing/incomplete');
            return;
        }
        var conn = new rpc.connection();
        var rpc_request = null;
        var log_lead = 'rpc.execute(\'' + action + '\'):\r\n|url| ' + conn.url + '\r\n';
        switch (action) {
            case 'execute_addon':
                if (params) {
                    rpc_request = rpc.stringify.execute_addon(params);

                } else {
                    console.log('rpc.execute(\'' + action + '\'): missing |params|');
                }
                break;
            case 'activate_window':
                if (params) {
                    rpc_request = rpc.stringify.activate_window(params);
                } else {
                    console.log('rpc.execute(\'' + action + '\'): missing |params|');
                }
                break;
            default:
                console.log('rpc.execute(): No |action| provided');
                break;
        }
        if (rpc_request) {
            conn.socket.onopen = function() {
                console.log(log_lead + '|request| ' + rpc_request);
                conn.socket.send(rpc_request);
            };
            conn.socket.onmessage = function(event) {
                console.log(log_lead + '|response| ' + event.data);
                conn.socket.close();
            };
            conn.socket.onerror = function(event) {
                if (event.data) {
                    console.log(log_lead + '|ERROR| ' + event.data);
                }
            };
            conn.socket.onclose = function(event) {
                if ((!event.wasClean) && (event.reason)) {
                    console.log(log_lead + '|ERROR ' + event.code + '| ' + event.reason);
                }
            };
        }
    },
    json: {
        execute_addon: function(params) {
            var active = settings.get.profiles.active;
            var out_json = {
                jsonrpc: '2.0',
                id: 1,
                method: 'Addons.ExecuteAddon',
                params: {
                    wait: false,
                    addonid: 'plugin.video.playthis',
                    params: ''
                }
            };
            this.encode_keys = function(eparams) {
                var oparams = {};
                for (var key in eparams) {
                    oparams[key] = encodeURIComponent(eparams[key]);
                }
                return oparams;
            };
            var outparams = this.encode_keys(params);
            out_json['params']['params'] = outparams;
            return out_json;
        },
        activate_window: function(params) {
            var out_json = {
                jsonrpc: '2.0',
                id: 1,
                method: 'GUI.ActivateWindow',
                params: {
                    window: 'videos',
                    parameters: ['', 'return']
                }
            };
            this.plugin_url = function(pparams) {
                var active = settings.get.profiles.active;
                var param_string = '';
                var connector = '?';

                for (var key in pparams) {
                    if ((param_string) && (connector !== '&')) {
                        connector = '&';
                    }
                    param_string += connector + key + '=' + encodeURIComponent(pparams[key]);
                }
                return 'plugin://plugin.video.playthis' + param_string;
            }
            var addon_url = this.plugin_url(params);
            out_json['params']['parameters'][0] = addon_url;
            return out_json;
        }
    },
    stringify: {
        execute_addon: function(params) {
            return JSON.stringify(rpc.json.execute_addon(params));
        },
        activate_window: function(params) {
            return JSON.stringify(rpc.json.activate_window(params));
        }
    }
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
        rpc.execute('execute_addon', {mode: 'play', path: url});
    }
};


function i18n(data_i18n) {
    return chrome.i18n.getMessage(data_i18n);
}


settings.load(context_menu);


chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == 'PlayThisSocket');
    port.onMessage.addListener(function(msg) {
        switch (msg.action) {
            case 'save_settings':
                if (msg.settings) {
                    settings.save(msg.settings);
                } else {
                    console.log('PlayThisSocket: |' + msg.action + '| missing |settings|');
                }
                break;
            case 'execute_addon':
            case 'activate_window':
                if (msg.params) {
                    settings.load(function() {
                        rpc.execute(msg.action, msg.params);
                    });
                } else {
                    console.log('PlayThisSocket: |' + msg.action + '| missing |params|');
                }
                break;
            case 'with_settings':
                if (msg.cb_functions) {
                    settings.load(function() {
                        port.postMessage({
                            action: 'with_settings',
                            settings: settings.get,
                            cb_functions: msg.cb_functions
                        });
                    });
                } else {
                    console.log('PlayThisSocket: |' + msg.action + '| missing |cb_functions|');
                }
                break;
            case 'get_settings':
                port.postMessage({
                    action: 'get_settings',
                    settings: settings.get
                });
                return true;
                break;
            default:
                console.log('PlayThisSocket: No valid |action| provided');
                break;
        }
    });
});
