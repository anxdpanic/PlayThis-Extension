var smu = JSON.parse(JSON.stringify('{"patterns": null, "supported_domains": null}'));

run();


function run() {
    var client = new XMLHttpRequest();
    client.open('GET', chrome.runtime.getURL("../json/smu_pads.json"));
    client.onreadystatechange = function () {
        if (client.readyState === 4) {
            smu = JSON.parse(atob(client.responseText));
            parse();
        };
    };
    client.send();
}

function parse() {
    var hrefs = document.getElementsByTagName('a');
    var scripts = document.getElementsByTagName('script');
    var videos = document.getElementsByTagName('source');

}