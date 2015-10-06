var expect        = require('expect.js');
var _             = require('lodash');
var sampleData    = require('./lib/sampleData');
var fruits        = sampleData.fruits;
var fns           = sampleData.fns;
var helpers       = require('./lib/helpers');
var setupModel    = helpers.getModelSetup(fns, '*', ['name', 'color']);

describe('Model.view', function () {
  describe('Setup', function () {
    it('Returns name of created view with empty collection', function () {
      var model = setupModel();
      var view  = model.at('fruits').view('yellowFruitsWithPath'); 
      expect(view.viewName).to.equal('yellowFruitsWithPath');
    });

    it('Returns name of created view with non-empty collection', function () {
      var model = setupModel({fruits: fruits});
      var view =  model.at('fruits').view('yellowFruitsWithPath');
      expect(view.viewName).to.equal('yellowFruitsWithPath');
    });
  });

  describe('Referencing', function () {
    it('Returns empty on empty collection', function () {
      var model = setupModel();
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('Returns filtered data on non-empty collection', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Adding items to empty collection', function () {
    it('Returns empty with filtered item', function () {
      var model = setupModel();
      var view  = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});  
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('Returns new item with non-filtered item', function () {
      var model = setupModel();
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'});
      var expectedFruits = model.expectedResult({fruits: ['bananaId']});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Adding items to non-empty collection', function () {
    it('Returns original data with filtered item', function () { 
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});
      var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });  

    it('Returns updated view with non-filtered item', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.add('fruits', {name: 'mango', color: 'yellow', amount: 15, id: 'mangoId'});
      var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId', 'mangoId']});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Removing item from collection', function () {
    it('Returns unchanged when item is not emitted', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.del('fruits.appleId');
      var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    }); 

    it('Returns updated view when item was previously emitted', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.del('fruits' + '.bananaId');
      var expectedFruits = model.expectedResult({fruits: ['lemonId']});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  }); 

  describe.skip('Updating item in collection', function () {
    it('Returns new item when change previously did not cause emit but now do', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.set('fruits.appleId.color', 'yellow');
      var expectedFruits = model.expectedResult({fruits: ['appleId', 'bananaId']});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('Returns without item when change previosuly caused emit but no longer does', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');      
      model.set('fruits' + '.bananaId.color', 'green');
      var expectedFruits = model.expectedResult({fruits: ['lemonId']});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Passing in functions NOT defined with model.fn()', function () {
    it('Returns empty on empty collection', function () {
      var model = setupModel();
      var view = model.at('fruits').view(fns['yellowFruitsWithPath']);
      view.ref('_page.filteredFruits');
      expect(model.get('filteredFruits')).to.be.empty();
    });

    it('Returns data with non-empty collection', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view(fns['yellowFruitsWithPath']);
      view.ref('_page.filteredFruits');
      var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });    
  });

  describe('Passing in only "key" argument to emit()', function () {
    describe('Function declared with model.fn()', function () {
      it('Returns empty on empty collection', function () {
        var model = setupModel();
        var view  = model.at('fruits').view('yellowFruits');
        view.ref('_page.filteredFruits');
        expect(model.get('filteredFruits')).to.be.empty();
      });

      it('Returns data with non-empty collection', function () {
        var model = setupModel({fruits: fruits});
        var view =  model.at('fruits').view('yellowFruits');
        view.ref('_page.filteredFruits');
        var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']});
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });

    describe('Function NOT defined with model.fn()', function () {
      it('Returns empty on empty collection', function () {
        var model = setupModel();
        var view = model.at('fruits').view(fns['yellowFruits']);
        view.ref('_page.filteredFruits');
        expect(model.get('filteredFruits')).to.be.empty();
      });

      it('Returns data with non-empty collection', function () {
        var model = setupModel({fruits: fruits});
        var view = model.at('fruits').view(fns['yellowFruits']);
        view.ref('_page.filteredFruits');
        var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']});
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });
  });

  describe('Multilevel keys', function () {
    describe('Basic functionality', function () {
      it('Returns data properly structured', function () {
        var model = setupModel({fruits: fruits});
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']}, '.');
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it('Works with only "key" argument into emit()', function () {
        var model = setupModel({fruits: fruits});
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']}, '.');
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });

    describe('Adding item to collection', function () {
      it('View remains unchanged when adding filtered item', function () { 
        var model = setupModel();
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});
        expect(model.get('filteredFruits')).to.be.empty();
      });

      it('Adds item when adding non-filtered item', function () { // Returns updated view when adding non-filtered item
        var model = setupModel({fruits: fruits.slice(0, 3)});
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.add('fruits', {name: 'lemon', color: 'yellow', amount: 10, id: 'lemonId'});
        var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']}, '.');
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });      
    });

    describe('Removing item from collection', function () {
      it('View remains unchanged when removing filtered item', function () {
        var model = setupModel({fruits: fruits});
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.del('fruits.appleId');
        var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']}, '.');
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it.skip('Removes item when removing non-filtered item', function () {
        var model = setupModel({fruits: fruits});
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.del('fruits.bananaId');
        var expectedFruits = model.expectedResult({fruits: ['lemonId']}, '.');
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    }); 

    describe('Updating item in collection', function () {
      it.skip('Adds item when it was previously filtered, but no longer is', function () {
        var model = setupModel({fruits: fruits});
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');
        model.set('fruits.appleId.color', 'yellow');
        var expectedFruits = model.expectedResult({fruits: ['appleId', 'bananaId', 'lemonId']}, '.');
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });

      it.skip('Removes item when it was previously not filtered but now is', function () {
        var model = setupModel({fruits: fruits});
        var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
        view.ref('_page.filteredFruits');      
        model.set('fruits' + '.bananaId.color', 'green');
        var expectedFruits = model.expectedResult({fruits: ['lemonId']}, '.');
        expect(model.get('filteredFruits')).to.eql(expectedFruits);
      });
    });  
  }); 
});
