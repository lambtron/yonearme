
/**
 * Module dependencies.
 */

var Distance = require('../lib/distance');
var Bitly = require('../lib/bitly');
var Users = require('../lib/user');

/**
 * Define `NearMe`.
 */

var NearMe = {};

/**
 * Get URL of users nearby.
 *
 * @param {Object} user
 */

NearMe.get = function *get(user) {
  var existingUser = yield Users.findOne({ username: username });
  if (!existingUser) {
    yield Users.insert(user);
  } else {
    // Double radius.
    yield Users.update({ username: username }, user);
  }


  var users = yield Users.find();


  users = users.map(function(u) {
    var origin = [user.lat + ',' + user.lng];
    var destination = [u.lat + ',' + u.lng];
    Distance.units('imperial');
    u.distance = yield Distance.matrix(origin, destination);
    return u;
  });
  var qs = buildQueryString(users);
  var urlString = yield Bitly.shortenLink('http://yonearme.herokuapp.com/nearme/' + qs);
  var url = JSON.parse(urlString);
  return url.data.url;
};

/**
 * Private function to build the query string from users.
 *
 * @param {Object} users
 *
 * @return {String}
 */

function buildQueryString(users) {
  var qs = '';
  return qs;
}
