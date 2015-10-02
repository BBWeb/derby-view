var expect        = require('expect.js');
var helperFns     = require('./helperFns');
var modelCreator  = require('./modelCreator');
var _             = require('lodash');

// Sample data
var fruits = [ {name: 'apple',  color: 'red',    amount: 5,  id: 'appleId'},
               {name: 'orange', color: 'orange', amount: 10, id: 'orangeId'},
               {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'},
               {name: 'lemon',  color: 'yellow', amount: 20, id: 'lemonId'}];


describe('Derby-View', function() {
  describe('Setting up view', function() {
    it('empty collection: returns name of created view', function() {
      var model          =  modelCreator.setupModel();
      var collectionName =  'fruits';
      var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
      
      var view           =  model.at(collectionName).view(functionName); // Create view with empty collection
      expect(view.viewName).to.equal(functionName);
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
      var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name
      
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

  describe('Events', function() {
    describe('Adding new item to collection', function() {
      it('view remains unchanged: triggers "change" only on the collection', function() {
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var viewRef        =  'filteredFruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
        var index          =  0;
        var listenerData   =  [];

        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.' + viewRef); // Reference view

        model.on('all', '**', function (path, eventEmitted, args, passed) { // Set up event listener
          listenerData[index] = helperFns.createListenerDataObject(path, eventEmitted, args);
          index++;
        });

        model.add(collectionName, {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add new item to empty collection
        expect(listenerData).to.have.length(1);// Confirms the number of times the listener is expected to be triggered (i.e. only collection)
        expect(collectionName + '.grapefruitId').to.equal(listenerData[0].path);
        // Should we check if viewRef path is NOT equal to path??? or is that pretty obvious???
        expect('change').to.equal(listenerData[0].eventEmitted);
        expect({name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}).to.eql(listenerData[0].args);
      });

      it('updates view by adding item: triggers "change" on view as well', function() {
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var viewRef        =  'filteredFruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
        var index          =  0;
        var listenerData   =  [];

        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.' + viewRef); // Reference view
        
        model.on('all', '**', function (path, eventEmitted, args, passed) { // Set up event listener
          listenerData[index] = helperFns.createListenerDataObject(path, eventEmitted, args);
          index++;
        });

        model.add(collectionName, {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}); // Add new item to empty collection
        expect(listenerData).to.have.length(2);// Confirms the number of times the listener is expected to be triggered (i.e. collection + view in that order).
        var key = modelCreator.createKey(listenerData[1].args, false); // using index 1 as it contains info about the view (i.e index 0 contains info about the collection.
        expect(viewRef + '.' + key).to.equal(listenerData[1].path);
        expect('change').to.equal(listenerData[1].eventEmitted);
        expect({name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}).to.eql(listenerData[1].args);
      });
    });

    describe('Removing item from collection', function() {
      it('view remains unchanged: triggers "change" only on collection', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var viewRef        =  'filteredFruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
        var index          =  0;
        var listenerData   =  [];

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection  
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.' + viewRef); // Reference view

        model.on('all', '**', function (path, eventEmitted, args, passed) { // Set up event listener
          /*console.log('in listener');
          console.log(path);
          console.log(eventEmitted);
          console.log(args);*/
          listenerData[index] = helperFns.createListenerDataObject(path, eventEmitted, args);
          index++;
        });         
        model.del(collectionName + '.appleId');  // Remove item NOT included in view
        expect(listenerData).to.have.length(1);// Confirms the number of times the listener is expected to be triggered (i.e. only collection)
        expect(listenerData[0].path).to.equal(collectionName + '.appleId');
        expect(listenerData[0].eventEmitted).to.equal('change');
        expect(listenerData[0].args).to.eql(void 0); // Expects args to be undefined
      });

      it.skip('updates view by removing item: triggers "change" on view as well', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var viewRef        =  'filteredFruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
        var index          =  0;
        var listenerData   =  [];

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection  
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view

        // triggers first for view, then for collection and then again for view! Is this correct?
        model.on('all', '**', function (path, eventEmitted, args, passed) { // Set up event listener
          listenerData[index] = helperFns.createListenerDataObject(path, eventEmitted, args);
          index++;
        });        
        model.del(collectionName + '.bananaId'); // Remove item included in view
        expect(listenerData).to.have.length(2); // I think it should be 2, but in reality it is 3. Is this correct?
        expect(listenerData[0].path).to.equal(viewRef + '.bananaId');
        expect(listenerData[0].eventEmitted).to.equal('change');
        expect(listenerData[0].args).to.eql(void 0);
      });
    });
    
    describe('Updating item in collection', function() {
      // Does NOT trigger change on the view at all! In my opinion it should
      // What should the order be?? View first and then collection or vice versa?
      it.skip('updates view by adding item: triggers "change" on view as well', function() {
        var clonedFruits   =  _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var viewRef        =  'filteredFruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
        var index          =  0;
        var listenerData   =  [];

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
        var key = modelCreator.createKey(model.get(collectionName + '.appleId'), false); // Create key for this item as it is the item being updated
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.' + viewRef); // Reference view
        model.on('all', '**', function (path, eventEmitted, args, passed) { // Set up event listener
          listenerData[index] = helperFns.createListenerDataObject(path, eventEmitted, args);
          index++;
        });  
        model.set(collectionName + '.appleId.color', 'yellow');  // Update item
        expect(listenerData).to.have.length(2);
        expect(listenerData[0].path).to.equal(viewRef + '.' + key + '.color');
        expect(listenerData[0].eventEmitted).to.equal('change');
        expect(listenerData[0].args).to.equal('yellow');
        // console.log(model.get(viewRef));
        // does not update properly as the item is not included in the view, although the color is now yellow!!!!!
      });

      it.skip('updates view by removing item: triggers "change" on view as well', function() {
        var clonedFruits   =  _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var viewRef        =  'filteredFruits';
        var functionName   =  modelCreator.addFunction(model, collectionName); // Add a function and return it's name
        var index          =  0;
        var listenerData   =  [];

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
        var key = modelCreator.createKey(model.get(collectionName + '.bananaId'), false); // Create key for this item as it is the item being updated
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.' + viewRef); // Reference view
        
        // triggers first for view, then for collection. Is the order correct?
        model.on('all', '**', function (path, eventEmitted, args, passed) {  // Set up event listener
          listenerData[index] = helperFns.createListenerDataObject(path, eventEmitted, args);
          index++;
        });    
        model.set(collectionName + '.bananaId.color', 'green'); // Update item
        expect(listenerData).to.have.length(2);
        expect(listenerData[0].path).to.equal(viewRef + '.' + key + '.color');
        expect(listenerData[0].eventEmitted).to.equal('change');
        expect(listenerData[0].args).to.equal('green');
        // console.log(model.get(viewRef));
        // does not update properly as item is still contained in the view, although the color is now green!!!!!
      });
    });
  });
});





