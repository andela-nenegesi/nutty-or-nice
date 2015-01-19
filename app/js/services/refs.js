angular.module('nuttyOrNice.services')
  .factory('Refs', ['$firebase', '$cookies',
    function($firebase, $cookies) {
      var rootRef = new Firebase($cookies.rootRef || 'https://nuttyornice.firebaseio.com/');   
      window.rootRef = rootRef;
      
      // define every standard ref used in the application here
      // so that they are defined just once, not scattered throughout
      return {
        root: rootRef,
        relationships: rootRef.child('relationships'),
        users: rootRef.child('users'),
        isAdmin: function() {
          var auth = rootRef.getAuth()?rootRef.getAuth().auth:false;
          return auth && auth.isAdmin;
        },
      };
    }
  ]);
