var express = require('express');
var mysql = require('mysql');
var path = require('path');
var stylus = require('stylus');

var db = mysql.createClient({
host: 'localhost'
, database: 'projekt'
, user: 'root'
, password: 'haslo'
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
db.query('SELECT * FROM czynnosci', function (err, results) {
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
  res.render('new_task', { title: 'Express' });
});

// post który ma za zadanie dodać produkt do bazy, funkcja do niego jest w trakcie implementacji

app.post('/new_task', function (req, res, next) {
db.query('INSERT INTO czynnosci SET idklienta = ?, idkierowcy = ?, idkategori = ?, data_planowana = ?, data_rozpoczecia = ?, data_zakonczenia = ?, stan = ?, opis = ?',
[req.body.idklienta, req.params.idkierowcy, req.params.idkategori,  req.params.data_planowana, req.params.data_rozpoczecia, req.params.zakonczenia, req.body.stan, req.body.opis], function (err, info) {
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
