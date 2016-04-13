var settings = null;
var kodiport = chrome.runtime.connect({ name: 'KodiSocket' });


init();


function init() {

    chrome.storage.sync.get({
        extension_enabled: true,
        input_ip: '',
        input_port: '9090',
    }, function (items) {
        settings = items;
        if ((items.extension_enabled === true) && (items.input_ip !== '') && (items.input_port !== '')) {
            fetch(chrome.runtime.getURL('../json/smu_pads.json'))
              .then(function (response) {
                  return response.text();
              }).then(function (text) {
                  // got encoded json, decode and parse page
                  parse(JSON.parse(atob(text)));
              });
        }
    });
}


function parse(smu) {
    /*
    var hrefs = document.getElementsByTagName('a');
    var scripts = document.getElementsByTagName('script');
    var videos = document.getElementsByTagName('source');
    */
}


function playthis(ip, port, url) {
    kodiport.postMessage({ action: 'playthis', details: { ip: ip, port: port, url: url } });
}
