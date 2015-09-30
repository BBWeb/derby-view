var expect    = require('../node_modules/expect.js');
var Model     = require('../node_modules/racer/lib/Model');
require('../index.js')({Model: Model});

/* ----------- HELPER FUNCTIONS ----------- */
// Adds data to the model
function addData(model) {
  var fruits = [  {name: 'apple',  color: 'red', amount: 5, id: 'appleId'},
                  {name: 'orange', color: 'orange', amount: 10, id: 'orangeId'},
                  {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'},
                  {name: 'lemon',  color: 'yellow', amount: 20, id: 'lemonId'} ];

  for (var i = 0, len = fruits.length; i < len; i++) {
    model.add('fruits', fruits[i]);
  }
  return model;
}


// Returns an object containing key-object pairs for the specified ids
function createExpectedResult(model, idArray) {
  var result = {};
  var fruitObject;
  var key;

  for(var i = 0, len = idArray.length; i < len; i++) {
    fruitObject = model.get('fruits.'+ idArray[i]); 
    key = fruitObject.name + '*' + fruitObject.color + '*' + fruitObject.amount*2;
    result[key] = fruitObject;
  }
  return result;
}
/* ----------- END HELPER FUNCTIONS ----------- */


/* ----------- TESTS ----------- */
describe('Derby-View', function() {  
  describe('Setting up view', function() {
    it('empty collection: returns name of created view', function() {
      var model    = (new Model).at('_page');

      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color, '_page.fruits.' + fruit.id);
        }
      });      
      var view = model.at('fruits').view('yellowFruits'); // Create view with empty collection 
      expect(view.viewName).to.equal('yellowFruits');
    });

    it('non-empty collection: returns name of created view', function() {
      var model    = (new Model).at('_page');
      
      model = addData(model); // Add items to collection
      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color, '_page.fruits.' + fruit.id);
        }
      });
      var view = model.at('fruits').view('yellowFruits'); // Create view with non-empty collection
      expect(view.viewName).to.equal('yellowFruits');
    });
  });

  describe('Referencing view', function() {
    it('empty collection: adds empty view to the model', function() {
      var model    = (new Model).at('_page');

      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
        }
      });
      var view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits'); // Reference view with empty collection
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('non-empty collection: adds view containing results to the model', function() {
      var model    = (new Model).at('_page');

      model = addData(model); // Add items to collection
      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
        }
      });

      var view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits'); // Reference view with non-empty collection
      var expectedFruits = createExpectedResult(model, ['bananaId', 'lemonId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Adding new item to collection', function() {
    it('empty collection: does NOT add to view as conditions are NOT satisfied', function() {
      var model    = (new Model).at('_page');

      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
        }
      });
      var view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');

      // Add new item to empty collection
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});   
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('empty colection: adds to view as conditions ARE satisfied', function() {
      var model    = (new Model).at('_page');

      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
        }
      });
      var view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');

      // Add new item to empty collection
      model.add('fruits', {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'});
      var expectedFruits = createExpectedResult(model, ['bananaId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('non-empty colection: does NOT add to view as conditions are NOT satisfied', function() {
      var model    = (new Model).at('_page'); 

      model = addData(model); // Add items to collection
      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
        }
      });
      var view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');

      // Add new item to non-empty collection
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});
      var expectedFruits = createExpectedResult(model, ['bananaId', 'lemonId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });  

    it('non-empty colection: adds to view as conditions ARE satisfied', function() {
      var model    = (new Model).at('_page');

      model = addData(model); // Add items to collection
      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
        }
      });
      var view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');

      // Add new item to non-empty collection
      model.add('fruits', {name: 'mango', color: 'yellow', amount: 15, id: 'mangoId'});      
      var expectedFruits = createExpectedResult(model, ['bananaId', 'lemonId', 'mangoId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Removing item from collection', function() {
    it('removes item from view as it was included', function() {
      var model    = (new Model).at('_page');
  
      model = addData(model); // Add items to collection
      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
        }
      });

      // Before removing included item
      var view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');
      var expectedFruits = createExpectedResult(model, ['bananaId', 'lemonId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
      
      model.del('fruits.bananaId'); // Remove included item
            
      // After removing included item
      expectedFruits = createExpectedResult(model, ['lemonId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('does NOT make any changes to view as item was NOT included', function() {
      var model    = (new Model).at('_page');

      model = addData(model); // Add items to collection
      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
        }
      });

      // Before removing item NOT included in view
      var view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');
      var expectedFruits = createExpectedResult(model, ['bananaId', 'lemonId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);

      model.del('fruits.appleId'); // Remove item

      // After removing item NOT included in view
      expectedFruits = createExpectedResult(model, ['bananaId', 'lemonId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });    
  }); 

  describe('Updating item in collection', function() {
     it('adds updated item to view as conditions ARE now satisfied', function() {
      var model    = (new Model).at('_page');
      
      model = addData(model); // Add items to collection
      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
        }
      });

      // Before updating item
      var view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');
      var expectedFruits = createExpectedResult(model, ['bananaId', 'lemonId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);

      model.set('fruits.appleId.color', 'yellow');  // Update item

      // After updating, item is now included in the view
      view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');
      expectedFruits = createExpectedResult(model, ['appleId', 'bananaId', 'lemonId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('removes item from view as conditions are NO longer satisfied', function() {
      var model    = (new Model).at('_page');
      
      model = addData(model); // Add items to collection
      model.fn('yellowFruits', function(emit, fruit) {
        if (fruit.color === 'yellow') {
          emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
        }
      });

      // Before updating item included in view
      var view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');
      var expectedFruits = createExpectedResult(model, ['bananaId', 'lemonId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
     
      model.set('fruits.bananaId.color', 'green'); // Update item

      // After updating the item, it is now excluded from the view
      view = model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');
      var expectedFruits = createExpectedResult(model, ['lemonId']);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });
});

describe('Derby-View: Events', function() {
    describe('Adding new item to collection', function() {
      it('View is empty: triggers "change" event', function() {
        var model    = (new Model).at('_page');

        model.fn('yellowFruits', function(emit, fruit) {
          if (fruit.color === 'yellow') {
            emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
          }
        });
        var view = model.at('fruits').view('yellowFruits');
        view.ref('_page.filteredFruits');

        model.on('change', '**', addListener); // Set up event listener
        function addListener(segments, value, previous, passed) {
          var fruitId = value.id;
          expect(model.get('fruits.' + fruitId)).to.eql(value);
        }
        // Add new item to empty collection
        model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});
         // Add new item to non-empty collection
         model.add('fruits', {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'});
      });

      it('View is NOT empty: triggers "change" event', function() {
        var model    = (new Model).at('_page');

        model.fn('yellowFruits', function(emit, fruit) {
          if (fruit.color === 'yellow') {
            emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
          }
        });
        var view = model.at('fruits').view('yellowFruits');
        view.ref('_page.filteredFruits');

        model.on('change', '**', addListener); // Set up event listener
        function addListener(segments, value, previous, passed) {
            var fruitId = value.id;
            expect(model.get('fruits.' + fruitId)).to.eql(value);
        }
        // Add new item to empty collection
        model.add('fruits', {name: 'lemon', color: 'yellow', amount: 10, id: 'lemonId'});
        // Add new item to non-empty collection
        model.add('fruits', {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'});
      });
    });

    describe('Removing item from collection', function() {
      it('Item included in view: triggers "change" event', function() {
        var model    = (new Model).at('_page');

        model = addData(model); // Add items to collection
        model.fn('yellowFruits', function(emit, fruit) {
          if (fruit.color === 'yellow') {
            emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
          }
        });
        var view = model.at('fruits').view('yellowFruits');
        view.ref('_page.filteredFruits');

        model.on('change', '**', addListener); // Set up event listener
        function addListener(segments, value, previous, passed) {
          expect(value).to.eql(void 0); // Expects value to be undefined
        }
        model.del('fruits.bananaId'); // Remove item included in view
      });

      it('Item NOT included in view: triggers "change" event', function() {
        var model    = (new Model).at('_page');

        model = addData(model); // Add items to collection
        model.fn('yellowFruits', function(emit, fruit) {
          if (fruit.color === 'yellow') {
            emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
          }
        });
        var view = model.at('fruits').view('yellowFruits');
        view.ref('_page.filteredFruits');

        model.on('change', '**', addListener); // Set up event listener
        function addListener(segments, value, previous, passed) {
          expect(value).to.eql(void 0); // Expects value to be undefined
        }
        model.del('fruits.appleId');  // Remove item NOT included in view
      });
    });
    
    describe('Updating item in collection', function() {
      it('Item included in view: triggers "change" event', function() {
        var model    = (new Model).at('_page');

        model = addData(model); // Add items to collection
        model.fn('yellowFruits', function(emit, fruit) {
          if (fruit.color === 'yellow') {
            emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
          }
        });
        var view = model.at('fruits').view('yellowFruits');
        view.ref('_page.filteredFruits');

        model.on('change', '**', addListener); // Set up event listener
        function addListener(segments, value, previous, passed) {
          expect(value).to.equal('green'); 
          expect(previous).to.equal('yellow');
        }
        model.set('fruits.bananaId.color', 'green'); // Update item
      });

      it('Item NOT included in view: triggers "change" event', function() {
         var model    = (new Model).at('_page');

        model = addData(model); // Add items to collection
        model.fn('yellowFruits', function(emit, fruit) {
          if (fruit.color === 'yellow') {
            emit(fruit.name + '*' + fruit.color + '*' + fruit.amount*2, '_page.fruits.' + fruit.id);
          }
        });
        var view = model.at('fruits').view('yellowFruits');
        view.ref('_page.filteredFruits');

        model.on('change', '**', addListener); // Set up event listener
        function addListener(segments, value, previous, passed) {
          expect(value).to.equal('yellow');
          expect(previous).to.equal('red');
        }
        model.set('fruits.appleId.color', 'yellow');  // Update item
      });
    });
  });
/* ----------- END TESTS ----------- */