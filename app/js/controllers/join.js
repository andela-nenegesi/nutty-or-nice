(function(){
  'use strict';
  angular.module('nuttyOrNice.controllers')
  .controller('JoinCtrl',
    ['$scope','$rootScope', '$state', '$stateParams', '$mdBottomSheet', 'toast', 'Authentication', 'Relationships',
      function($scope, $rootScope, $state, $stateParams, $mdBottomSheet, toast, Authentication, Relationships) {

        $scope.accepting = false;

        $scope.acceptRequest = function() {
          $scope.accepting = true;
          Authentication.login(function() {
            Relationships.find($stateParams.relationshipId, function(relationshipRef){
              //do somn, add user to relationsjip and add relationship ref to user
              Relationships.addMember($stateParams.relationshipId, $scope.currentUser.uid, function(relationshipRef){
                $scope.currentUser.relationship_ref = relationshipRef;
                toast('You are now in a relationship!');
              });
            });
          });
        };

      }
   ]);
})();