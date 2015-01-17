describe('service: Authentication', function() {
  var Authentication, $firebase, $state, Refs, user, rootScope;

  beforeEach(module('Skilltree'));

  beforeEach(inject(function($injector) {
    $firebase = $injector.get('$firebase');
    $state = $injector.get('$state');
    rootScope = $injector.get('$rootScope');
    Authentication = $injector.get('Authentication');
    Refs = $injector.get('Refs');
    
  }));
  
  describe("Login Functionality", function() {

    describe("Authentication Failure", function() {
      
      var success;
      
      beforeEach(function() {

        success = jasmine.createSpy('success');

        Refs.root.authWithOAuthPopup = function(provider, cb) {
          var err = true;
          var authData = null;
          cb(err, authData);
        };
      });

      it('Should test that user is not successfully logged in', function(){
        Authentication.login(success, function(err) {
          expect(success).not.toHaveBeenCalled();
        });
      });

    });

    describe("Authentication Success", function() {
      
      var error;
      
      beforeEach(function() {

        error = jasmine.createSpy('error');

        Refs.root.authWithOAuthPopup = function(provider, cb) {
          var err = false;
          var authData = null;
          cb(err, authData);
        };

      });

      it('Should test that a user is successfully logged in', function(){
        Authentication.login(function() {
          expect(error).not.toHaveBeenCalled();
        }, error);
      });
      
    });

  });
  
  describe("Logout Functionality", function() {
    
    beforeEach(function() {
      spyOn(Refs.root, "unauth");
    });

    it("Should test that the logout function is called", function() {
      Authentication.logout();
      expect(Refs.root.unauth).toHaveBeenCalled();
    });

  });
  

});