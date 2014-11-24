
/**
 * Module dependencies.
 */

var Distance = require('../lib/distance');
var urlencode = require('urlencode');
var Bitly = require('../lib/bitly');
var Users = require('../lib/user');
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
  var existingUser = yield Users.findOne({ username: username });
  var searchRadius = 5; // in km
  var domain = 'http://yonearme.herokuapp.com/nearme/';
  if (!existingUser) {
    yield Users.insert(user);
  } else {
    if (moment(existingUser.lastSeenAt).add(1, 'minute').isAfter(moment()))
      searchRadius *= 2;
    yield Users.update({ username: username }, user);
  }
  var geoQuery = {
    loc: {
      '$near': [ parseInt(user.lng), parseInt(user.lat) ],
      $maxDistance: searchRadius/111.2
    }
  };
  var users = yield Users.find(geoQuery);
  if (!users || users.length === 0) return domain;
  users = users.map(function(u) {
    var origin = [user.lat + ',' + user.lng];
    var destination = [u.lat + ',' + u.lng];
    u.distance = yield Distance.matrix(origin, destination);
    u.lastSeenFromNow = moment(u.lastSeenAt).fromNow();
    return u;
  });
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
