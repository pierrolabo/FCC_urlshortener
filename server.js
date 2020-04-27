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

app.post('/api/shorturl', function (req, res) {
  let url = req.body.url;
  let parsedURL = parseURL(url);
  console.log('url:', url);

  //url validation
  if (parsedURL !== undefined) {
    dns.lookup(parsedURL, (err, address, family) => {
      console.log('pass');
      if (err) {
        res.json({ error: 'lookup failed' });
      } else {
        urlShortened.find({}).then((entries) => {
          console.log('deep:', entries.length);
          let newUrl = new urlShortened({ id: entries.length + 1, url: url });
          newUrl.save(function (err, result) {
            if (err) console.log(err);
            console.log('resukt', result);
            res.json({
              status: 'success',
              ip: address,
              message: url,
              result: result,
            });
          });
        });
      }
    });
  } else {
    res.json({ error: 'wrong url' });
  }
});

app.get('/api/shorturl/:id', function (req, res) {
  let id = req.params.id;
  console.log('get: ', id);
  urlShortened.findOne({ id: id }, function (err, result) {
    console.log('found:', result);
    if (result !== null) {
      res.redirect(result.url);
    } else {
      res.json({ error: 'url not found' });
    }
  });
});
//Check if url is valid
const lookup = (url) => {
  dns.lookup(url, (err, address, family) => {
    console.log('pass');
    if (err) {
      console.log('err:', err);
      return false;
    } else {
      return true;
    }
  });
};
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
app.listen(port, function () {
  console.log('Node.js listening ...', port);
});
