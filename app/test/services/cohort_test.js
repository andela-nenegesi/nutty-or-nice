describe('service: Cohorts', function() {
  var Cohorts, 
  rootScope,
  key,
  mockCohort = {
    color: '#336699',
    name: "Mock Cohort - F1",
    started_at: Math.round(Math.random(100)*1000000000),
    story: 'No guts no glory'
  };

  beforeEach(function(){
    module('Skilltree');
  });

  beforeEach(inject(function($injector) {
    console.log('Cohorts Serivce Test BEGIN!!!!');
    Cohorts = $injector.get('Cohorts');  
  }));
  
  beforeEach(function(done){
    
    var createdCohort = Cohorts.create(mockCohort,function(err){
      expect(err).toBe(null);
      console.log('Creating mockCohort', mockCohort.name);
      done();
    });

    //name is deprecated in newer versions, and replaced with keys so this is a fallback
    createdCohort.key  = createdCohort.key || createdCohort.name;
    key = createdCohort.key();
    expect(key).toBeDefined();  

  });
  
   describe('Cohorts unit',function(){
      it('should find mockCohort',function(done){
        Cohorts.find(key,function(val){
          console.log('mockCohort should be available remotely');
          expect(val).toEqual(mockCohort);
          done();
        });
      });
      
      it('should update mockCohort color',function(done){
        var updatedMockCohort = mockCohort;
        updatedMockCohort.$id = key;
        updatedMockCohort.color = "#996633";
        Cohorts.update(updatedMockCohort,function(err){
          expect(err).toBe(null);
          Cohorts.find(key,function(val){
            delete updatedMockCohort.$id;
            console.log('mockCohort should be available remotely');

            //expect(val.color).not.toEqual(mockCohort.color);
            expect(val.color).toEqual(updatedMockCohort.color);
            expect(val.color).toMatch(/^#([0-9A-E]{6})/);

            expect(val).toEqual(updatedMockCohort);
            done();
          });
        });
      });

      it('should find all Cohorts',function(done){
        Cohorts.all(function(val){          
          var _key = _.findLastKey(val,mockCohort);
          expect(_key).toBeDefined();
          
          expect(key).toMatch(/^\-J+/);
          console.log('Checking if Cohorts\'s key matches firebaseio format');

          expect(_key).toBe(key);
          console.log('Comparing key received and locally generated firebase key', _key);
          
          expect(val[key]).toEqual(mockCohort);          
          console.log('Comparing local object with received object');

          done();
        });
      });


   });

  afterEach(function(done){
   
    Cohorts.remove(key,function(err){
     
      expect(err).toBe(null);
      console.log('Removing created mockCohort from firebase', key);
      console.log('Cohorts Serivce Test DONE!!!!');
      done();
  
    });
  
  });

});