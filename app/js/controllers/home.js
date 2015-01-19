(function(){
  'use strict';
  angular.module('nuttyOrNice.controllers')
  .controller('HomeCtrl',
    ['$scope','$rootScope', '$state', '$stateParams', '$mdDialog', '$mdBottomSheet', 'Authentication', 'Relationships', 'Users',
      function($scope, $rootScope, $state, $stateParams, $mdDialog, $mdBottomSheet, Authentication, Relationships, Users) {

        $scope.init = function() {
          if(!$rootScope.currentUser) {
            $state.go('login');
            return;
          }
          else {
            if($rootScope.currentUser.relationship_ref) {
              if($stateParams.userId) {
                Relationships.getUser($stateParams.userId, $rootScope.currentUser.relationship_ref, function(user) {
                  $scope.selectUser(user);
                });
              }
              $scope.relationship = Relationships.getObj($rootScope.currentUser.relationship_ref);
              $scope.members = Relationships.getChildArray($rootScope.currentUser.relationship_ref, 'members');
              $scope.nuttys = Relationships.getChildArray($rootScope.currentUser.relationship_ref, 'nuttys');
              $scope.nices = Relationships.getChildArray($rootScope.currentUser.relationship_ref, 'nices');
            }
          }
        };


        $scope.selectUser = function(user) {
          $scope.noRelUser = user;
          $scope.selectedUser = Users.find($stateParams.userId);
        };

        $scope.showBottomSheet = function($event) {
          $scope.alert = '';
          $mdBottomSheet.show({
            templateUrl: 'views/bottom-sheet.html',
            controller: 'BottomSheetCtrl',
            targetEvent: $event
          }).then(function(clickedItem) {
            $state.go(clickedItem.state);
          });
        };

        $scope.createReport = function(type) {
          $mdDialog.show({
            controller: 'HomeCtrl',
            locals: {
              from: $rootScope.currentUser,
              to: $scope.selectedUser,
              percent: $scope.percent,
            },
            templateUrl: type === 'nutty' ? 'views/report_nutty.html' : 'views/report_nice.html'
          }).then(function(action){

          }, function() {

          });
        };

        $scope.recordNutty = function(type) {
          Relationships.addRecord($scope.selectedUser, $scope.currentUser.picture, type);
          $mdDialog.hide();
        };

        $scope.logout = function() {
          Authentication.logout();
          $state.go('login');
        };

        $scope.login = function() {
          Authentication.login();
        };

        $scope.init();

      }
   ]);
})();
