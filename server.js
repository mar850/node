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
console.log(' – zadanie dodane z id %s', info.insertId);
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
            var messageJSON = JSON.parse(message.utf8Data);
            
            switch (messageJSON.task) {
            case 'log_me_in':
            	db.query('SELECT idkierowcy FROM admin WHERE login = ?',[messageJSON.login], function (err, result) {
				if (err) {
					console.log('Błąd zapytania do bazy danych: ' + err);
					connection.sendUTF("Wystąpił błąd w zapytaniu do bazy danych.")
					}
				else if (JSON.stringify(result) === '[]') {
					console.log('Autoryzacja uzytkownika o loginie ' + messageJSON.login + ' nie udała się.');
					connection.sendUTF("Błędne dane do logowania.");
					}
					else {
					console.log('Zalogowano kierowcę. Wysyłam kierowcy jego id');
					var send = result;
					send.push({'task':'log_me_in'});
					connection.sendUTF(JSON.stringify(send));
					}					
				});
				break;
			case 'show_task': //id zadania, nazwa klienta
				switch (messageJSON.state) {
					case 'actual':
						db.query('SELECT idczynnosci,firma,data_rozpoczecia,opis FROM czynnosci INNER JOIN klienci ON czynnosci.idklienta=klienci.idklienta WHERE idkierowcy = ? AND data_zakonczenia IS NULL',
						[messageJSON.idkierowcy], function (err, result) {
						if (err) {
							console.log('Błąd zapytania do bazy danych: ' + err);
							connection.sendUTF("Wystąpił błąd w zapytaniu do bazy danych. Poinformuj proszę o tym administratora.")
							}
						else if (JSON.stringify(result) === '[]') {
							console.log('Nie znaleziono aktualnych zadan przypisanych do kierowcy o id ' + messageJSON.idkierowcy);
							connection.sendUTF("Brak aktualnych zadań");
							}
							else {
							console.log('Wysłano aktualne zadania kierowcy o id:', messageJSON.idkierowcy);
							connection.sendUTF(JSON.stringify(result));
							}					
						});
						break;
						
					case 'planning':
						db.query('SELECT idczynnosci,firma,data_planowana,opis FROM czynnosci INNER JOIN klienci ON czynnosci.idklienta=klienci.idklienta WHERE idkierowcy = ? AND data_planowana > CURDATE()',
						[messageJSON.idkierowcy], function (err, result) {
						if (err) {
							console.log('Błąd zapytania do bazy danych: ' + err);
							connection.sendUTF("Wystąpił błąd w zapytaniu do bazy danych. Poinformuj proszę o tym administratora.")
							}
						else if (JSON.stringify(result) === '[]') {
							console.log('Nie znaleziono planowanych zadan przypisanych do kierowcy o id ' + messageJSON.idkierowcy);
							connection.sendUTF("Brak planowanych zadań");
							}
							else {
							console.log('Wysłano planowane zadania kierowcy o id:', messageJSON.idkierowcy);
							connection.sendUTF(JSON.stringify(result));
							}					
						});
						break;
						
					case 'finished':
						db.query('SELECT idczynnosci,firma,data_rozpoczecia,data_zakonczenia,opis FROM czynnosci INNER JOIN klienci ON czynnosci.idklienta=klienci.idklienta WHERE idkierowcy = ? AND data_zakonczenia IS NOT NULL',
						[messageJSON.idkierowcy], function (err, result) {
						if (err) {
							console.log('Błąd zapytania do bazy danych: ' + err);
							connection.sendUTF("Wystąpił błąd w zapytaniu do bazy danych. Poinformuj proszę o tym administratora.")
							}
						else if (JSON.stringify(result) === '[]') {
							console.log('Nie znaleziono zakończonych zadan przypisanych do kierowcy o id ' + messageJSON.idkierowcy);
							connection.sendUTF("Brak zakończonych zadań");
							}
							else {
							console.log('Wysłano zakończone zadania kierowcy o id:', messageJSON.idkierowcy);
							connection.sendUTF(JSON.stringify(result));
							}					
						});
						break;
				}
				break;
				
			default:
				console.log("Otrzymano nieznany komunikat:", messageJSON.task);
				connection.sendUTF("Nieznany komunikat", messageJSON.task);
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

