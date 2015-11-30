var expect        = require('expect.js');
var _             = require('lodash');
var sampleData    = require('./lib/sampleData');
var fruits        = sampleData.fruits;
var fns           = sampleData.fns;
var helpers       = require('./lib/helpers');
var setupModel    = helpers.getModelSetup(fns, '*', ['name', 'color']);

describe('Query', function () {
  describe('Basic functionality', function () {
    it('Returns list from non-empty collection querying for everything', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruits');
      var query = view.query('a', 'z');
      query.ref('_page.filteredFruits');
      var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']}, {array: true});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });

    it('Returns specific set of items when querying for it', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('colorOrganized');
      var query = view.query('yellow', 'yellowz');
      query.ref('_page.yellowFruits');
      var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']}, {array: true});
      expect(model.get('yellowFruits')).to.eql(expectedFruits);
    });
  });

  describe('Updating item in collection', function () {
    it('Correct order after changing relevant property', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruits');
      var query = view.query('a', 'z');
      query.ref('_page.filteredFruits');
      model.set('fruits.bananaId.name', 'weird-banana');
      var expectedFruits = model.expectedResult({fruits: ['lemonId', 'bananaId']}, {array: true});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });

  describe('Multi-level organized', function () {
    it('Returns single category/specific set of items when querying for it', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('colorOrganizedMultilevel');
      var query = view.query('yellow', 'yellowz');
      query.ref('_page.yellowFruits');
      var expectedFruits = model.expectedResult({fruits: ['bananaId', 'lemonId']}, {array: true});
      expect(model.get('yellowFruits')).to.eql(expectedFruits);
    });

    describe('Query per level', function () {
      it('Returns the appropriate lists', function () {
        var model = setupModel({fruits: fruits});
        var view = model.at('fruits').view('colorOrganizedMultilevel');
        view.queryPerLevel('_page.fruitLists');
        var expectedFruits = {
          orange: model.expectedResult({fruits: ['orangeId']}, {array: true}),
          red: model.expectedResult({fruits: ['appleId']}, {array: true}),
          yellow: model.expectedResult({fruits: ['bananaId', 'lemonId']}, {array: true})
        };
        expect(model.get('fruitLists')).to.eql(expectedFruits);
      });

      describe('Updating item in collection', function () {
        it('Correct order after changing relevant property', function () {
          var model = setupModel({fruits: fruits});
          var view = model.at('fruits').view('colorOrganizedMultilevel');
          view.queryPerLevel('_page.fruitLists');
          model.set('fruits.bananaId.name', 'weird-banana');
          var expectedFruits = {
            orange: model.expectedResult({fruits: ['orangeId']}, {array: true}),
            red: model.expectedResult({fruits: ['appleId']}, {array: true}),
            yellow: model.expectedResult({fruits: ['lemonId', 'bananaId']}, {array: true})
          };
          expect(model.get('fruitLists')).to.eql(expectedFruits);
        });

        it('Item moved category after changing relevant property', function () {
          var model = setupModel({fruits: fruits});
          var view = model.at('fruits').view('colorOrganizedMultilevel');
          view.queryPerLevel('_page.fruitLists');
          model.set('fruits.bananaId.color', 'orange');
          var expectedFruits = {
            orange: model.expectedResult({fruits: ['bananaId', 'orangeId']}, {array: true}),
            red: model.expectedResult({fruits: ['appleId']}, {array: true}),
            yellow: model.expectedResult({fruits: ['lemonId']}, {array: true})
          };
          expect(model.get('fruitLists')).to.eql(expectedFruits);
        });

        it('Item moved to new category after changing relevant property', function () {
          var model = setupModel({fruits: fruits});
          var view = model.at('fruits').view('colorOrganizedMultilevel');
          view.queryPerLevel('_page.fruitLists');
          model.set('fruits.bananaId.color', 'brown');
          var expectedFruits = {
            brown: model.expectedResult({fruits: ['bananaId']}, {array: true}),
            orange: model.expectedResult({fruits: ['orangeId']}, {array: true}),
            red: model.expectedResult({fruits: ['appleId']}, {array: true}),
            yellow: model.expectedResult({fruits: ['lemonId']}, {array: true})
          };
          expect(model.get('fruitLists')).to.eql(expectedFruits);
        });

        it('Item moved to category leaving empty beind after changing relevant property', function () {
          var model = setupModel({fruits: fruits});
          var view = model.at('fruits').view('colorOrganizedMultilevel');
          view.queryPerLevel('_page.fruitLists');
          model.set('fruits.orangeId.color', 'yellow');
          var expectedFruits = {
            red: model.expectedResult({fruits: ['appleId']}, {array: true}),
            yellow: model.expectedResult({fruits: ['bananaId', 'lemonId', 'orangeId']}, {array: true})
          };
          expect(model.get('fruitLists')).to.eql(expectedFruits);
        });
      });
    });
  });
});
