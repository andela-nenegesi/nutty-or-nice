//this script is run to add and org attribute to each user that points to andela.
//really hacky but ive already done it for dev and prod so might not be needed soon

var Firebase = require("firebase");
var rootRef = new Firebase("https://nuttyornice-prod.firebaseio.com");
var usersRef = rootRef.child('users');
var relationshipsRef = rootRef.child('relationships');

usersRef.on('value', function(userSnaps) {
  userSnaps.forEach(function(userSnap) {
    var uid = userSnap.val().uid || 'no-id';
    membershipRef.child(uid).child('org').set('andela', function() {
      console.log('user org added');
    });
  });
});