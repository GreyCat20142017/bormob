const express = require('express');
const path = require('path');
const mysql = require('mysql');

const PAGINATION_STEP = 20;
const {CONFIG} = require('./config');
const {getValue} = require('./functions');

const app = express();

let currentPassword = getValue('-p');
currentPassword = currentPassword ? currentPassword : CONFIG.password;

const connection = mysql.createConnection({
  host: CONFIG.host,
  user: CONFIG.user,
  password: currentPassword,
  database: CONFIG.database
});

connection.connect();

app.set('port', (process.env.PORT || 3377));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(function (err, req, res, next) {
  res.status(500).send('Something broke!');
});

app.get('/', (req, res) => {
  res.send('Bormo');
});

app.get('/courses', function (req, res) {
  const sql = 'SELECT course as name, CEIL(SUM(1)/20) as lastlesson FROM words GROUP BY course;';
  connection.query(sql,
    function (err, rows) {
      res.send(err ? {'error': err.message} : rows);
    });
});

app.get('/courses/:course/:lesson', (req, res) => {
  const course = req.params.course ? req.params.course.trim() : 'Basic';
  const lesson = req.params.lesson ? parseInt(req.params.lesson, 10) : 1;
  const offset = (lesson - 1) * PAGINATION_STEP || 0;
  const sql = 'SELECT TRIM(english) AS english, TRIM(russian) AS russian FROM words WHERE course="' + course.trim() + '" LIMIT ' + PAGINATION_STEP + ' OFFSET ' + offset + ';';
  connection.query(sql,
    function (err, rows) {
      res.send(err ? {'error': err.message} : rows);
    });
});


app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));