describe('MetricsCtrl Tests', function() {

  var scope, controller;

  beforeEach(function() {
    module('Skilltree');
  });

  beforeEach(inject(function(_Metrics_, _toast_, $injector) {
    var $controller = $injector.get('$controller');
    var $rootScope = $injector.get('$rootScope');
    var $state = $injector.get('$state');
    var $mdDialog = $injector.get('$mdDialog');
    var $mdBottomSheet = $injector.get('$mdBottomSheet');
    var $stateParams = $injector.get('$stateParams');

    scope = $rootScope;
    controller = $controller('MetricsCtrl', { 
      $mdDialog: $mdDialog,
      $rootScope: $rootScope,
      $scope: scope,
      $stateParams: $stateParams,
      toast: _toast_,
      Metrics: _Metrics_
    });

    var metric = {
      id: 'training-hours',
      name: 'Training Hours',
      operation: 'sum',
    };
    _Metrics_.create(metric);
  }));

  describe('Initialize Ctrl', function() {
    it('metrics should be defined', function() {
      expect(scope.metrics).toBeDefined();
    });

    it('operations should be defined', function() {
      expect(scope.operations).toBeDefined();
    });

    it('operations length should be 3', function() {
      expect(scope.operations.length).toEqual(3);
    });
  });
});
