angular.module('nuttyOrNice.services')
.factory('Authorization', ['Refs', 'toast', '$rootScope', function(Refs, toast, $rootScope) {
  // Implement Access control when the state change is about to begin
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      
      var adminOnly = /^admin/.test(toState.name);

      //return auth && auth.isAdmin;
      if(adminOnly && !Refs.isAdmin()) {
        //Prevent State Navigation
        toast('Only Administrators can access that page');
        event.preventDefault();
        //console.log(fromState.name);
      }
  });
  return {};
}]);
