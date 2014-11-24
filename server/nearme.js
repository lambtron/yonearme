
/**
 * Module dependencies.
 */

var Distance = require('../lib/distance');
var urlencode = require('urlencode');
var Bitly = require('../lib/bitly');
var Users = require('../lib/users');
var Moment = require('moment');

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
  var existingUser = yield Users.findOne({ username: user.username });
  var searchRadius = 5; // in km
  var domain = 'http://yonearme.herokuapp.com/nearme/';
  if (!existingUser) {
    yield Users.insert(user);
  } else {
    if (Moment(existingUser.lastSeenAt).add(1, 'minute').isAfter(Moment()))
      searchRadius *= 2;
    yield Users.update({ username: user.username }, user);
  }
  var geoQuery = {
    location: {
      $near: user.location,
      $maxDistance: searchRadius/111.2
    }
  };
  var users = yield Users.find(geoQuery);
  if (!users || users.length === 0) return domain;
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var origin = [user.location[1] + ',' + user.location[0]];
    var destination = [u.location[1] + ',' + u.location[0]];
    var distance = yield Distance.matrix(origin, destination);
    if (distance.status === 'OK')
      u.distance = distance.rows[0].elements[0].distance.text;
    u.lastSeenFromNow = Moment(u.lastSeenAt).fromNow();
  }
  var qs = buildUsersQueryString(users);
  var bitlyString = yield Bitly.shortenLink(domain + qs);
  var bitly = JSON.parse(bitlyString);
  return bitly.data.url;
};

/**
 * Expose `NearMe`.
 */

module.exports = NearMe;

/**
 * Private function to build the query string from users.
 *
 * @param {Object} users
 *
 * @return {String}
 */

function buildUsersQueryString(users) {
  var qs = '?';
  for (var i = 0; i < users.length; i++) {
    var userString = '';
    var user = users[i];
    var userObj = {
      username: urlencode(user.username),
      lastSeenFromNow: urlencode(user.lastSeenFromNow),
      distance: urlencode(user.distance)
    };
    for (var prop in userObj) {
      userString += prop + i + '=' + userObj[prop] + '&';
    }
    if (qs.length + userString.length > 2000) break;
    qs += userString;
  }
  qs = qs.slice(0, -1);
  return qs;
}
