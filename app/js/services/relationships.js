angular.module('nuttyOrNice.services')
  .factory('Relationships', ['$firebase','Refs', function($firebase, Refs) {
    return {
      find: function(uid, cb) {
        if(!cb) {
          return $firebase(Refs.relationships.child(uid)).$asObject();
        }
        else {
          Refs.relationships.child(uid).once('value', function(snap) {
            cb(snap.val());
          });
        }
      },
      addMember: function(uid, user_id, cb) {
        var relationshipRef = Refs.relationships.child(uid);
        relationshipRef.child('members').child(user_id).set('new', function(){
          Refs.users.child(user_id).child('relationship_ref').set(relationshipRef.toString());
          cb(relationshipRef.toString());
        });
      },
      save: function(uid, profile, cb) {
        Refs.users.child(uid).child('profile').set(profile, cb);
      }
    };
  }]);