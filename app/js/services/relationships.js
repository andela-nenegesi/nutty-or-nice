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
      getObj: function(ref) {
        var relationshipRef = new Firebase(ref);
        var result = $firebase(relationshipRef).$asObject();
        return result;
      },
      getUser: function(user_id, ref, cb) {
        var relationshipRef = new Firebase(ref);
        relationshipRef.child('members').child(user_id).once('value', function(userSnap) {
          var user = userSnap.val();
          if(user){
            cb(user);
          }
        });
      },
      addMember: function(uid, user_id, cb) {
        var relationshipRef = Refs.relationships.child(uid);
        Refs.users.child(user_id).once('value', function(userSnap) {
          var userObj = userSnap.val();
          relationshipRef.child('members').child(user_id).set(userObj, function(){
            Refs.users.child(user_id).child('relationship_ref').set(relationshipRef.toString());
            cb(relationshipRef.toString());
          });
        });
      },
      getChildArray: function(ref, child) { 
        var relationshipRef = new Firebase(ref);
        return $firebase(relationshipRef.child(child)).$asArray();    
      },
      addRecord: function(user, picture, type, cb) {
        var relationshipRef = new Firebase(user.relationship_ref);
        var nuttyRefs = relationshipRef.child('members').child(user.uid).child(type);
        var timestamp = moment().unix();
        if(user.existing_nutty) {
          relationshipRef.child(type).child(user.existing_nutty).once('value', function(snap) {
            if(snap.val()) {
              var nutty = {
                title: snap.val().title,
                consequence: snap.val().consequence,
                description: user.nuttyObj.description, 
                created_at: timestamp,
                picture: picture
              };
              nuttyRefs.child(user.existing_nutty).child('occurences').push(nutty, function() {
                cb(nutty);
              });
            }
          });
        }
        else {
          var nutty = {
            title: user.nuttyObj.title,
            consequence: user.nuttyObj.consequence,
            created_at: timestamp
          };
          var nuttyRef = relationshipRef.child(type).push(nutty);
          nutty.description = user.nuttyObj.description;
          nutty.picture = picture;
          nuttyRefs.child(nuttyRef.key()).child('occurences').push(nutty, function() {
            cb(nutty);
          });
        }
      },
      save: function(uid, profile, cb) {
        Refs.users.child(uid).child('profile').set(profile, cb);
      }
    };
  }]);