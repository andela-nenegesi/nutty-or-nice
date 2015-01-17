describe('HomeCtrl unit Test',function() {

  var scope,
  $rootScope,
  Authentication,
  toast,
  $state,
  $mdBottomSheet,
  controller;

  beforeEach(module('Skilltree'));
  beforeEach(inject(function($injector){
    $controller = $injector.get('$controller');
    $rootScope = $injector.get('$rootScope');
    $state = $injector.get('$state');
    $mdBottomSheet = $injector.get('$mdBottomSheet');
    Authentication = $injector.get('Authentication');
    scope = $rootScope.$new();
    toast = $injector.get('toast');

    controller = $controller('HomeCtrl', {
      $mdBottomSheet: $mdBottomSheet,
      $rootScope: $rootScope,
      $scope: scope,
      $state: $state,
      Authentication: Authentication,
      toast: toast
    });
  }));

  it('should have the scoped functions defined',function() {
    expect(scope.login).toBeDefined();
    expect(scope.logout).toBeDefined();
    expect(scope.currentUser).toBeNull();
    expect(scope.showBottomSheet).toBeDefined();
  });

  it('scope.login should call Authentication.login function',function() {
    spyOn(Authentication,'login');
    scope.login();
    expect(Authentication.login).toHaveBeenCalled();
  });

  it('scope.showSearchField should set scope.searching to `true`',function() {
    expect(scope.searching).toBeFalsy();
    scope.showSearchField();
    console.log('Showing search field');
    expect(scope.searching).toBeTruthy();
  });

  it('scope.showBottomSheet should call $mdBottomSheet.show function',function() {
    spyOn($mdBottomSheet,'show').and.callThrough();
    spyOn($state,'go');

    scope.showBottomSheet();
    console.log('Showing bottom sheet');
    expect($mdBottomSheet.show).toHaveBeenCalled();
    expect($state.go).not.toHaveBeenCalled();
    expect(scope.alert).toBe('');
  });

  it('scope.logout should call Authentication.logout function',function() {
    spyOn(Authentication,'logout');
    spyOn($state,'go');

    scope.logout();

    expect(Authentication.logout).toHaveBeenCalled();
    expect($state.go).toHaveBeenCalled();
  });
});