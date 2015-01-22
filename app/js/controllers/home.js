(function(){
  'use strict';
  angular.module('nuttyOrNice.controllers')
  .controller('HomeCtrl',
    ['$scope', 'toast', '$timeout', '$rootScope', '$state', '$stateParams', '$mdDialog', '$mdBottomSheet', 'Authentication', 'Relationships', 'Users', 'Refs',
      function($scope, toast, $timeout, $rootScope, $state, $stateParams, $mdDialog, $mdBottomSheet, Authentication, Relationships, Users, Refs) {

        $scope.checkAuthState = function() {
          var authData = Refs.root.getAuth();
          if(authData){
            Authentication.auth(authData, function(user) {
              $rootScope.currentUser = user;
              $scope.init();
            });
          }
          else{
            $state.go('login');
          }
        };

        $scope.init = function() {
          $scope.newRelationship = {};
          if($stateParams.relId) {
            console.log('yes params');
            $scope.relationship = Relationships.find($stateParams.relId);
            Relationships.find($stateParams.relId, function(rel) {
              if(rel && $stateParams.userId) {
                var user = rel.members[$stateParams.userId];
                $scope.selectUser(user);
              }
            });
          }
        };

        $scope.createRelationship = function() {
          var rel = Relationships.create($scope.newRelationship.name, $rootScope.currentUser);
          Refs.users.child($rootScope.currentUser.uid).child('relationships').push(rel.key());
          if($rootScope.currentUser.relationships) {
            $rootScope.currentUser.relationships[rel.key()] = rel.key();
          }
          else {
            var obj = {};
            obj[rel.key()] = rel.key();
            $rootScope.currentUser.relationships = obj; 
          }
          toast('Relationship ' + $scope.newRelationship.name + ' created :)', null, null, function() {
            $state.go("relationships", {relId: rel.key()});
          });
        };


        $scope.selectUser = function(user) {
          $rootScope.noRelUser = user;
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

        $scope.invite = function() {
          $mdDialog.show({
            controller: ['$scope', '$stateParams', '$http', function($scope, $stateParams, $http) {
              $scope.data = {};
              $scope.data.relId = $stateParams.relId;
              $scope.data.sender = $rootScope.currentUser.name;
              $scope.addMember = function() {
                $http.post('/invite', $scope.data).
                  success(function(data, status, headers, config) {
                    console.log('success');
                    $mdDialog.hide();
                  }).
                  error(function(data, status, headers, config) {
                    console.log('failed');
                    $mdDialog.hide();
                  });
              }
            }],
            locals: {
            },
            templateUrl: 'views/in_rel_invite.html'
          }).then(function(action){

          }, function() {

          });
        };

        $scope.switch = function() {
          $mdDialog.show({
            controller: ['$scope', 'Relationships', function($scope, Relationships) {
              $scope.currentUser = $rootScope.currentUser;
              //how to get all relationships for a user
              $scope.relationships = [];
              _.each($scope.currentUser.relationships, function(val, key) {
                Relationships.find(val, function(obj) {
                  $scope.relationships.push(obj);
                });
              });

              $scope.goto = function(relId) {
                $state.go('relationships', {relId: relId});
                $mdDialog.hide();
              }
            }],
            locals: {
            },
            templateUrl: 'views/user_relationships.html'
          }).then(function(action){

          }, function() {

          });
        };

        $scope.recordNutty = function(type) {
          Relationships.addRecord($scope.selectedUser, $rootScope.currentUser.picture, type, function(user){
            $rootScope.noRelUser = user;
            window.nuttys = $rootScope.noRelUser.nuttys;
          });
          $mdDialog.hide();
        };

        $scope.logout = function() {
          Authentication.logout();
          $state.go('login');
        };

        $scope.login = function() {
          Authentication.login(function(user) {
            if(user) {
              toast("Welcome, " + user.name);
            }
            else {
              // logged out
              Authentication.logout();
              $state.go('login');
            }
          });
        };

        $scope.checkAuthState();

      }
   ]);
})();
