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
  });

  describe('Updating item in collection', function () {
    it('Correct order after changing relevant property', function () {
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruits');
      var query = view.query('a', 'z');
      query.ref('_page.filteredFruits');
      model.set('fruits.bananaId.name', 'Weird banana');
      var expectedFruits = model.expectedResult({fruits: ['lemonId', 'bananaId']}, {array: true});
      expect(model.get('filteredFruits')).to.eql(expectedFruits);
    });
  });
});
