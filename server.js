'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require('dns');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;
const URI =
  'mongodb+srv://miguel:Azerty44@cluster0-dxc9v.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(URI, { useNewUrlParser: true });
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

/*  DB CONFIG */

let urlShortenerSchema = new mongoose.Schema({
  url: String,
  id: Number,
});

let urlShortened = mongoose.model('urlShortened', urlShortenerSchema);

/** this project needs a db !! **/
// mongoose.connect(process.env.DB_URI);
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/new', function (req, res) {
  let url = req.body.url;
  let parsedURL = parseURL(url);

  //url validation
  if (parsedURL !== undefined) {
    dns.lookup(parsedURL, (err, address, family) => {
      if (err) {
        res.json({ error: 'invalid URL' });
      } else {
        urlShortened.find({}).then((entries) => {
          let newUrl = new urlShortened({ id: entries.length + 1, url: url });
          newUrl.save(function (err, result) {
            if (err) console.log(err);
            res.json({
              original_url: url,
              result: result.id,
            });
          });
        });
      }
    });
  } else {
    res.json({ error: 'invalid URL' });
  }
});

app.get('/api/shorturl/:id', function (req, res) {
  let id = req.params.id;
  urlShortened.findOne({ id: id }, function (err, result) {
    if (result !== null) {
      res.redirect(result.url);
    } else {
      res.json({ error: 'url not found' });
    }
  });
});

//parseURL
const parseURL = (str) => {
  const reg = /www\.\w+.\w+/;
  const found = str.match(reg);
  if (found !== null) {
    return found[0];
  } else {
    return undefined;
  }
};
app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...', port);
});
