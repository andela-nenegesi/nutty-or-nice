angular.module('nuttyOrNice.services')
  .factory('Users', ['$firebase', 'Refs', 'Idx',
    function($firebase, Refs, Idx) {
      return {
        all: function(cb) {
          if(!cb) {
            return $firebase(Refs.users).$asArray();
          }
          else {
            Refs.users.once('value', function(snap) {
              cb(snap.val());
            });
          }
        },

        find: function(uid, cb) {
          if(!cb) {
            return $firebase(Refs.users.child(uid)).$asObject();
          }
          else {
            Refs.users.child(uid).once('value', function(snap) {
              cb(snap.val());
            });
          }
        },

        update: function(user, cb) {
          user.$save().then(function() {
            Idx.cohortUser(user, cb);
          });
        },

        removeFromMembershipAndUsers: function(uid, cb) {
          //remove user from membership and users collections
          console.log('revoke membership');
          Refs.membership.child('uid').remove(function(error) {
            if(!error) {
              return Refs.users.child(uid).remove(cb);
            }
          });
        },

        remove: function(uid, cb){
          console.log('remove called');
          var self = this;
          //remove from users table, membership, and level
          var levelsRef = Refs.levels();
          levelsRef.once('value', function(levelsSnap) {
            var playerFound = false;
            var levels = levelsSnap.val();
            _.each(levels, function(level, id){
              var players = level.players;
              if(players) {
                if(_.has(players, uid)) {
                  playerFound = true;
                  console.log('levelid: ', level, id);
                  levelsRef.child(id).child('players').child(uid).remove(function(error) {
                    if(error) {
                      console.log('Error removing user from level', error);
                    }
                    else {
                      self.removeFromMembershipAndUsers(uid, cb);
                    }
                  });
                }
              }
            });
            if(!playerFound) {
              //the user is not on any level
              self.removeFromMembershipAndUsers(uid, cb);
            }
          });
        }
      };
    }
  ]);
