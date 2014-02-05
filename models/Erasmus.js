var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var erasmusSchema = new mongoose.Schema({
  email: {type: String, unique: true},
  password: String,
  date: {type: Date, default: Date.now},

  public: {
    email: { type: String, default: '' },
    name: { type: String, default: '' },
    lastname: { type: String, default: '' },
    id: { type: String, default: '' },
    nationality: { type: String, default: '' },
    esncard: { type: String, default: '' },
    gender: { type: String, default: '' },
    shirt: { type: String, default: '' },
    controlData: {type: Boolean, default: false},

    fileCard: { type: String, default: '' },
    controlCard: {type: Boolean, default: false},

    fileId: { type: String, default: '' },
    controlId: {type: Boolean, default: false},

    fileSeguro: { type: String, default: '' },
    controlSeguro: {type: Boolean, default: false},

    filePolicia: { type: String, default: '' },
    controlPolicia: {type: Boolean, default: false}
  }
});

erasmusSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

erasmusSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('Erasmus', erasmusSchema);