const express = require('express');
const app = express();

const path = require('path');

const exphbs = require('express-handlebars');
const requestify = require('requestify');


const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = 80;

server.listen(port, (err) => {
    if (err) {
        return console.log('someting bad happened', err);
    }
    console.log(`server is listening on port ${port}`);
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

    });

});

app.post('/logThis', (req, res) => {
    console.log(req.body);
});
