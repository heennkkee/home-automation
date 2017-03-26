const express = require('express');
const exphbs = require('express-handlebars');
const requestify = require('requestify');

const app = express();

const path = require('path');

const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = 80;



// Get internal IP
const os = require('os');
var internalIP;
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }
    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      internalIP = iface.address;
    }
    ++alias;
  });
});

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'include')));

io.on('connection', function (socket) {
    // URL TO THE ESP8266 WE'RE CONTROLLING!
    var url = '192.168.1.53';

    socket.on('set', function (data) {
        var val = data.val;
        requestify.get('http://' + url + '/set' + '?pin=' + data.pin + '&val=' + val)
        .then(function(response) {
                var body = response.getBody();
                if (val == body) {
                    io.emit("drawPinState", {pin: data.pin, val: body});
                }
            }
        );
    });

    socket.on('read', function (data) {
        requestify.get('http://' + url + '/read' + '?pin=' + data.pin)
        .then(function(response) {
                socket.emit("drawPinState", {pin: data.pin, val: response.getBody()});
            }
        );
    });
});


app.get('/', (req, res) => {
    res.render('index', {
        internalIP: internalIP
    });

});

app.post('/logThis', (req, res) => {
    console.log(req.body);
});


http.listen(port, (err) => {
    if (err) {
        return console.log('someting bad happened', err);
    }
    console.log(`server is listening on port ${port}`);
})
