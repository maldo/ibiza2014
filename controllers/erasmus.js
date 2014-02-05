var Erasmus = require('../models/Erasmus');
var fs = require('fs');
var path = require('path');
var passport = require('passport');
var mkdirp = require('mkdirp');

var _ = module.exports = {};

_.index = function(req, res) {
  res.render('index');
};

_.getLogin = function (req, res) {
	res.render('login');
};

_.postLogin = function (req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);

    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }

    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/dashboard');
    });
  })(req, res, next);
}

_.getSign = function (req, res) {
	res.render('sign');
};

_.postSign = function (req, res) {
	req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('again', 'Passwords do not match').equals(req.body.password);
  req.assert('terms', 'You must accept terms&conditions').notEmpty;

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/sign');
  }

  var user = new Erasmus({
    email: req.body.email,
    password: req.body.password,
    public: { 
    	email: req.body.email
    }
  });

  user.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        req.flash('errors', { msg: 'User already exists.' });
      }
      return res.redirect('/sign');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      mkdirp('public/docs/' + req.user.email, function(err) {
				return res.redirect('/dashboard');
      });
    });
  });
};

_.getDashboard = function (req, res) {
	req.flash('info', {msg: 'hola'});
	res.render('dashboard', {user: req.user.public});
};

_.getInfo = function (req, res) {
  res.render('info', {user: req.user.public});
};

_.postInfo = function (req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('lastname', 'Last name cannot be blank').notEmpty();
  req.assert('gender', 'Gender cannot be blank').notEmpty();
  req.assert('id', 'ID cannot be blank').notEmpty();
  req.assert('nationality', 'Nationality cannot be blank').notEmpty();
  req.assert('esncard', 'Esn card cannot be blank').notEmpty();
  req.assert('gender', 'Gender cannot be blank').notEmpty();
  req.assert('shirt', 'T-shirt cannot be blank').notEmpty();

  var errors = req.validationErrors();

  console.log(errors)

  if (errors) {
  	req.flash('errors', errors);
  	return res.redirect('/dashboard/info');
  }

  Erasmus.findById(req.user._id, function (err, erasmus) {
    if (err) return handleError(err);
    
    erasmus.public.name = req.body.name;
    erasmus.public.lastname = req.body.lastname;
    erasmus.public.id = req.body.id;
    erasmus.public.nationality = req.body.nationality;
    erasmus.public.esncard = req.body.esncard;
    erasmus.public.gender = req.body.gender;
    erasmus.public.shirt = req.body.shirt;
    erasmus.save(function (err) {
      if (err) return handleError(err);
      return res.redirect('/dashboard/info');
    });
  });
  
};

_.postInfoDocs = function (req, res) {
  var doc = req.params.doc;

  var newFile;
  var oldFile;
  if (doc === 'card') {
    var ext = path.extname(req.files.fileCard.path);
    newFile = 'docs/' + req.user.email + '/_ESNCARD' + ext;
    oldFile = req.files.fileCard.path;
  } else if (doc === 'id') {
    var ext = path.extname(req.files.fileId.path);
    newFile = 'docs/' + req.user.email + '/_ID' + ext;
    oldFile = req.files.fileId.path;
  }

  fs.rename(oldFile, 'public/' + newFile, function (err) {
    if (err) throw err;
    console.log(newFile);
    if (doc === 'card') {
      // Erasmus.update({_id: req.user._id}, {public[fileCard] = newFile}, function (err){
      //   //if (err) return handleError(err);
      // });

      Erasmus.findById(req.user._id, function (err, erasmus) {
        if (err) return handleError(err);
        
        erasmus.public.fileCard = newFile;
        erasmus.save(function (err) {
          if (err) return handleError(err);
          return res.redirect('/dashboard/info');
        });
      });
    } else if (doc === 'id') {
      //  Erasmus.update({_id: req.user._id}, {public[fileId] = newFile}, function (err){
      //   //if (err) return handleError(err);
      // });
      Erasmus.findById(req.user._id, function (err, erasmus) {
        if (err) return handleError(err);
        
        erasmus.public.fileId = newFile;
        erasmus.save(function (err) {
          if (err) return handleError(err);
          return res.redirect('/dashboard/info');
        });
      });
    }
  });
};

_.getDocs = function (req, res) {
	res.render('docs', {user: req.user.public});
};
_.postDocs = function (req, res) {
	var doc = req.params.doc;

  var newFile;
  var oldFile;
  if (doc === 'seguro') {
    var ext = path.extname(req.files.fileSeguro.path);
    newFile = 'docs/' + req.user.email + '/_SEGURO' + ext;
    oldFile = req.files.fileSeguro.path;
  } else if (doc === 'policia') {
    var ext = path.extname(req.files.filePolicia.path);
    newFile = 'docs/' + req.user.email + '/_POLICIA' + ext;
    oldFile = req.files.filePolicia.path;
  }

  fs.rename(oldFile, 'public/' + newFile, function (err) {
    if (err) throw err;
    console.log(newFile);
    if (doc === 'seguro') {
      Erasmus.findById(req.user._id, function (err, erasmus) {
        if (err) return handleError(err);
        
        erasmus.public.fileSeguro = newFile;
        erasmus.save(function (err) {
          if (err) return handleError(err);
          return res.redirect('/dashboard/docs');
        });
      });
    } else if (doc === 'policia') {
      Erasmus.findById(req.user._id, function (err, erasmus) {
        if (err) return handleError(err);
        
        erasmus.public.filePolicia = newFile;
        erasmus.save(function (err) {
          if (err) return handleError(err);
          return res.redirect('/dashboard/docs');
        });
      });
    }
  });
};