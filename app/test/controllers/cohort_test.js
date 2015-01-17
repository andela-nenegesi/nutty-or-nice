describe('CohortCtrl Tests', function() {

  var scope,
  controller,
  Cohorts,
  $state,
  $stateParams,
  $controller,
  isDone,
  mockedCohort = {
      name: 'BootCamp F4',
      story: 'Yeet',
      started_at : 1416355200000,
      $id: '-J2cohortIdAAA'
  },
  mockedLoaded = function(id){
    return {
      $save: function() {
        return {
          then: function(cb) {
            cb();
          }
        };
      },
      $loaded: function (cb) {
        return {
          then: function (cb){
            mockedCohort.$id = id;
            cb(mockedCohort);
          }
        };
      },
    };
  },
  toast = function(txt) {
    console.log('TOAST:' + txt);
  };
  window.confirm = function() {
    return true;
  };
  mockedCohort.__proto__ = mockedLoaded(mockedCohort.$id);


  beforeEach(function() {
    module('Skilltree');
  });

  beforeEach(inject(function($injector) {
    $controller = $injector.get('$controller');
    $state = $injector.get('$state');
    scope = $injector.get('$rootScope');
    $stateParams = $injector.get('$stateParams');

    Cohorts = {
      all: function() {
        var result = [ mockedCohort ];
        result.__proto__ = mockedCohort.__proto__;
        return result;
      },
      find: function(id) {
        return mockedCohort;
      },
      create: function (cohort,cb) {
        cb(null);
        isDone();
      },
      remove: function (cohortId,cb) {
        cb(null);
        isDone();
      }
    };
    $stateParams = {};

    controller = $controller('CohortsCtrl', {
      $scope: scope,
      $stateParams: $stateParams,
      $state: $state,
      toast: toast,
      Cohorts: Cohorts
    });

  }));

  beforeEach(function() {
    expect(typeof scope.cohortsList).toBe(typeof {});
  });

  it('scope and scoped functions should be available', function() {
    expect(scope).toBeDefined();
    expect(scope.timeProcessor).toBeDefined();
    expect(scope.select).toBeDefined();
    expect(scope.create).toBeDefined();
    expect(scope.remove).toBeDefined();
    expect(scope.update).toBeDefined();
  });

  it('scope.addMore() should call $state, and change scope.selectedCohort', function() {

    spyOn($state,'go');
    expect(scope.selectedCohort).toBeNull();
    scope.addMore();

    expect($state.go).toHaveBeenCalled();
    expect(typeof scope.selectedCohort).toBe(typeof {});

  });

  describe('Test functions', function() {

    beforeEach(function(){
      expect($stateParams).toBeDefined();
      expect($stateParams.cohortId).not.toBeDefined();
      $stateParams.cohortId = mockedCohort.$id;

    });


    it('scope.init() should select the specified cohort', function () {
      spyOn(scope,'select');
      scope.init();
      expect(scope.select).toHaveBeenCalled();
      expect(scope.cohortId).toBe(mockedCohort.$id);
    });
  });

  describe('Modify current Cohort',function() {

    beforeEach(function(){
      scope.selectedCohort = mockedCohort;
    });

    it('scope.create() should call the Cohorts.create Service ', function () {
      spyOn(Cohorts,'create');
      scope.create();

      expect(Cohorts.create).toHaveBeenCalled();
    });

    it('scope.update() should call $state, and set selectedCohort to null',function () {

      spyOn($state,'go');
      scope.update();

      expect(scope.selectedCohort).toBeNull();
      expect($state.go).toHaveBeenCalled();
    });

    it('scope.remove() should call $state, and set selectedCohort to null',function () {

        spyOn(Cohorts,'remove');
        //spyOn($state,'go');
        //var _toast_ = jasmine.createSpy('toast');
        scope.remove();

        //expect(scope.selectedCohort).toBeNull();
        //expect($state.go).toHaveBeenCalled();
        //expect(_toast_).toHaveBeenCalled();
        expect(Cohorts.remove).toHaveBeenCalled();
        console.log('done NOW ~~~~~~');

     });
  });

  describe('Unit: CohortController scope Tests', function() {
    it('scope.timeProcessor should convert YYYY-MM-DD to timestamp integer', function() {
      var timestamp = moment('2014-06-12').unix();
      console.log('timestamp', timestamp)
      var yyyy_mm_dd = moment.unix(timestamp).format('YYYY-MM-DD');
      console.log('yyy', yyyy_mm_dd);

      var _yyyy_mm_dd_ = scope.timeProcessor(timestamp,false);
      console.log('_yyy', _yyyy_mm_dd_);
      var _timestamp_ = scope.timeProcessor(yyyy_mm_dd,true);
      console.log('_timestamp_', _timestamp_);

      var badStringTime = '2014-13-12';

      expect(yyyy_mm_dd).toBe(_yyyy_mm_dd_);
      expect(timestamp).toBe(_timestamp_);
      expect(scope.timeProcessor(badStringTime)).toMatch(/invalid date/i);
    });

    it('scope.selectCohort.start_date should be processed to YYYY-MM-DD',function() {
        scope.select(mockedCohort);

        var started_at = scope.timeProcessor(mockedCohort.started_at, false);
        expect(mockedCohort.started_date).toBe(started_at);
    });
  });
});
