
/**
 * Module dependencies.
 */

var monk = require('monk');
var wrap = require('co-monk');
var mongo = process.env.MONGOHQ_URL || 'mongodb://localhost/yonearme';
var db = monk(mongo);
var users = wrap(db.get('users'));

/**
 * Expose `users`.
 */

module.exports = users;
