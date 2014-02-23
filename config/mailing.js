var nodemailer = require('nodemailer');
var config = require('.config');

var _ = module.exports = {};

var smtpTransport = nodemailer.createTransport('SMTP',{
	service: 'Gmail',
	auth: {
		user: 'no-reply@esnbarcelona.org',
		pass: config.mailpassword
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