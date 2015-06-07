var express = require('express'),
    path = require('path'),
    striptags = require('striptags'),
    query = require('./query');

var app = express();

app.listen(3000, function(err) {
  console.log(err || 'listening on 3000');
});

// view and layout
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('layout', 'layouts/default');
app.engine('html', require('hogan-express'));

app.get('/dialself/welcome', function(req, res) {
  res.header('Content-Type','text/xml');
  res.render('menu', {
    preamble: 'Thanks for calling Dial Self. '
  });
});

app.get('/dialself/sms', function(req, res) {
  var promise;

  switch(req.query.Body.toLowerCase().trim()) {
    case 'alert':
    case 'alerts':
    case 'news':
      promise = query.alert();
      break;
    case 'inventory':
    case 'supplies':
    case 'pantry':
      promise = query.inventory();
      break;
    case 'events':
      promise = query.events();
      break;
    case 'bed':
    case 'housing':
      promise = query.bed();
      break;
    default:
      res.header('Content-Type','text/xml');
      return res.render('sms', {
        message: 'Text ALERT, INVENTORY, EVENTS, or HOUSING for more information from DIAL/SELF. Text MENU to see this list again.'
      });
  }

  promise.then(function(msg) {
    res.header('Content-Type','text/xml');
    res.render('sms', {
      message: striptags(msg)
    });
  });
});

app.get('/dialself/query', function(req, res) {
  var promise;

  switch(req.query.Digits) {
    case '1':
      promise = query.alert();
      break;
    case '2':
      promise = query.inventory();
      break;
    case '3':
      promise = query.events();
      break;
    default:
      res.header('Content-Type','text/xml');
      return res.render('menu', {
        preamble: 'Sorry. We didn\'t understand your entry.'
      });
  }

  promise.then(function(msg) {
    res.header('Content-Type','text/xml');
    res.render('response', {
      message: striptags(msg)
    });
  });
});