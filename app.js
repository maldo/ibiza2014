var express = require('express');
var fs = require('fs');
var flash = require('connect-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var multipart = require('connect-multiparty');
var mcapi = require('mailchimp-api');


var secret = require('./config/secrets');
var erasmus = require('./controllers/erasmus');
var admin = require('./controllers/admin');

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var pc = require('./config/passport');
var multipartMiddleware = multipart({uploadDir:'public/docs'});
/**
 * Mongoose configuration.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.log('← MongoDB Connection Error →');
});


mc = new mcapi.Mailchimp(secrets.apiKey);

var app = express();

/**
 * Express configuration.
 */

app.set('port', process.env.PORT || secrets.serverPort);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());

app.use(express.cookieParser('esnbcnrocks42'));
app.use(express.cookieSession({
  secret: 'ibiza08',
  cookie: {
    // one day
    maxAge: 1000 * 60 * 60 * 24
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});
app.use(express.errorHandler());

/**
 * Application routes.
 */

app.get('/', erasmus.index);
app.get('/terms', erasmus.terms);
app.get('/terms/en', erasmus.termsEn);
app.get('/login', erasmus.getLogin);
// app.post('/login', userController.postLogin);
// app.get('/logout', userController.logout);
app.get('/sign', erasmus.getSign);
app.post('/sign', erasmus.postSign);

app.get('/login', erasmus.getLogin);
app.post('/login', erasmus.postLogin);

app.get('/dashboard', pc.isAuthenticated, erasmus.getDashboard);

app.get('/dashboard/info', pc.isAuthenticated, erasmus.getInfo);
app.post('/dashboard/info', pc.isAuthenticated, erasmus.postInfo);
app.post('/dashboard/info/:doc', pc.isAuthenticated, multipartMiddleware, erasmus.postInfoDocs);

app.get('/dashboard/docs', pc.isAuthenticated, erasmus.getDocs);
app.post('/dashboard/docs/:doc', pc.isAuthenticated, multipartMiddleware, erasmus.postDocs);

app.get('/admin/login', admin.getLogin);
app.post('/admin/login', admin.postLogin);
app.get('/admin/estadisticas', admin.isAdmin, admin.getEstadisticas);
app.get('/admin/previous', admin.isAdmin, admin.getAdmin);
app.get('/admin/next', admin.isAdmin, admin.getAdmin);
app.get('/admin', admin.isAdmin, admin.getAdmin);


app.get('/admin/:email', admin.isAdmin, admin.getErasmus);
app.post('/admin/:email/ok', admin.isAdmin, admin.postTrip);
app.post('/admin/:email/:control', admin.isAdmin, admin.postControl);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
