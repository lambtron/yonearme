
/**
 * Module dependencies.
 */

var monk = require('monk');
var wrap = require('co-monk');
var mongo = process.env.MONGOHQ_URL || 'mongodb://localhost/yonearme';
var db = monk(mongo);
var users = db.get('users');
users.index({ location: '2d' });
var Users = wrap(db.get('users'));

/**
 * Expose `Users`.
 */

module.exports = Users;
