var available_pins = [2];

var socket = io.connect();

socket.on('drawPinState', function (data) {
    if (data.val === "1") {
        document.getElementById('pin_' + data.pin).parentNode.className += " is-checked";
        document.getElementById('pin_' + data.pin).checked = "checked";
    } else {
        document.getElementById('pin_' + data.pin).parentNode.className = document.getElementById('pin_' + data.pin).parentNode.className.replace(" is-checked", "");
        document.getElementById('pin_' + data.pin).checked = "";
    }
});

function setValue(me) {
    var pin = me.getAttribute('data-pin')
    var value = me.parentNode.className.indexOf("is-checked") > -1 ? 0 : 1;

    socket.emit('set', {pin: pin, val: value});
    event.preventDefault();
}

function pinState(pin) {
    socket.emit('read', {pin: pin});
}

function onLoad() {
    for (x in available_pins) {
        pinState(available_pins[x]);
    }
    setInterval(function() {
        document.getElementById('log').innerHTML += (new Date().toISOString()) + ': ' + socket.connected + '<br>';
    }, 1000);
}
