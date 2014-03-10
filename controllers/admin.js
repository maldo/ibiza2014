var crypto = require('crypto');

var Erasmus = require('../models/Erasmus'),
		mailing = require('../config/mailing'),
		secrets = require('../config/secrets');

var _ = module.exports = {};

_.isAdmin = function (req, res, next) {
	if (req.session.isAdmin) next();
	else return res.redirect('/');
};

_.getLogin = function (req, res) {
  res.render('login', {admin : true});
};

_.postLogin = function (req, res) {

	var user = req.body.email;
	var password = req.body.password;

	var huser = crypto.createHash('sha256').update(user).digest('hex');
	var hpassword = crypto.createHash('sha256').update(password).digest('hex');

	if (huser === secrets.adminUser && hpassword === secrets.adminPass) {
		req.session.isAdmin = true;
		req.session.skip = 0;
		res.redirect('/admin');
	} else {
		res.redirect('/');
	}
};

_.getAdmin = function (req, res) {

	var skipping = 25;

	if (req.path === '/admin/previous') {
		req.session.skip -= skipping;
		if (req.session.skip <= 0) req.session.skip = 0;
	} else if (req.path === '/admin/next') {
		req.session.skip += skipping;
	} else {
		req.session.skip = 0;
	}

	Erasmus.find()
	.where('public.ok').equals(false)
	.limit(skipping)
	.skip(req.session.skip)
	.exec(function (err, docs) {
		res.render('admin', {data: docs});
	});
};

_.getVerificados = function (req, res) {

	Erasmus.find()
	.where('public.ok').equals(true)
	.exec(function (err, docs) {
		res.render('verified', {data: docs});
	});
};

_.getErasmus = function (req, res) {
	Erasmus.findOne({ email: req.params.email}, function (err, doc) {
		res.render('erasmus', {erasmus: doc});
	});
};

_.postControl = function (req, res) {

	var control = req.params.control;
	var email = req.params.email;

	var ok = req.body.ok;
	var msg = req.body.msg;

	ok = getBooleanOk(ok);

	Erasmus.findOne({ email: req.params.email}, function (err, doc) {

		if (doc.public.ok) {
			return res.redirect('/admin/' + email);
		}

		if (ok) {
			doc.public['control' + control] = true;
			doc.public['error' + control] = 'Correcto';
		} else {
			doc.public['control' + control] = false;

			if (msg === '') {
				msg = 'Error con los datos, revisalos, por favor';
			}
			doc.public['error' + control] = msg;
			sendMail(email, '[ESN IBIZA] Review your files',msg);
		}
		doc.save(function(err, doc) {
			return res.redirect('/admin/' + email);
		});
	});
};

_.postTrip = function (req, res) {
	var email = req.params.email;
	Erasmus.findOne({ email: req.params.email}, function (err, doc) {
		if (doc.public.controlData &&
				doc.public.controlCard &&
				doc.public.controlId &&
				doc.public.controlResponsable &&
				doc.public.controlPolicia &&
				doc.public.controlPago)
		{
					doc.public.ok = true;
					var msg = 'Estas dentro del viaje!!! Felicidades!!\n\n' +
										'Y no olvides unirte al grupo de ESN Ibiza Trip 2014 con ESN Barcelona, para enterarte de las últimas novedades, preguntar dudas y conocer a las personas que te acompañaran y convertirán este viaje en INOLVIDABLE www.facebook.com/groups/758718274158071/\n\n' +
										'You are in!!!! Congrats!!\n\n' +
										'And don\'t forget to join our facebook group, ESN Ibiza Trip 2014 with ESN Barcelona, to stay tuned on the last news, ask questions and meet the people that will join you and make this unforgettable Trip LEGENDARY! www.facebook.com/groups/758718274158071/';
					sendMail(email, '[ESN IBIZA] Start Packing!!', msg);
					var listId = getListId(doc.public.ml);
					subscribe(email, listId);
		}
		doc.save(function(err, doc) {
			return res.redirect('/admin/' + email);
		});
	});
};

_.getEstadisticas = function (req, res) {
	res.redirect(301, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
};

var getBooleanOk = function (ok) {
	if (ok === 'Ok')
		return true;
	else
		return false;
};

var sendMail = function (email, title, msg) {
	var mailOptions = {
		from: "ESN Barcelona <no-reply@esnbarcelona.org>",
		to: email,
		subject: title,
		text: msg
	};

	mailing.sendMail(mailOptions);
};


var subscribe = function (email, listId){
  mc.lists.subscribe({id: listId, email:{email:email}, double_optin: false}, function(data) {
      console.log('User subscribed successfully! Look for the confirmation email.');
    },
    function(error) {
      if (error.error) {
        console.log(error.code + ": " + error.error);
      } else {
        console.log('There was an error subscribing that user');
      }
    });
};

var getListId = function (lang) {

	if (lang === 'Spanish') {
		return 'cc32415e33';
	} else {
		return 'b2435a625b';
	}
};