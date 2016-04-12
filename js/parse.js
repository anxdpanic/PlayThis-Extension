init();


function init() {
    chrome.storage.sync.get({
        extension_enabled: true,
        input_ip: '',
        input_port: '80',
        input_username: '',
        input_password: ''
    }, function (items) {
        if ((items.extension_enabled === true) && (items.input_ip !== '') && (items.input_port !== '') && (items.input_username !== '') && (items.input_password !== '')) {
            fetch(chrome.runtime.getURL('../json/smu_pads.json'))
              .then(function (response) {
                  return response.text();
              }).then(function (text) {
                  // got encoded json, decode and parse page
                  parse(JSON.parse(atob(text)), items);
              });
        }
    });
}


function parse(smu, settings) {

    var hrefs = document.getElementsByTagName('a');
    var scripts = document.getElementsByTagName('script');
    var videos = document.getElementsByTagName('source');

}
