var express = require('express');
var mysql = require('mysql');
var path = require('path');
var stylus = require('stylus');	
var md5 = require('MD5');
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
console.log(' – zadanie dodane z id %s', info.insertId);
res.redirect('/aktualneZadania');
});
});

app.post('/usuwanieZadania/:idczynnosci', function (req, res, next) {
db.query('DELETE FROM czynnosci WHERE idczynnosci = ?',
[req.params.idczynnosci], function (err, info) {
if (err) return next(err);
console.log(' – czynnosc usunieta z id %s', info.insertId);
res.redirect('/aktualneZadania');
});
});



app.get('/kategorie', function(req, res, next) {
  db.query('SELECT * FROM kategorie', function (err, results) {
res.render('kategorie', { title: 'Express', items: results });

});
});

app.post('/kategorie', function (req, res, next) {
db.query('INSERT INTO kategorie SET nazwakat = ?',
[req.body.nazwakat], function (err, info) {
if (err) return next(err);
console.log(' – kategoria dodana z id %s', info.insertId);
res.redirect('/kategorie');
});
});

app.post('/usuwanie/:idkat', function (req, res, next) {
db.query('DELETE FROM kategorie WHERE idkat = ?',
[req.params.idkat], function (err, info) {
if (err) return next(err);
console.log(' – kategoria usunieta z id %s', info.insertId);
res.redirect('/kategorie');
});
});

app.get('/klienci', function(req, res, next) {
  db.query('SELECT * FROM klienci', function (err, results) {
res.render('klienci', { title: 'Express', items: results });

});
});

app.post('/klienci', function (req, res, next) {
db.query('INSERT INTO klienci SET imie = ?, nazwisko = ?, firma = ?, adres = ?, miasto = ?, wojew = ?, kod_poczt = ?, kraj = ?',
[req.body.imie, req.body.nazwisko, req.body.firma, req.body.adres, req.body.miasto, req.body.wojew, req.body.kod_poczt, req.body.kraj ], function (err, info) {
if (err) return next(err);
console.log(' – kategoria dodana z id %s', info.insertId);
res.redirect('/klienci');
});
});

app.post('/usuwanieKlienta/:idklienta', function (req, res, next) {
db.query('DELETE FROM klienci WHERE idklienta = ?',
[req.params.idklienta], function (err, info) {
if (err) return next(err);
console.log(' – klient usuniety z id %s', info.insertId);
res.redirect('/klienci');
});
});



app.get('/kierowcy', function(req, res, next) {
  db.query('SELECT * FROM kierowcy', function (err, results) {
res.render('kierowcy', { title: 'Express', items: results });

});
});

app.post('/kierowcy', function (req, res, next) {
db.query('INSERT INTO kierowcy SET imie = ?, nazwisko = ?, adres = ?, miasto = ?, wojew = ?, kod_poczt = ?, kraj = ?',
[req.body.imie, req.body.nazwisko, req.body.adres, req.body.miasto, req.body.wojew, req.body.kod_poczt, req.body.kraj ], function (err, info) {
if (err) return next(err);
console.log(' – kierowca dodany z id %s', info.insertId);
res.redirect('/kierowcy');
});
});

app.post('/usuwanieKierowcy/:idkierowcy', function (req, res, next) {
db.query('DELETE FROM kierowcy WHERE idkierowcy = ?',
[req.params.idkierowcy], function (err, info) {
if (err) return next(err);
console.log(' – kierowca usuniety z id %s', info.insertId);
res.redirect('/kierowcy');
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
        	console.log('Otrzymana wiadomość: ' + message.utf8Data);
            var receivedJSON = JSON.parse(message.utf8Data);
            var sentJSON = {};
            switch (receivedJSON.task) {
            case 'log_me_in':
            	sentJSON.task = "log_me_in";
            	db.query('SELECT idkierowcy FROM admin WHERE login = ? AND haslo = ?',[receivedJSON.login, md5(receivedJSON.haslo)], function (err, result) {
				if (err) {
					console.log('Błąd zapytania do bazy danych: ' + err);
					sentJSON.success = false;
					connection.sendUTF(JSON.stringify(sentJSON));
					}
				else if (JSON.stringify(result) === '[]') {
					console.log('Autoryzacja uzytkownika o loginie ' + receivedJSON.login + ' nie udała się.');
					sentJSON.succes = false;
					connection.sendUTF(JSON.stringify(sentJSON));
					}
					else {
						console.log('Zalogowano kierowcę. Wysyłam kierowcy jego id');
						sentJSON.success = true;
						var details = [];
						result.forEach(function (item){
							details.push(item)
						});
						sentJSON.details = details;
						connection.sendUTF(JSON.stringify(sentJSON));
					}					
				});
				break;
			case 'show_task': //id zadania, nazwa klienta
				sentJSON.task = 'show_task';
				switch (receivedJSON.state) {
					case 'actual':
						sentJSON.state = 'actual';
						db.query('SELECT idczynnosci,firma,data_rozpoczecia,opis FROM czynnosci INNER JOIN klienci ON czynnosci.idklienta=klienci.idklienta WHERE idkierowcy = ? AND data_zakonczenia IS NULL',
						[receivedJSON.idkierowcy], function (err, result) {
						if (err) {
							console.log('Błąd zapytania do bazy danych: ' + err);
							sentJSON.success = false;
							connection.sendUTF(sentJSON)
							}
						else if (JSON.stringify(result) === '[]') {
							console.log('Nie znaleziono aktualnych zadan przypisanych do kierowcy o id ' + receivedJSON.idkierowcy);
							sentJSON.success = false;
							var details = [];
							sentJSON.details = details;
							connection.sendUTF(sentJSON);
							}
							else {
								console.log('Wysłano aktualne zadania kierowcy o id:', receivedJSON.idkierowcy);
								sentJSON.success = true;
								var details = [];
								result.forEach(function (item){
									details.push(item)
								});
								sentJSON.details = details;
								connection.sendUTF(JSON.stringify(sentJSON));
							}					
						});
						break;
						
					case 'planning':
						sentJSON.state = 'planning';
						db.query('SELECT idczynnosci,firma,data_planowana,opis FROM czynnosci INNER JOIN klienci ON czynnosci.idklienta=klienci.idklienta WHERE idkierowcy = ? AND data_planowana > CURDATE()',
						[receivedJSON.idkierowcy], function (err, result) {
						if (err) {
							console.log('Błąd zapytania do bazy danych: ' + err);
							sentJSON.success = false;
							connection.sendUTF(sentJSON);
						}
						else if (JSON.stringify(result) === '[]') {
							console.log('Nie znaleziono aktualnych zadan przypisanych do kierowcy o id ' + receivedJSON.idkierowcy);
							sentJSON.success = false;
							var details = [];
							sentJSON.details = details;
							connection.sendUTF(sentJSON);
							}
							else {
								console.log('Wysłano planowane zadania kierowcy o id:', receivedJSON.idkierowcy);
								sentJSON.success = true;
								var details = [];
								result.forEach(function (item){
									details.push(item)
								});
								sentJSON.details = details;
								connection.sendUTF(JSON.stringify(sentJSON));
							}					
						});
						break;
						
					case 'finished':
						sentJSON.state = 'finished';
						db.query('SELECT idczynnosci,firma,data_rozpoczecia,data_zakonczenia,opis FROM czynnosci INNER JOIN klienci ON czynnosci.idklienta=klienci.idklienta WHERE idkierowcy = ? AND data_zakonczenia IS NOT NULL',
						[receivedJSON.idkierowcy], function (err, result) {
						if (err) {
							console.log('Błąd zapytania do bazy danych: ' + err);
							sentJSON.success = false;
							connection.sendUTF(sentJSON);
							}
						else if (JSON.stringify(result) === '[]') {
							console.log('Nie znaleziono zakończonych zadan przypisanych do kierowcy o id ' + receivedJSON.idkierowcy);
							sentJSON.success = false;
							var details = [];
							sentJSON.details = details;
							connection.sendUTF(sentJSON);
							}
							else {
								console.log('Wysłano zakończone zadania kierowcy o id:', receivedJSON.idkierowcy);
								sentJSON.success = true;
								var details = [];
								result.forEach(function (item){
									details.push(item)
								});
								sentJSON.details = details;
								connection.sendUTF(JSON.stringify(sentJSON));
							}					
						});
						break;
				}
				break;
				
			default:
				console.log("Otrzymano nieznany komunikat:", receivedJSON.task);
				sentJSON.task = 'undefined';
				sentJSON.success = false;
            }
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

