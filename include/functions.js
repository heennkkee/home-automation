var available_pins = {
    2: {
        sending: false
    }
};

var socket = io.connect();

socket.on('drawPinState', function (data) {
    available_pins[data.pin].sending = false;
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

    if (available_pins[pin].sending) {
        console.log("already requesting on pin " + pin);
        return;
    }

    var value = me.checked ? 1 : 0;

    available_pins[pin].sending = true;

    socket.emit('set', {pin: pin, val: value});
    event.preventDefault();
}

function pinState(pin) {
    socket.emit('read', {pin: pin});
}

function onLoad() {
    for (x in Object.keys(available_pins)) {
        pinState(Object.keys(available_pins)[x]);
    }
    setInterval(function() {
        document.getElementById('log').innerHTML = (new Date().toISOString()) + ': ' + String(socket.connected) + '<br>' + document.getElementById('log').innerHTML;
    }, 1000);
}
