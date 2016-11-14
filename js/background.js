var production = true;


function log(string) {
    if (!production) {
        console.log(string);
    }
}


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
            "active": "1",
            "1": {
                iphost: "",
                port: "9090",
                addonid: "",
                linktester: false
            },
            "2": {
                iphost: "",
                port: "9090",
                addonid: "",
                linktester: false
            },
            "3": {
                iphost: "",
                port: "9090",
                addonid: "",
                linktester: false
            },
            "4": {
                iphost: "",
                port: "9090",
                addonid: "",
                linktester: false
            }
        }
    },
    get: (this.defaults),
    save: function(new_settings, callback) {
        settings._storage(
            'set',
            new_settings,
            function() {
                settings.get = new_settings;
                if (callback) {
                    callback();
                } else {
                    context_menu();
                }
            }
        );
    },
    load: function(callback) {
        settings._storage(
            'get',
            null,
            function(items) {
                if (JSON.stringify(items) === JSON.stringify({})) {
                    settings.save(settings.defaults, callback);
                } else {
                    settings.get = items;
                    if (callback) {
                        callback();
                    }
                }
            });
    }
};


var context_menu = function() {
    var active = settings.get.profiles.active;
    if ((settings.get.profiles[active].iphost !== '') && (settings.get.profiles[active].port)) {
        chrome.contextMenus.removeAll();
        chrome.contextMenus.create({
            'id': 'send_to_playthis',
            'title': i18n('send_to_playthis'),
            'contexts': ['page', 'frame', 'selection', 'link', 'video', 'audio', 'image'],
            'onclick': context_playthis
        });
        chrome.contextMenus.create({
            'id': 'add_to_playthis',
            'title': i18n('add_to_playthis'),
            'contexts': ['page', 'frame', 'selection', 'link', 'video', 'audio', 'image'],
            'onclick': context_playthis
        });
        chrome.contextMenus.create({
            'id': 'send_text_to_kodi',
            'title': i18n('send_text_to_kodi'),
            'contexts': ['page', 'frame', 'selection', 'link', 'video', 'audio', 'image'],
            'onclick': context_playthis
        });        
        if (settings.get.profiles[active].linktester) {
            chrome.contextMenus.create({
                'id': 'send_to_linktester',
                'title': i18n('send_to_linktester'),
                'contexts': ['page', 'frame', 'selection', 'link', 'video', 'audio', 'image'],
                'onclick': context_playthis
            });
            chrome.contextMenus.create({
                'id': 'add_to_linktester',
                'title': i18n('add_to_linktester'),
                'contexts': ['page', 'frame', 'selection', 'link', 'video', 'audio', 'image'],
                'onclick': context_playthis
            });
        }
    } else {
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
    execute: function(action, addon_id, params) {
        if (rpc.can_connect() !== true) {
            log('rpc.execute(): Connection information missing/incomplete');
            return;
        }
        var conn = new rpc.connection();
        var rpc_request = null;
        var log_lead = 'rpc.execute(\'' + action + '\'):\r\n|url| ' + conn.url + '\r\n';
        switch (action) {
            case 'execute_addon':
                if (addon_id && params) {
                    rpc_request = rpc.stringify.execute_addon(addon_id, params);

                } else {
                    log('rpc.execute(\'' + action + '\'): missing |params|');
                }
                break;
            case 'player_open':
                if (addon_id && params) {
                    rpc_request = rpc.stringify.player_open(addon_id, params);
                } else {
                    log('rpc.execute(\'' + action + '\'): missing |params|');
                }
                break;
            case 'input_send_text':
                if (addon_id && params) {
                    rpc_request = rpc.stringify.input_send_text(params['text']);
                } else {
                    log('rpc.execute(\'' + action + '\'): missing |params|');
                }
                break;                
            default:
                log('rpc.execute(): No |action| provided');
                break;
        }
        if (rpc_request) {
            conn.socket.onopen = function() {
                log(log_lead + '|request| ' + rpc_request);
                conn.socket.send(rpc_request);
            };
            conn.socket.onmessage = function(event) {
                log(log_lead + '|response| ' + event.data);
                conn.socket.close();
            };
            conn.socket.onerror = function(event) {
                if (event.data) {
                    log(log_lead + '|ERROR| ' + event.data);
                }
            };
            conn.socket.onclose = function(event) {
                if ((!event.wasClean) && (event.reason)) {
                    log(log_lead + '|ERROR ' + event.code + '| ' + event.reason);
                }
            };
        }
    },
    json: {
        execute_addon: function(addon_id, params) {
            var active = settings.get.profiles.active;
            var out_json = {
                jsonrpc: '2.0',
                id: 1,
                method: 'Addons.ExecuteAddon',
                params: {
                    wait: false,
                    addonid: addon_id,
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
        player_open: function(addon_id, params) {
            var out_json = {
                jsonrpc: '2.0',
                id: 1,
                method: 'Player.Open',
                params: {
                    item: {
                        file: ''
                    }
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
                return 'plugin://' + addon_id + param_string;
            }
            var addon_url = this.plugin_url(params);
            out_json['params']['item']['file'] = addon_url;
            return out_json;
        },
        input_send_text: function(send_text) {
            var active = settings.get.profiles.active;
            var out_json = {
                jsonrpc: '2.0',
                id: 1,
                method: 'Input.SendText',
                params: {
                    done: false,
                    text: send_text
                }
            };
            return out_json;
        }        
    },
    stringify: {
        execute_addon: function(addon_id, params) {
            return JSON.stringify(rpc.json.execute_addon(addon_id, params));
        },
        player_open: function(addon_id, params) {
            return JSON.stringify(rpc.json.player_open(addon_id, params));
        },
        input_send_text: function(send_text) {
            return JSON.stringify(rpc.json.input_send_text(send_text));
        }        
    }
}


var context_playthis = function(event) {
    var url = null;
    if (event.selectionText) {
        url = event.selectionText;
    } else if ((event.srcUrl) && ((event.mediaType == 'video') || (event.mediaType == 'audio') || (event.mediaType == 'image'))) {
        url = event.srcUrl;
    } else if (event.linkUrl) {
        url = event.linkUrl;
    } else if (event.frameUrl) {
        url = event.frameUrl;
    } else if (event.pageUrl) {
        url = event.pageUrl;
    }

    var execute_params = {};
    var addon_id = '';
    var rpc_request_type = 'execute_addon';
    var set_params = function(_id) {
        switch(_id) {
            case 'plugin.video.link_tester':
                addon_id = 'plugin.video.link_tester';
                if (event.menuItemId.indexOf('send') > -1) {
                    execute_params['mode'] = 'play_link';
                    rpc_request_type = 'player_open';
                } else if (event.menuItemId.indexOf('add') > -1) {
                    execute_params['mode'] = 'add_link';
                    execute_params['refresh'] = 'false';
                } else {
                    execute_params['mode'] = 'add_link';
                    execute_params['refresh'] = 'false';
                }
                execute_params['link'] = url;
                break;
            case 'kodi':
                rpc_request_type = 'input_send_text';
                addon_id = 'kodi';
                execute_params['text'] = url;
                break;
            case 'plugin.video.playthis':
            default:
                addon_id = 'plugin.video.playthis';
                if (event.menuItemId.indexOf('send') > -1) {
                    execute_params['mode'] = 'play';
                    rpc_request_type = 'player_open';
                } else if (event.menuItemId.indexOf('add') > -1) {
                    execute_params['mode'] = 'add';
                } else {
                    execute_params['mode'] = 'play';
                    rpc_request_type = 'player_open';
                }
                execute_params['path'] = url;
                break;
        }
    }

    if (event.menuItemId.indexOf('playthis') > -1) {
        set_params('plugin.video.playthis');
    } else if (event.menuItemId.indexOf('linktester') > -1) {
        set_params('plugin.video.link_tester');
    } else if (event.menuItemId.indexOf('kodi') > -1) {
        set_params('kodi');
    } else {
        set_params('plugin.video.playthis');
    }

    if (url) {
        rpc.execute(rpc_request_type, addon_id, execute_params);
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
                    log('PlayThisSocket: |' + msg.action + '| missing |settings|');
                }
                break;
            case 'execute_addon':
            case 'player_open':
                if (msg.params) {
                    settings.load(function() {
                        rpc.execute(msg.action, msg.params);
                    });
                } else {
                    log('PlayThisSocket: |' + msg.action + '| missing |params|');
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
                    log('PlayThisSocket: |' + msg.action + '| missing |cb_functions|');
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
                log('PlayThisSocket: No valid |action| provided');
                break;
        }
    });
});
