angular.module('nuttyOrNice.services')
  .factory('Authentication', ['$firebase', '$rootScope','$state','Refs', 'toast', '$cookies',
    function($firebase, $rootScope, $state, Refs, toast, $cookies) {
      window.state = $state;

      return {
        login: function(cb) {
          var self = this;
          var options = { remember: true, scope: "email" };
          Refs.root.authWithOAuthPopup("google", function(error, authData) {
            if(authData) {
              console.log('authData', cb);
              self.auth(authData, cb);
            }
            else {
              console.log('error', error);
            }
          }, options);
        },

        loginAsAdmin: function(cb) {
          var user = $rootScope.currentUser;
          $.getJSON('/admin?uid=' + user.uid + '&token=' + user.access_token)
            .success(function(data) {
              Refs.root.authWithCustomToken(data, cb);
            })
            .fail(function(err) {
              cb(err);
            });
        },

        logout: function() {
          console.log('LOGOUT');
          Refs.root.unauth();
          $rootScope.currentUser = null;
        },

        auth: function(authData, cb) {
          if(!authData) {
            // we're logged out. nothing else to do
            return cb(null);
          }

          var self = this;

          // are we dealing with a new user? find out by checking for a user record
          var userRef = Refs.users.child(authData.uid);
          userRef.once('value', function(snap) {
            var user = snap.val();
            if(user) {
              if(authData.provider === "google") {
                // google user logging in, update their access token
                user.access_token = authData.token;
                userRef.update({
                  access_token: authData.token,
                  picture: authData.google.cachedUserProfile.picture
                });
              }
              // save the current user in the global scope
            }
            else {
              // construct the user record the way we want it
              user = self.buildUserObjectFromGoogle(authData);
              // save it to firebase collection of users
              userRef.set(user, function(error) {
                // save the current user in the global scope
                $rootScope.currentUser = user;
              });
            }
            console.log('cb', cb);
            return cb(user);
          });
        },

        buildUserObjectFromGoogle: function(authData) {
          return {
            uid: authData.uid,
            name: authData.google.displayName,
            email: authData.google.email,
            access_token: authData.google.accessToken,
            first_name: authData.google.cachedUserProfile.given_name,
            known_as: authData.google.cachedUserProfile.given_name,
            last_name: authData.google.cachedUserProfile.family_name,
            picture: authData.google.cachedUserProfile.picture,
            created_at: Firebase.ServerValue.TIMESTAMP
          };
        }
      };
    }
  ]);
