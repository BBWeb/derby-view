var expect        = require('expect.js');
var helperFns     = require('./lib/helperFns');
var modelCreator  = require('./lib/modelCreator');
var _             = require('lodash');

// Sample data
var fruits = [ {name: 'apple',  color: 'red',    amount: 5,  id: 'appleId'},
               {name: 'orange', color: 'orange', amount: 10, id: 'orangeId'},
               {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'},
               {name: 'lemon',  color: 'yellow', amount: 20, id: 'lemonId'}];

var fns = {
  yellowFruits: function (emit, fruit) {
    if (fruit.color === 'yellow') {
      emit(fruit.name + '*' + fruit.color);
    }
  },
  yellowFruitsMultilevel: function (emit, fruit) {
    if (fruit.color === 'yellow') {
      emit(fruit.name + '.' + fruit.color);
    }
  },
  yellowFruitsWithPath: function (emit, fruit) {
    if (fruit.color === 'yellow') {
      emit(fruit.name + '*' + fruit.color, pathName + fruit.id);
    }
  },
  yellowFruitsMultilevelWithPath: function (emit, fruit) {
    if (fruit.color === 'yellow') {
      emit(fruit.name + '.' + fruit.color, pathName + fruit.id);
    }
  }
};

describe('Derby-View', function() {
  describe('Setting up view', function() {
    it('empty collection: returns name of created view', function() {
      var model          =  modelCreator.setupModel(null, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view           =  model.at('fruits').view('yellowFruitsWithPath'); 
      expect(view.viewName).to.equal('yellowFruitsWithPath');
    });

    it('non-empty collection: returns name of created view', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name 
      
      modelCreator.addData(model, collectionName, fruits); // Add items to collection
      
      var view =  model.at(collectionName).view(functionName); // Create view with non-empty collection
      expect(view.viewName).to.equal(functionName);     
    });
  });

  describe('Referencing', function() {
    it('empty collection', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name

      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // With empty collection
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('non-empty collection', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name

      modelCreator.addData(model, collectionName, fruits); // Add items to collection
      
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // With non-empty collection
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Adding new item to collection', function() {
    it('empty collection: view remains unchanged', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
      
      var view           =  model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.add(collectionName, {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add item to empty collection  
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('empty colection: updates view by adding item', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name

      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.add(collectionName, {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}); // Add item to empty collection
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('non-empty colection: view remains unchanged', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
      
      modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection     
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.add(collectionName, {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add new item to non-empty collection
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });  

    it('non-empty colection: updates view by adding item', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name

      modelCreator.addData(model, collectionName, fruits); // Add items to collection
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.add(collectionName, {name: 'mango', color: 'yellow', amount: 15, id: 'mangoId'});  // Add new item to non-empty collection     
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId', 'mangoId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Removing item from collection', function() {
    it('view remains unchanged', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name

      modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.del(collectionName + '.appleId'); // Remove item
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    }); 

    it('updates view by removing item', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name
  
      modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection      
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.del(collectionName + '.bananaId'); // Remove included item           
      var expectedFruits = helperFns.createExpectedResult(model, ['lemonId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  }); 

  describe.skip('Updating item in collection', function() {
    it('updates view by adding item', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
      
      modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      model.set(collectionName + '.appleId.color', 'yellow');  // Update item
      var expectedFruits = helperFns.createExpectedResult(model, ['appleId', 'bananaId', 'lemonId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('updates view by removing item', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
     
      modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
      var view = model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view      
      model.set(collectionName + '.bananaId.color', 'green'); // Update item
      var expectedFruits = helperFns.createExpectedResult(model, ['lemonId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Passing in functions NOT defined on model.fn()', function() {
    it('empty collection', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';

      function commonFn(emit, fruit) { // function declaration
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color, '_page.' + collectionName + '.' + fruit.id);
        }
      };
      var view = model.at(collectionName).view(commonFn); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('non-empty collection', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';

      function commonFn(emit, fruit) { // function declaration
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color, '_page.' + collectionName + '.' + fruit.id);
        }
      };

      modelCreator.addData(model, collectionName, fruits); // Add items to collection
      var view = model.at(collectionName).view(commonFn); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });    
  });

  describe('Passing in only "key" argument to emit()', function() {
    it('empty collection: function declared on model.fn()', function() {
      var model          =  modelCreator.setupModel(); 
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunctionWithOnlyKey(model, false); // Add a function and return it's name
      var view           =  model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('empty collection: function NOT declared on model.fn()', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';

      function commonFn(emit, fruit) { // function declaration
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color);
        }
      };
      var view = model.at(collectionName).view(commonFn); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('non-empty collection: function declared on model.fn()', function() {
      var model          =  modelCreator.setupModel(); 
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunctionWithOnlyKey(model, false); // Add a function and return it's name

      modelCreator.addData(model, collectionName, fruits); // Add items to collection
      var view =  model.at(collectionName).view(functionName); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('non-empty collection: function NOT declared on model.fn()', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';

      function commonFn(emit, fruit) { // function declaration
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color);
        }
      };
      modelCreator.addData(model, collectionName, fruits); // Add items to collection
      var view = model.at(collectionName).view(commonFn); // Create view
      view.ref('_page.filteredFruits'); // Reference view
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName, false); // Create expected result
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Multilevel keys', function() {
    describe('Basic functionality', function() {
      it('creates and populates view', function() {
        var model          =  modelCreator.setupModel(); 
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, true);

        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view
        expect(model.get('filteredFruits')).to.be.empty();
        modelCreator.addData(model, collectionName, fruits); // Add data      
        var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName, true); // Create expected result
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it('works with only "key" argument into emit()', function() {
        var model          =  modelCreator.setupModel(); 
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, true);

        modelCreator.addData(model, collectionName, fruits); // Add data
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view
        var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName, true); // Create expected result
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });

    describe('Adding new item to collection', function() {
      it('view remains unchanged', function() {
        var model          =  modelCreator.setupModel(); 
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, true);

        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view
        model.add(collectionName, {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add new item to empty collection
        expect(model.get('filteredFruits')).to.be.empty();

        model.add(collectionName, {name: 'apple', color: 'red', amount: 5, id: 'appleId'}); // Add new item to non-empty collection
        expect(model.get('filteredFruits')).to.be.empty();
      });

      it('updates view by adding item', function() {
        var model          =  modelCreator.setupModel(); 
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, true);

        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view
        model.add(collectionName, {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}); // Add new item to empty collection
        var expectedFruits = helperFns.createExpectedResult(model, ['bananaId'], collectionName, true); // Create expected result
        expect(model.get('filteredFruits')).to.eql(expectedFruits);

        model.add(collectionName, {name: 'lemon', color: 'yellow', amount: 10, id: 'lemonId'}); // Add new item to non-empty collection
        expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName, true); // Create expected result
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });      
    });

    describe('Removing item from collection', function() {
      it('view remains unchanged', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, true); // Add a function and return it's name

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view
        model.del(collectionName + '.appleId'); // Remove item
        var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], collectionName, true); // Create expected result
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it.skip('updates view by removing item', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, true); // Add a function and return it's name
    
        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection      
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view
        model.del(collectionName + '.bananaId'); // Remove included item           
        var expectedFruits = helperFns.createExpectedResult(model, ['lemonId'], collectionName, true); // Create expected result
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    }); 

    describe('Updating item in collection', function() {
      it.skip('updates view by adding item', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, true); // Add a function and return it's name
        
        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view
        model.set(collectionName + '.appleId.color', 'yellow');  // Update item
        var expectedFruits = helperFns.createExpectedResult(model, ['appleId', 'bananaId', 'lemonId'], collectionName, true); // Create expected result
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it.skip('updates view by removing item', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, true); // Add a function and return it's name
       
        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view      
        model.set(collectionName + '.bananaId.color', 'green'); // Update item
        var expectedFruits = helperFns.createExpectedResult(model, ['lemonId'], collectionName, true); // Create expected result
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });  
  });  
});

