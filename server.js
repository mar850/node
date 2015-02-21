var express = require('express');
var mysql = require('mysql');
var path = require('path');
var stylus = require('stylus');	
var WebSocketServer = require('websocket').server;
//var WebSocketClient = require('websocket').client;
//var WebSocketFrame  = require('websocket').frame;
//var WebSocketRouter = require('websocket').router;
//var W3CWebSocket = require('websocket').w3cwebsocket;


var db = mysql.createClient({
host: 'sql3.freemysqlhosting.net'
, database: 'sql368239'
, user: 'sql368239'
, password: 'sW9!vE2*'
});

// funkcja odczytująca css
function compile (str, path) { // Moduł stylus
    return stylus(str)
    .set('filename', path)
    .use(nib());
}

app = express.createServer();
app.use(express.bodyParser()); // przetwarzanie formularza
app.use(express.cookieParser()); 
app.use(express.session({ secret: 'zmienna' })); //obs³uga sesjii 
/**
* kofiguracja aplikacji aplikacjê.
*/
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.set('view options', { layout: false });

app.use(express.static(path.join(__dirname, 'resources')));
/**
* Trasa domyœlna.
*/
// funkcja do css wywołuje funkcje compile
app.use(stylus.middleware(
  { src: __dirname + 'resources'
  , compile: compile
  }
))




app.get('/', function (req, res, next) {
res.render('index');
});


//wyswietlenie listy aktualnych zadan
app.get('/aktualneZadania', function (req, res, next) {
db.query('SELECT * FROM czynnosci INNER JOIN kierowcy ON czynnosci.idkierowcy=kierowcy.idkierowcy', function (err, results) {
res.render('aktualneZadania', { title: 'Express', items: results });
});
});

app.get('/login', function (req, res) {
res.render('login');
});

// przesylamy dane i sprawdzamy czy urzytkownik ktora chce sie zalogować jest w naszej bazie danych
// funkcja sesji i sprawdzania urzytkownika w trakcie implementacji
app.post('/index', function(req, res, next) {
  res.render('panel', { title: 'Panel Administratora'});
});

// zwracanie strony z panelem administratora
app.get('/panel', function(req, res, next) {
  res.render('panel', { title: 'Express' });
});

// zwracanie strony z panelem administratora 
app.get('/new_task', function(req, res, next) {
  db.query('SELECT * FROM klienci, kierowcy', function (err, results) {
res.render('new_task', { title: 'Express', items: results });

console.log(JSON.stringify(results));
});



});

// post który ma za zadanie dodać produkt do bazy, funkcja do niego jest w trakcie implementacji

app.post('/new_task', function (req, res, next) {
db.query('INSERT INTO czynnosci SET idklienta = ?, idkierowcy = ?, idkategori = ?, data_planowana = ?, data_rozpoczecia = ?, data_zakonczenia = ?, stan = ?, opis = ?',
[req.body.idklienta, req.body.idkierowcy, req.body.idkategori, req.body.data_planowana, req.body.data_rozpoczecia, req.body.data_zakonczenia, req.body.stan, req.body.opis], function (err, info) {
if (err) return next(err);
console.log(' – produkt dodany z id %s', info.insertId);
res.redirect('/aktualneZadania');
});
});



/**
* Nas³uchuj.
*/
app.listen(3000, function () {
console.log(' – nasluchuje na http://*:3000');
});


//--------------
// Websocket 
wsServer = new WebSocketServer({
    httpServer: app,
    // You should not use autoAcceptConnections for production 
    // applications, as it defeats all standard cross-origin protection 
    // facilities built into the protocol and the browser.  You should 
    // *always* verify the connection's origin and decide whether or not 
    // to accept it. 
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed. 
  return true;
}

wsServer.on('request', function(request) {
    // if (!originIsAllowed(request.origin)) {
    //   // Make sure we only accept requests from an allowed origin 
    //   request.reject();
    //   console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    //   return;
    // }
    
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('przygotowanie do wywylania wiadomosci')
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {

            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

