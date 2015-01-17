(function(){
  'use strict';
  angular.module('nuttyOrNice.controllers')
  .controller('BottomSheetCtrl', ['$scope', '$mdBottomSheet', 'Refs',
    function($scope, $mdBottomSheet, Refs) {
      $scope.items = [
        { name: 'Logout', state:'logout', icon: 'fa-sign-out' }
      ];

      $scope.listItemClick = function($index) {
        var clickedItem = $scope.items[$index];
        $mdBottomSheet.hide(clickedItem);
      };
    }
  ]);
})();
