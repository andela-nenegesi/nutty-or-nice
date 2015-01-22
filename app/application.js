/* define our modules */
angular.module('nuttyOrNice.services', ['firebase','ngCookies']);
angular.module('nuttyOrNice.filters', []);
angular.module("nuttyOrNice.directives", ['monospaced.elastic']);
angular.module('nuttyOrNice.controllers', []);

/* load services */
require('./js/services/authentication.js');
require('./js/services/authorization.js');
require('./js/services/profiles.js');
require('./js/services/refs.js');
require('./js/services/relationships.js');
require('./js/services/toast.js');
require('./js/services/users.js');


/* load directives */
require('./js/directives/levels.js');

/* load controllers */
require('./js/controllers/bottom-sheet.js');
require('./js/controllers/home.js');
require('./js/controllers/join.js');
require('./js/controllers/login.js');

window.NuttyOrNice = angular.module("nuttyOrNice", [
  'ui.router',
  'angular-sortable-view',
  'nuttyOrNice.controllers',
  'nuttyOrNice.directives',
  'nuttyOrNice.filters',
  'nuttyOrNice.services',
  'ngAnimate',
  'ngMaterial'
]);

NuttyOrNice.run(['$rootScope', 'Authorization', 'Authentication', 'Refs', '$location', '$state' ,'toast', function($rootScope, Authorization, Authentication, Refs, $location, $state, toast) {
  $rootScope._ = window._;
  $rootScope.moment = window.moment;

  var authData = Refs.root.getAuth();
  if(authData){
    Authentication.auth(authData, function(user) {
      $rootScope.currentUser = user;
    });
  }

}]);

/* application routes */
NuttyOrNice.config(['$stateProvider','$locationProvider',
 function($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('login', {
      url: '/',
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .state('logout', {
      url: '/logout',
      controller: ['Authentication', function(Authentication) {
        Authentication.logout();
      }]
    })
    .state('default', {
      url: '/home',
      templateUrl: 'views/home.html',
      controller: 'HomeCtrl'
    })
    .state('relationships', {
      url: '/home/:relId',
      templateUrl: 'views/home.html',
      controller: 'HomeCtrl'
    })
    .state('relationships/user', {
      url: '/home/:relId/:userId',
      templateUrl: 'views/home.html',
      controller: 'HomeCtrl'
    })
    .state('invites', {
      url: '/invites/:relId',
      templateUrl: 'views/join.html',
      controller: 'JoinCtrl'
    })
}]);