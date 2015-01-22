(function(){
  'use strict';
  angular.module('nuttyOrNice.controllers')
  .controller('JoinCtrl',
    ['$scope','$rootScope', '$state', '$stateParams', '$mdBottomSheet', 'toast', 'Authentication', 'Relationships',
      function($scope, $rootScope, $state, $stateParams, $mdBottomSheet, toast, Authentication, Relationships) {

        $scope.accepting = false;

        $scope.acceptRequest = function() {
          $scope.accepting = true;
          Authentication.login(function(user) {
            Relationships.find($stateParams.relId, function(relationshipRef){
              //do somn, add user to relationsjip and add relationship ref to user
              Relationships.addMember($stateParams.relId, user.uid, function(relId){
                $rootScope.currentUser = user;
                if($rootScope.currentUser.relationships) {
                  $rootScope.currentUser.relationships.push(relId);
                }
                else {
                  $rootScope.currentUser.relationships = [relId];
                }
                toast('You are now in a relationship!', null, null, function() {
                  $state.go('relationships', {relId: relId});
                });
              });
            });
          });
        };

      }
   ]);
})();