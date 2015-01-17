(function(){
  'use strict';
  angular.module('nuttyOrNice.controllers')
  .controller('HomeCtrl',
    ['$scope','$rootScope', '$state', '$mdBottomSheet', 'Authentication',
      function($scope, $rootScope, $state, $mdBottomSheet, Authentication) {

        $scope.init = function() {
          if(!$rootScope.currentUser) {
            $state.go('login');
            return;
          }
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
