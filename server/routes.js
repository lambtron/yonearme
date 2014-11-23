
/**
 * Module dependencies.
 */

var render = require('../lib/render');
var NearMe = require('./nearme');
var Yo = require('../lib/yo');

/**
 * Define `Routes`.
 */

var Routes = {};

/**
 * Render index html page.
 */

Routes.index = function *index() {
  this.body = yield render('index');
};

/**
 * Get `yo` from user.
 */

Routes.getYo = function *getYo() {
  var location = this.request.query.location;
  var user = {
    username: this.request.query.username,
    lat: location.substring(0, location.indexOf(';')),
    lng: location.substring(location.indexOf(';') + 1),
    lastSeenAt: new Date()
  };
  var link = yield NearMe.get(user);
  this.body = yield Yo.yo_link(username, link);
};

/**
 * Show `users` nearby.
 */

Routes.showNearMe = function *showNearMe() {
  var users = [];
  var query = this.request.query;
  for (var prop in query) {
    var i = prop.charAt(prop.length - 1);
    var p = prop.slice(0, -1);
    var user = users[i];
    if (!user)
      var user = {};
    user[p] = query[prop];
    users[i] = user;
  }
  if (users.length === 0) return this.body = yield render('404');
  this.body = yield render('nearme', { users: users });
};

/**
 * Expose `Routes`.
 */

module.exports = Routes;
