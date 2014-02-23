var nodemailer = require('nodemailer');
var shh = require('./secrets');

var _ = module.exports = {};

var smtpTransport = nodemailer.createTransport('SMTP',{
	service: 'Gmail',
	auth: {
		user: 'no-reply@esnbarcelona.org',
		pass: shh.mailpassword
	}
});

_.sendMail = function (mailOptions) {
	smtpTransport.sendMail(mailOptions, function(error, response){
		if(error){
			console.log(error);
		}else{
			console.log("Message sent: " + response.message);
		}
	});
};