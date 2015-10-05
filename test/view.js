var expect        = require('expect.js');
var _             = require('lodash');
var helpers       = require('./lib/helpers');
var sampleData    = require('./lib/sampleData');
var fruits        = sampleData.fruits;
var fns           = sampleData.fns;

describe('Model.view', function() {
  describe('Setup', function() {
    it('Returns name of created view with empty collection', function() {
      var model = helpers.setupModel(null, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view  = model.at('fruits').view('yellowFruitsWithPath'); 
      expect(view.viewName).to.equal('yellowFruitsWithPath');
    });

    it('Returns name of created view with non-empty collection', function() {
      var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view =  model.at('fruits').view('yellowFruitsWithPath');
      expect(view.viewName).to.equal('yellowFruitsWithPath');
    });
  });

  describe('Referencing', function() {
    it('Returns empty on empty collection', function() {
      var model = helpers.setupModel(null, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits'); // With empty collection
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('Returns filtered data on non-empty collection', function() {
      var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits'); // With non-empty collection
      var expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Adding items to empty collection', function() {
    it('Returns empty collection with filtered item', function() {
      var model = helpers.setupModel(null, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view  = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});  
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('Returns updated view with non-filtered item', function() {
      var model = helpers.setupModel(null, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'});
      var expectedFruits = helpers.createExpectedResult(model, ['bananaId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Adding items to non-empty collection', function() {
    it('Returns original data with filtered item', function() {
      var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add new item to non-empty collection
      var expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });  

    it('Returns updated view with non-filtered item', function() {
      var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'mango', color: 'yellow', amount: 15, id: 'mangoId'});  // Add new item to non-empty collection     
      var expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId', 'mangoId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Removing item from collection', function() {
    it('Returns unchanged when item is not emitted', function() {
      var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.del('fruits.appleId'); // Remove item
      var expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    }); 

    it('Returns updated view when item was previously emitted', function() {
      var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.del('fruits' + '.bananaId'); // Remove included item           
      var expectedFruits = helpers.createExpectedResult(model, ['lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  }); 

  describe.skip('Updating item in collection', function() {
    it('Returns new item when change previously did not cause emit but now do', function() {
      var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.set('fruits.appleId.color', 'yellow');  // Update item
      var expectedFruits = helpers.createExpectedResult(model, ['appleId', 'bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('Returns without item when change previosuly caused emit but no longer does', function() {
      var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsWithPath', fns['yellowFruitsWithPath']);
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');      
      model.set('fruits' + '.bananaId.color', 'green'); // Update item
      var expectedFruits = helpers.createExpectedResult(model, ['lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Passing in functions NOT defined with model.fn()', function() {
    it('Returns empty collection with empty collection', function() {
      var model = helpers.setupModel();
      var view = model.at('fruits').view(fns['yellowFruitsWithPath']);
      view.ref('_page.filteredFruits');
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('Returns data with non-empty collection', function() {
      var model = helpers.setupModel({fruits: fruits});
      var view = model.at('fruits').view(fns['yellowFruitsWithPath']);
      view.ref('_page.filteredFruits');
      var expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });    
  });

  describe('Passing in only "key" argument to emit()', function() {
    describe('Function declared with model.fn()', function () {
      it('Returns empty when empty collection', function() {
        var model = helpers.setupModel(null, 'yellowFruits', fns['yellowFruits']);
        var view  = model.at('fruits').view('yellowFruits');
        view.ref('_page.filteredFruits');
        expect(model.get('filteredFruits')).to.be.empty();
      });

      it('Returns data when non-empty collection', function() {
        var model = helpers.setupModel({fruits: fruits}, 'yellowFruits', fns['yellowFruits']); 
        var view =  model.at('fruits').view('yellowFruits');
        view.ref('_page.filteredFruits');
        var expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });

    describe('Function not declared with model.fn()', function () {
      it('Returns empty when empty collection', function() {
        var model = helpers.setupModel();
        var view = model.at('fruits').view(fns['yellowFruits']);
        view.ref('_page.filteredFruits');
        expect(model.get('filteredFruits')).to.be.empty();
      });

      it('Returns data when non-empty', function() {
        var model = helpers.setupModel({fruits: fruits});
        var view = model.at('fruits').view(fns['yellowFruits']);
        view.ref('_page.filteredFruits');
        var expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', false);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });
  });

  describe('Multilevel keys', function() {
    describe('Basic functionality', function() {
      it('Returns data', function() {
        var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        var expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it('works with only "key" argument into emit()', function() {
        var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        var expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });

    describe('Adding new item to collection', function() {
      it('view remains unchanged', function() {
        var model = helpers.setupModel(null, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'}); // Add new item to empty collection
        expect(model.get('filteredFruits')).to.be.empty();

        model.add('fruits', {name: 'apple', color: 'red', amount: 5, id: 'appleId'}); // Add new item to non-empty collection
        expect(model.get('filteredFruits')).to.be.empty();
      });

      it('updates view by adding item', function() {
        var model = helpers.setupModel(null, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.add('fruits', {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}); // Add new item to empty collection
        var expectedFruits = helpers.createExpectedResult(model, ['bananaId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
        model.add('fruits', {name: 'lemon', color: 'yellow', amount: 10, id: 'lemonId'}); // Add new item to non-empty collection
        expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });      
    });

    describe('Removing item from collection', function() {
      it('view remains unchanged', function() {
        var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.del('fruits.appleId'); // Remove item
        var expectedFruits = helpers.createExpectedResult(model, ['bananaId', 'lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it.skip('updates view by removing item', function() {
        var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.del('fruits.bananaId'); // Remove included item           
        var expectedFruits = helpers.createExpectedResult(model, ['lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    }); 

    describe('Updating item in collection', function() {
      it.skip('updates view by adding item', function() {
        var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.set('fruits.appleId.color', 'yellow');  // Update item
        var expectedFruits = helpers.createExpectedResult(model, ['appleId', 'bananaId', 'lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it.skip('updates view by removing item', function() {
        var model = helpers.setupModel({fruits: fruits}, 'yellowFruitsMultilevelWithPath', fns['yellowFruitsMultilevelWithPath']);
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');      
        model.set('fruits' + '.bananaId.color', 'green'); // Update item
        var expectedFruits = helpers.createExpectedResult(model, ['lemonId'], 'fruits', true);
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });  
  });  
});

