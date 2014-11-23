
/**
 * Module dependencies.
 */

var parse = require('co-body');
var render = require('../lib/render');
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
 * Get `yo`.
 */

Routes.getYo = function *getYo() {
  var username = this.request.query.username;
  var location = this.request.query.location;
  var lat = location.substring(0, location.indexOf(';'));
  var lng = location.substring(location.indexOf(';') + 1);

  Yo.yo_link(username, link.data.url);
  this.body = 'OK';
};

/**
 * Show users nearby.
 */

Routes.showNearby = function *showNearby() {
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
  this.body = yield render('users', { users: users });
};

/**
 * Expose `Routes`.
 */

module.exports = Routes;
