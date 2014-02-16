var Erasmus = require('../models/Erasmus');

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

	Erasmus.find({ email: req.params.email}, function (err, doc) {
		res.send(doc);
	});
};