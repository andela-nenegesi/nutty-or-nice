angular.module('nuttyOrNice.services')
  .factory('Profiles', ['$firebase','Refs', function(Refs) {
    return {
      find: function(uid, cb) {
        if(!cb) {
          return $firebase(Refs.users.child(uid).child('profile')).$asObject();
        }
        else {
          Refs.users.child(uid).child('profile').once('value', function(snap) {
            cb(snap.val());
          });
        }
      },
      save: function(uid, profile, cb) {
        Refs.users.child(uid).child('profile').set(profile, cb);
      }
    };
  }]);
