var expect        = require('expect.js');
var modelCreator  = helperFns = require('./lib/helpers');
var _             = require('lodash');

// Sample data
var fruits = [ {name: 'apple',  color: 'red',    amount: 5,  id: 'appleId'},
               {name: 'orange', color: 'orange', amount: 10, id: 'orangeId'},
               {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'},
               {name: 'lemon',  color: 'yellow', amount: 20, id: 'lemonId'}];


describe('Derby-View', function() {
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
            var functionName   =  modelCreator.addFunction(model, collectionName, false); // Add a function and return it's name
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
            // does not update properly as item is still contained in the view, although the color is now green!!!!! It has the same
            // key though. Does this mean that the view function is not being executed again as it should be?
         });
      });
   });

   describe('Events - Multilevel Keys', function() {
      describe('Adding new item to collection', function() {
         it('view remains unchanged: triggers "change" only on the collection', function() {
            var model          =  modelCreator.setupModel();
            var collectionName =  'fruits';
            var viewRef        =  'filteredFruits';
            var functionName   =  modelCreator.addFunction(model, collectionName, true); // Add a function and return it's name
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
            expect('change').to.equal(listenerData[0].eventEmitted);
            expect({name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}).to.eql(listenerData[0].args);
         });

         it.skip('updates view by adding item: triggers "change" on view as well', function() {
            var model          =  modelCreator.setupModel();
            var collectionName =  'fruits';
            var viewRef        =  'filteredFruits';
            var functionName   =  modelCreator.addFunction(model, collectionName, true); // Add a function (with a multi-level key) and return it's name
            var index          =  0;
            var listenerData   =  [];

           var view = model.at(collectionName).view(functionName); // Create view
           view.ref('_page.' + viewRef); // Reference view
           
            model.on('all', '**', function (path, eventEmitted, args, passed) { // Set up event listener
               listenerData[index] = helperFns.createListenerDataObject(path, eventEmitted, args);
               index++;
               /*console.log(path);
               console.log(eventEmitted);
               console.log(args);*/
            });

            model.add(collectionName, {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}); // Add new item to empty collection
            expect(listenerData).to.have.length(2);// Confirms the number of times the listener is expected to be triggered (i.e. collection + view in that order).
            var key = modelCreator.createKey(listenerData[1].args, false); // using index 1 as it contains info about the view (i.e index 0 contains info about the collection.
            expect(viewRef + '.' + key).to.equal(listenerData[1].path);
            expect('change').to.equal(listenerData[1].eventEmitted);
            expect({name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}).to.eql(listenerData[1].args);
            /* ------------ CONSOLE LOG OUTPUT-----------
            // Once for the collection
            fruits.bananaId
            change
            { name: 'banana', color: 'yellow', amount: 15, id: 'bananaId' }

            // Once for the view with multilevel key 
            filteredFruits.banana
            change
            { yellow: { name: 'banana', color: 'yellow', amount: 15, id: 'bananaId' } }

            // What's this?
            filteredFruits.banana.yellow
            change
            { name: 'banana', color: 'yellow', amount: 15, id: 'bananaId' }
            */
         });
      });

    describe('Removing item from collection', function() {
      it('view remains unchanged: triggers "change" only on collection', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var viewRef        =  'filteredFruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, true); // Add a function (with a multi-level key) and return it's name
        var index          =  0;
        var listenerData   =  [];

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection  
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.' + viewRef); // Reference view

        model.on('all', '**', function (path, eventEmitted, args, passed) { // Set up event listener
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
        var functionName   =  modelCreator.addFunction(model, collectionName, true); // Add a function (with a multi-level key) and return it's name
        var index          =  0;
        var listenerData   =  [];

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection  
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.filteredFruits'); // Reference view

        // triggers first for view, then for collection and then again for view! Is this correct?
        model.on('all', '**', function (path, eventEmitted, args, passed) { // Set up event listener
          listenerData[index] = helperFns.createListenerDataObject(path, eventEmitted, args);
          index++;
          /*console.log(path);
          console.log(eventEmitted);
          console.log(args);*/
        });        
        model.del(collectionName + '.bananaId'); // Remove item included in view
        expect(listenerData).to.have.length(2); // I think it should be 2, but in reality it is 3. Is this correct?
        expect(listenerData[0].path).to.equal(viewRef + '.bananaId');
        expect(listenerData[0].eventEmitted).to.equal('change');
        expect(listenerData[0].args).to.eql(void 0);

        /* ------------ CONSOLE LOG OUTPUT-----------

        // Once for the view with multi-level key
        filteredFruits.banana.yellow
        change
        undefined
  
        // Once for the collection
        fruits.bananaId
        change
        undefined

        // Why again for view??
        filteredFruits.banana.yellow
        change
        undefined
        */
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
        var functionName   =  modelCreator.addFunction(model, collectionName, true); // Add a function (with a multi-level key) and return it's name
        var index          =  0;
        var listenerData   =  [];

        modelCreator.addData(model, collectionName, clonedFruits); // Add items to collection
        var key = modelCreator.createKey(model.get(collectionName + '.appleId'), false); // Create key for this item as it is the item being updated
        var view = model.at(collectionName).view(functionName); // Create view
        view.ref('_page.' + viewRef); // Reference view
        model.on('all', '**', function (path, eventEmitted, args, passed) { // Set up event listener
          listenerData[index] = helperFns.createListenerDataObject(path, eventEmitted, args);
          index++;
          /*console.log(path);
          console.log(eventEmitted);
          console.log(args);*/
        });  
        model.set(collectionName + '.appleId.color', 'yellow');  // Update item
        expect(listenerData).to.have.length(2);
        expect(listenerData[0].path).to.equal(viewRef + '.' + key + '.color');
        expect(listenerData[0].eventEmitted).to.equal('change');
        expect(listenerData[0].args).to.equal('yellow');
        // console.log(model.get(viewRef));
        // does not update properly as the item is not included in the view, although the color is now yellow!!!!!
        // maybe the view function is not being executed again as it should be??
      });

      it.skip('updates view by removing item: triggers "change" on view as well', function() {
        var clonedFruits   =  _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel();
        var collectionName =  'fruits';
        var viewRef        =  'filteredFruits';
        var functionName   =  modelCreator.addFunction(model, collectionName, true); // Add a function (with a multi-level key) and return it's name
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
          /*console.log(path);
          console.log(eventEmitted);
          console.log(args);*/
        });    
        model.set(collectionName + '.bananaId.color', 'green'); // Update item
        expect(listenerData).to.have.length(2);
        expect(listenerData[0].path).to.equal(viewRef + '.' + key + '.color');
        expect(listenerData[0].eventEmitted).to.equal('change');
        expect(listenerData[0].args).to.equal('green');
        console.log(model.get(viewRef));
        // does not update properly as item is still contained in the view, although the color is now green!!!!! It has the same
        // key though. Does this mean that the view function is not being executed again as it should be?
      });
    });
  });
});
