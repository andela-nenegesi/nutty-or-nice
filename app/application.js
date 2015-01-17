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
require('./js/services/toast.js');
require('./js/services/users.js');


/* load directives */
require('./js/directives/levels.js');

/* load controllers */
require('./js/controllers/bottom-sheet.js');
require('./js/controllers/home.js');
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

  Refs.root.onAuth(function(authData) {
    Authentication.auth(authData, function(user) {
      if(user) {
        toast("Welcome, " + user.name);
      }
      else {
        // logged out
        Authentication.logout();
        $state.go('login');
      }
    });
  });
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
    .state('admin/users', {
      url: '/admin/users',
      templateUrl: 'views/admin/users.html',
      controller: 'UsersCtrl'
    })
    .state('admin/users/id', {
      url: '/admin/users/:userId',
      templateUrl: 'views/admin/users.html',
      controller: 'UsersCtrl'
    })
    .state('join', {
      url: '/join',
      templateUrl: 'views/join.html'
    })
}]);