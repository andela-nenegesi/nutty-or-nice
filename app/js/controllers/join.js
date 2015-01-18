(function(){
  'use strict';
  angular.module('nuttyOrNice.controllers')
  .controller('JoinCtrl',
    ['$scope','$rootScope', '$state', '$stateParams', '$mdBottomSheet', 'Authentication', 'Relationships',
      function($scope, $rootScope, $state, $stateParams, $mdBottomSheet, Authentication, Relationships) {

        $scope.init = function() {
          Authentication.login(function() {
            Relationships.find($stateParams.relationshipId, function(relationship){
              //do somn, add user to relationsjip and add relationship ref to user

            });
          });
        };

        $scope.init();
      }
   ]);
})();