angular.module("nuttyOrNice.directives")
  .directive('card', function(){
    return {
      restrict: 'E',
      controller: ['$scope','Relationships', function($scope, Relationships) {
        $scope.levels = Levels.all();
      }]
    };
  })
  .directive('skilltreeLevel', function(){
    return {
      require: '^skilltreeLevels',
      restrict: 'E',
      controller: ['$scope', 'Levels', '$mdDialog', function($scope, Levels, $mdDialog) {
        $scope.players = Levels.players($scope.level.$id);
        $scope.openLevelDialog = function(level) {
          $mdDialog.show({
            controller: 'LevelDialogCtrl',
            locals: {
              level: $scope.level
            },
            templateUrl: 'views/level/dialog.html',
          }).then(function(action) {

          }, function() {
            //cancelled
          });
        };
      }],
      link: function(scope, element, attrs) {
        // create the stairstep design
        element.css({"margin-left": (scope.$index * 4 + "%")});
        element.find('label').css({"background-color": scope.level.color});
        element.find('label').click(function() {
          scope.openLevelDialog(scope.level);
        });
      }
    };
  })
  .directive('skilltreeAvatar', function(){
    return {
      restrict: 'E',
      templateUrl: 'views/avatar.html',
      controller: ['$rootScope', '$scope','$mdDialog','Cohorts','Users',
        function($rootScope, $scope, $mdDialog, Cohorts, Users) {
          $scope.$watch('player.$id', function(uid) {
            if(uid) {
              if($rootScope.currentUser && !$scope.me && $rootScope.currentUser.uid === uid) {
                $scope.me = true;
                $rootScope.currentLevelId = $scope.level.$id;
              }

              Users.find(uid).$loaded(function(val) {
                $scope.user = val;
                $scope.player.name = val.name;
              });
            }
          });

          $scope.$watch('player.percent',function(percent) {
            if(percent){
              $scope.percent = percent;
            }
          });
          $scope.$watch('user.cohort_ref', function(ref) {
            if(ref) {
              $scope.cohort = Cohorts.find(ref);
            }
          });
          $scope.show = function(player) {
            $mdDialog.show({
              controller: 'UserDialogCtrl',
              locals: {
                level: $scope.level,
                user: $scope.user,
                percent: $scope.percent,
              },
              templateUrl: 'views/user/dialog.html'
            }).then(function(action){

            }, function() {

            });
          };
        }
      ],
      link: function(scope, element, attrs) {
        element.find('img').click(function() {
          if(attrs.popup) {
            scope.show(scope.user);
          }
        });
        scope.$watch('player.percent', function(newValue) {
          var leftPos = newValue;
          if(leftPos >= 100) {
            leftPos = 100;
          }
          element.css({"left": leftPos + "%"});
        });
        scope.$watch('cohort.color', function(newValue) {
          if(scope.cohort && scope.player) {
            scope.player.cohort = scope.cohort.name;
          }
          element.find('img').css({"border-color": newValue});
        });
      }
    };
  });