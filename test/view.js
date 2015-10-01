var expect        = require('expect.js');
var helperFns     = require('./helperFns');
var modelCreator  = require('./modelCreator');
var _             = require('lodash');

var fruits = [ {name: 'apple',  color: 'red',    amount: 5,  id: 'appleId'},
               {name: 'orange', color: 'orange', amount: 10, id: 'orangeId'},
               {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'},
               {name: 'lemon',  color: 'yellow', amount: 20, id: 'lemonId'}];

describe('Derby-View', function() {
  describe('Setting up view', function() {
    it('empty collection: returns name of created view', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name
      
      var view           =  model.at(collectionName).view(functionName); // Create view with empty collection
      expect(view.viewName).to.equal(functionName);
    });

    it('non-empty collection: returns name of created view', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name 
      
      modelCreator.addData(model, collectionName, fruits); // Add items to collection
      
      var view =  model.at(collectionName).view(functionName); // Create view with non-empty collection
      expect(view.viewName).to.equal(functionName);     
    });
  });

  describe('Referencing', function() {
    it('without data', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // With empty collection
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('with data', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

      modelCreator.addData(model, collectionName, fruits); // Add items to collection
      
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // With non-empty collection
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Adding new item to collection', function() {
    it('empty collection: does NOT add to view as conditions are NOT satisfied', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name
      
      var view           =  model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.add(collectionName, {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add item to empty collection  
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('empty colection: adds to view as conditions ARE satisfied', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.add(collectionName, {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}); // Add item to empty collection
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId'], collectionName); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('non-empty colection: does NOT add to view as conditions are NOT satisfied', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name
      
      modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection     
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.add(collectionName, {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add new item to non-empty collection
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });  

    it('non-empty colection: adds to view as conditions ARE satisfied', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

      modelCreator.addData(model, collectionName, fruits); // Add items to collection
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.add(collectionName, {name: 'mango', color: 'yellow', amount: 15, id: 'mangoId'});  // Add new item to non-empty collection     
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId', 'mangoId'], collectionName); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Removing item from collection', function() {
    it('removes item from view as it was included', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name
  
      modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection      
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.del('fruits.bananaId'); // Remove included item           
      var expectedFruits = helperFns.createExpectedResult(model, ['lemonId'], collectionName); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('does NOT make any changes to view as item was NOT included', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

      modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.del('fruits.appleId'); // Remove item
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });   
  }); 

  describe.skip('Updating item in collection', function() {
    it('adds updated item to view as conditions ARE now satisfied', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name
      
      modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.set(collectionName + '.appleId.color', 'yellow');  // Update item
      var expectedFruits = helperFns.createExpectedResult(model, ['appleId', 'bananaId', 'lemonId'], collectionName); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('removes item from view as conditions are NO longer satisfied', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name
     
      modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view      
      model.set(collectionName + '.bananaId.color', 'green'); // Update item
      var expectedFruits = helperFns.createExpectedResult(model, ['lemonId'], collectionName); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });
});

describe('Passing in functions NOT defined on model.fn', function() {
 it('Behaves as expected', function() {
    var model          =  modelCreator.setupModel();
    var collectionName =  'fruits';
    var functionName   =  modelCreator.addFunction(model, collectionName);

    /*var commonFn = function(emit, fruit) { // function declaration
      if (fruit.color === 'yellow') {
        emit(fruit.name + '*' + fruit.color, pathName + fruit.id);
      }
    };*/

    function commonFn(emit, fruit) { // function declaration
      if (fruit.color === 'yellow') {
        emit(fruit.name + '*' + fruit.color, pathName + fruit.id);
      }
    };

    modelCreator.addData(model, collectionName, fruits); // Add items to collection
    var view = model.at(collectionName).view(commonFn); // Create view
    //var view = model.at(collectionName).view(functionName);
    console.log(view);
   // view.ref('_page.filteredFruits'); // Reference view
    //console.log(model.get('filteredFruits'));
 });
});

describe('Derby-View: Events', function() {
    describe('Adding new item to collection', function() {
      it('View is empty: triggers "change" event', function() {
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view
        model.on('change', '**', function(segments, value, previous, passed) { // Set up event listener
          var fruitId = value.id;
          expect(model.get(collectionName + '.' + fruitId)).to.eql(value);
        });
        model.add(collectionName, {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add new item to empty collection
        model.add(collectionName, {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}); // Add new item to non-empty collection
      });

      it('View is NOT empty: triggers "change" event', function() {
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view

        model.on('change', '**', function (segments, value, previous, passed) { // Set up event listener
            var fruitId = value.id;
            expect(model.get(collectionName + '.' + fruitId)).to.eql(value);
        });         
        model.add(collectionName, {name: 'lemon', color: 'yellow', amount: 10, id: 'lemonId'}); // Add new item to empty collection
        model.add(collectionName, {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}); // Add new item to non-empty collection
      });
    });

    describe('Removing item from collection', function() {
      it('Item included in view: triggers "change" event', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection  
        var view = model.at('fruits').view('yellowFruits'); // Create view
        view.ref('_page.filteredFruits'); // Reference view

        model.on('change', '**', function (segments, value, previous, passed) { // Set up event listener
          expect(value).to.eql(void 0); // Expects value to be undefined
        });        
        model.del(collectionName + '.bananaId'); // Remove item included in view
      });

      it('Item NOT included in view: triggers "change" event', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection  
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view

        model.on('change', '**', function (segments, value, previous, passed) { // Set up event listener
          expect(value).to.eql(void 0); // Expects value to be undefined
        });         
        model.del(collectionName + '.appleId');  // Remove item NOT included in view
      });
    });
    
    describe('Updating item in collection', function() {
      it('Item included in view: triggers "change" event', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view
        model.on('change', '**', function (segments, value, previous, passed) {  // Set up event listener
          expect(value).to.equal('green'); 
          expect(previous).to.equal('yellow');
        });    
        model.set(collectionName + '.bananaId.color', 'green'); // Update item
      });

      it('Item NOT included in view: triggers "change" event', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
        var view = model.at(collectionName).view('yellowFruits'); // Create view
        view.ref('_page.filteredFruits'); // Reference view
        model.on('change', '**', function(segments, value, previous, passed) { // Set up event listener
          expect(value).to.equal('yellow');
          expect(previous).to.equal('red');
        });  
        model.set(collectionName + '.appleId.color', 'yellow');  // Update item
      });
    });
  });



