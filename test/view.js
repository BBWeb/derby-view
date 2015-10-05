var expect        = require('expect.js');
var helperFns     = require('./lib/helperFns');
var modelCreator  = require('./lib/modelCreator');
var _             = require('lodash');

// Sample data
var fruits = [ {name: 'apple',  color: 'red',    amount: 5,  id: 'appleId'},
               {name: 'orange', color: 'orange', amount: 10, id: 'orangeId'},
               {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'},
               {name: 'lemon',  color: 'yellow', amount: 20, id: 'lemonId'}];

// Sample view fns
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
      emit(fruit.name + '*' + fruit.color, '_page.fruits.' + fruit.id);
    }
  },
  yellowFruitsMultilevelWithPath: function (emit, fruit) {
    if (fruit.color === 'yellow') {
      emit(fruit.name + '.' + fruit.color, '_page.fruits.' + fruit.id);
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
      var model          =  modelCreator.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view =  model.at('fruits').view('yellowFruitsWithPath');
      expect(view.viewName).to.equal('yellowFruitsWithPath');
    });
  });

  describe('Referencing', function() {
    it('empty collection', function() {
      var model          =  modelCreator.setupModel(null, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits'); // With empty collection
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('non-empty collection', function() {
      var model          =  modelCreator.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits'); // With non-empty collection
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Adding new item to collection', function() {
    it('empty collection: view remains unchanged', function() {
      var model          =  modelCreator.setupModel(null, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view           =  model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});  
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('empty colection: updates view by adding item', function() {
      var model          =  modelCreator.setupModel(null, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);

      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'});
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('non-empty colection: view remains unchanged', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel({fruits: clonedFruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add new item to non-empty collection
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });  

    it('non-empty colection: updates view by adding item', function() {
      var model          =  modelCreator.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'mango', color: 'yellow', amount: 15, id: 'mangoId'});  // Add new item to non-empty collection     
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId', 'mangoId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Removing item from collection', function() {
    it('view remains unchanged', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel({fruits: clonedFruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.del('fruits.appleId'); // Remove item
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    }); 

    it('updates view by removing item', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel({fruits: clonedFruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.del('fruits' + '.bananaId'); // Remove included item           
      var expectedFruits = helperFns.createExpectedResult(model, ['lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  }); 

  describe.skip('Updating item in collection', function() {
    it('updates view by adding item', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel({fruits: clonedFruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.set('fruits.appleId.color', 'yellow');  // Update item
      var expectedFruits = helperFns.createExpectedResult(model, ['appleId', 'bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('updates view by removing item', function() {
      var clonedFruits   = _.cloneDeep(fruits);
      var model          =  modelCreator.setupModel({fruits: clonedFruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');      
      model.set('fruits' + '.bananaId.color', 'green'); // Update item
      var expectedFruits = helperFns.createExpectedResult(model, ['lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Passing in functions NOT defined on model.fn()', function() {
    it('empty collection', function() {
      var model          =  modelCreator.setupModel();
      var view = model.at('fruits').view(fns['yellowFruitsWithPath']);
      view.ref('_page.filteredFruits');
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('non-empty collection', function() {
      var model          =  modelCreator.setupModel({fruits: fruits});
      var view = model.at('fruits').view(fns['yellowFruitsWithPath']);
      view.ref('_page.filteredFruits');
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });    
  });

  describe('Passing in only "key" argument to emit()', function() {
    it('empty collection: function declared on model.fn()', function() {
      var model          =  modelCreator.setupModel(null, 'yellowFruits', fns['yellowFruits']);
      var view           =  model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('empty collection: function NOT declared on model.fn()', function() {
      var model          =  modelCreator.setupModel();
      var view = model.at('fruits').view(fns['yellowFruits']);
      view.ref('_page.filteredFruits');
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('non-empty collection: function declared on model.fn()', function() {
      var model          =  modelCreator.setupModel({fruits: fruits}, 'yellowFruits', fns['yellowFruits']); 
      var view =  model.at('fruits').view('yellowFruits');
      view.ref('_page.filteredFruits');
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('non-empty collection: function NOT declared on model.fn()', function() {
      var model          =  modelCreator.setupModel({fruits: fruits});
      var view = model.at('fruits').view(fns['yellowFruits']);
      view.ref('_page.filteredFruits');
      var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Multilevel keys', function() {
    describe('Basic functionality', function() {
      it('creates and populates view', function() {
        var model          =  modelCreator.setupModel(null, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        expect(model.get('filteredFruits')).to.be.empty();
        modelCreator.addData(model, 'fruits', fruits); // Add data      
        var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it('works with only "key" argument into emit()', function() {
        var model          =  modelCreator.setupModel({fruits: fruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });

    describe('Adding new item to collection', function() {
      it('view remains unchanged', function() {
        var model          =  modelCreator.setupModel(null, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add new item to empty collection
        expect(model.get('filteredFruits')).to.be.empty();

        model.add('fruits', {name: 'apple', color: 'red', amount: 5, id: 'appleId'}); // Add new item to non-empty collection
        expect(model.get('filteredFruits')).to.be.empty();
      });

      it('updates view by adding item', function() {
        var model          =  modelCreator.setupModel(null, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);

        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.add('fruits', {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}); // Add new item to empty collection
        var expectedFruits = helperFns.createExpectedResult(model, ['bananaId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);

        model.add('fruits', {name: 'lemon', color: 'yellow', amount: 10, id: 'lemonId'}); // Add new item to non-empty collection
        expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });      
    });

    describe('Removing item from collection', function() {
      it('view remains unchanged', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel({fruits: clonedFruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);

        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.del('fruits.appleId'); // Remove item
        var expectedFruits = helperFns.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it.skip('updates view by removing item', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel({fruits: clonedFruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.del('fruits.bananaId'); // Remove included item           
        var expectedFruits = helperFns.createExpectedResult(model, ['lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    }); 

    describe('Updating item in collection', function() {
      it.skip('updates view by adding item', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel({fruits: clonedFruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.set('fruits.appleId.color', 'yellow');  // Update item
        var expectedFruits = helperFns.createExpectedResult(model, ['appleId', 'bananaId', 'lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it.skip('updates view by removing item', function() {
        var clonedFruits   = _.cloneDeep(fruits);
        var model          =  modelCreator.setupModel({fruits: clonedFruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');      
        model.set('fruits' + '.bananaId.color', 'green'); // Update item
        var expectedFruits = helperFns.createExpectedResult(model, ['lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });  
  });  
});

