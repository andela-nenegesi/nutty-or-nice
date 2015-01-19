angular.module('nuttyOrNice.controllers')
.controller('LoginCtrl', ['$scope', '$state', 'Authentication', 'toast',
  function($scope, $state, Authentication, toast) {
    $scope.login = function() {
      Authentication.login(function(user) {
        if(user) {
          toast("Welcome, " + user.name, null, null, function() {
            $state.go('default');
          });
        }
        else {
          // logged out
          Authentication.logout();
          $state.go('login');
        }
      });
    };
  }
]);
