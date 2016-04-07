function i18n() {
    var elements = document.getElementsByClassName('settings header');
    for (var i = 0; i < elements.length; i++) {
        elements[i].innerHTML = chrome.i18n.getMessage(elements[i].getAttribute('data-i18n'));
    }
    var elements = document.getElementsByClassName('settings label');
    for (var i = 0; i < elements.length; i++) {
        elements[i].innerHTML = chrome.i18n.getMessage(elements[i].getAttribute('data-i18n'));
    }
    var elements = document.getElementsByClassName('settings button');
    for (var i = 0; i < elements.length; i++) {
        elements[i].innerHTML = chrome.i18n.getMessage(elements[i].getAttribute('data-i18n'));
    }
}


document.addEventListener('DOMContentLoaded', function () {
    i18n();
});