var Erasmus = require('../models/Erasmus'),
		mailing = require('../config/mailing');

var _ = module.exports = {};

_.isAdmin = function (req, res, next) {
	if (req.session.isAdmin) next();
	else return res.redirect('/');
};

_.getLogin = function (req, res) {
  res.render('login', {admin : true});
};

_.postLogin = function (req, res) {
	req.session.isAdmin = true;
	res.redirect('/admin');
};

_.getAdmin = function (req, res) {

	Erasmus.find(function (err, docs) {
		console.log(docs);
		res.render('admin', {data: docs});
	});
};

_.getErasmus = function (req, res) {
	Erasmus.findOne({ email: req.params.email}, function (err, doc) {
		res.render('erasmus', {erasmus: doc});
	});
};

_.getControl = function (req, res) {
	var email = req.params.email;
	var control = req.params.control;
	var ok = req.body.ok;
	var msg = req.body.msg;

	ok = getBooleanOk(ok);

	Erasmus.findOne({ email: req.params.email}, function (err, doc) {
		if (ok) {
			doc.public['control' + control] = true;
			doc.public['error' + control] = 'Correcto';
		} else {
			doc.public['control' + control] = false;
			doc.public['error' + control] = msg;
			sendMail(email, msg);
		}
		doc.save(function(err, doc) {
			res.redirect('/admin/' + email);
		});
	});
};

var getBooleanOk = function (ok) {
	if (ok === 'Ok')
		return true;
	else
		return false;
};

var sendMail = function (email, msg) {
	var mailOptions = {
		from: "ESN Barcelona <no-reply@esnbarcelona.org>",
		to: email,
		subject: "[ESN IBIZA] Review your files",
		text: msg
	};

	mailing.sendMail(mailOptions);
};