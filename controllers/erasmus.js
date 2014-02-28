var Erasmus = require('../models/Erasmus');
		fs = require('fs'),
		path = require('path'),
		passport = require('passport'),
		mkdirp = require('mkdirp'),
		mailing = require('../config/mailing');

var _ = module.exports = {};

_.index = function (req, res) {
  res.render('index');
};

_.terms = function (req, res) {
	res.render('terms');
};

_.termsEn = function (req, res) {
  res.render('terms_en');
};

_.faqs = function (req, res) {
  res.render('faq');
};

_.faqsEn = function (req, res) {
  res.render('faq_en');
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
      var target = path.resolve('public/docs/', req.user.email);
      mkdirp(target, function(err) {
        if (err) {
          console.error(err);
          return res.redirect('/sign');
        };
        sendMail(req.body.email, req.body.password);
				return res.redirect('/dashboard');
      });
    });
  });
};

var sendMail = function (email, password) {
	var mailOptions = {
		from: 'ESN Barcelona <no-reply@esnbarcelona.org>',
		to: email,
		subject: '[ESN IBIZA] Welcome!',
		text: 'Hello!!\n' +
					'ESN barcelona wants to welcome you to the most exciting travel ever!\n' +
					'Remenber your login is ' + email + ' with the following password ' + password + '\n\n' +
					'You just need to fullfill some information and upload some files and you will be on board :)\n\n' +
					'Have fun,\n' +
					'ESN Barcelona Team'
	};

	mailing.sendMail(mailOptions);
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
  req.assert('id', 'ID cannot be blank').notEmpty().isAlphanumeric();
  req.assert('nationality', 'Nationality cannot be blank').notEmpty();
  req.assert('esncard', 'Esn card cannot be blank').notEmpty().isAlphanumeric();
  req.assert('gender', 'Gender cannot be blank').notEmpty();
  req.assert('shirt', 'T-shirt cannot be blank').notEmpty();
  req.assert('ml', 'ML language cannot be blank').notEmpty();
  req.assert('telefono', 'ML language cannot be blank').notEmpty();
  req.assert('uni', 'University cannot be blank').notEmpty();

  var errors = req.validationErrors();

  console.log(errors)

  if (errors) {
  	req.flash('errors', errors);
  	return res.redirect('/dashboard/info');
  }

  Erasmus.findById(req.user._id, function (err, erasmus) {
    if (err) return handleError(err);

    if (erasmus.public.ok) {
      return res.redirect('/dashboard/info');
    }
    
    erasmus.public.name = req.body.name;
    erasmus.public.lastname = req.body.lastname;
    erasmus.public.id = req.body.id;
    erasmus.public.nationality = req.body.nationality;
    erasmus.public.esncard = req.body.esncard;
    erasmus.public.gender = req.body.gender;
    erasmus.public.shirt = req.body.shirt;
    erasmus.public.ml = req.body.ml;
    erasmus.public.uni = req.body.uni;
    erasmus.public.telefono = req.body.telefono;

    erasmus.save(function (err) {
      if (err) return handleError(err);
      return res.redirect('/dashboard/info');
    });
  });
  
};

_.postInfoDocs = function (req, res) {
  var doc = req.params.doc;

  var newFile;
  var oldFile = req.files.file.path;

  if (req.files.file.size === 0) {
		req.flash('error', 'You should upload some file');
		return res.redirect('/dashboard/info');
  }

  var ext = path.extname(req.files.file.path);

  if (ext !== '.pdf' && ext !== '.png' && ext !== '.jpg') {
  	req.flash('error', 'File with invalid extension');
  	return res.redirect('/dashboard/info');
  }

  if (doc === 'card') {
    newFile = 'docs/' + req.user.email + '/_ESNCARD' + ext;
  } else if (doc === 'id') {
    newFile = 'docs/' + req.user.email + '/_ID' + ext;
  }

  Erasmus.findById(req.user._id, function (err, erasmus) {
    if (err) return handleError(err);

    if (erasmus.public.ok) {
      return res.redirect('/dashboard/info');
    }

    fs.rename(oldFile, 'public/' + newFile, function (err) {
      if (err) return handleError(err);
      
      if (doc === 'card') {
      	erasmus.public.fileCard = newFile;
      } else if (doc === 'id') {
      	erasmus.public.fileId = newFile;
      }
      erasmus.save(function (err) {
        if (err) return handleError(err);
        return res.redirect('/dashboard/info');
      });
    });
  });
};

_.getDocs = function (req, res) {
	res.render('docs', {user: req.user.public});
};

_.postDocs = function (req, res) {
	var doc = req.params.doc;

	var newFile;
  var oldFile = req.files.file.path;

  if (req.files.file.size === 0) {
		req.flash('error', 'You should upload a file');
		return res.redirect('/dashboard/docs');
  }

  var ext = path.extname(req.files.file.path);

  if (ext !== '.pdf' && ext !== '.png' && ext !== '.jpg') {
  	req.flash('error', 'File with invalid extension');
  	return res.redirect('/dashboard/docs');
  }

  if (doc === 'responsable') {
    newFile = 'docs/' + req.user.email + '/_RESPONSABILIDAD' + ext;
  } else if (doc === 'policia') {
    newFile = 'docs/' + req.user.email + '/_POLICIA' + ext;
  } else if (doc === 'pago') {
    newFile = 'docs/' + req.user.email + '/_PAGO' + ext;
  }

  Erasmus.findById(req.user._id, function (err, erasmus) {
    if (err) return handleError(err);
      
    if (erasmus.public.ok) {
      return res.redirect('/dashboard/docs');
    }

    fs.rename(oldFile, 'public/' + newFile, function (err) {
      if (err) return handleError(err);
      
      if (doc === 'responsable') {
      	erasmus.public.fileResponsable = newFile;
      } else if (doc === 'policia') {
      	erasmus.public.filePolicia = newFile;
      } else if (doc === 'pago') {
      	erasmus.public.filePago = newFile;
      }
      erasmus.save(function (err) {
        if (err) return handleError(err);
        return res.redirect('/dashboard/docs');
      });
    });
  });
};