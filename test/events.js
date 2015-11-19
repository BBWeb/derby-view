var expect            = require('expect.js');
var _                 = require('lodash');
var sampleData        = require('./lib/sampleData');
var fruits            = sampleData.fruits;
var fns               = sampleData.fns;
var helpers           = require('./lib/helpers');
var setupModel        = helpers.getModelSetup(fns, '*', ['name', 'color']);
var EventListenerData = helpers.EventListenerData;

describe('Base Events', function () {
  describe('Adding item to empty collection', function () {
    it('Triggers "change" ONLY on collection for filtered item', function () {
      var listenerData = new EventListenerData();
      var model = setupModel();
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});
      expect(listenerData.eventData).to.eql([{
          path: 'fruits.grapefruitId',
          eventEmitted: 'change',
          args: {
            name: 'grapefruit', 
            color: 'orange',
            amount: 10,
            id: 'grapefruitId'
          }
        }
      ]);  
    });

    it('Triggers "change" on collection AND view for non-filtered item', function () {
      var listenerData = new EventListenerData();
      var model = setupModel();
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));
      model.add('fruits', {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'});
      expect(listenerData.eventData).to.eql([{
          path: 'fruits.bananaId',
          eventEmitted: 'change',
          args: {
            name: 'banana', 
            color: 'yellow',
            amount: 15,
            id: 'bananaId' 
          }
        }, 
        {
          path: 'filteredFruits.banana*yellow',
          eventEmitted: 'change',
          args: {
            name: 'banana', 
            color: 'yellow',
            amount: 15,
            id: 'bananaId' 
          }
        }
      ]);
    });
  });

  describe('Adding item to non-empty collection', function () {
    it('Triggers "change" ONLY on collection for filtered item', function () {
      var listenerData = new EventListenerData();
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});
      expect(listenerData.eventData).to.eql([{
          path: 'fruits.grapefruitId',
          eventEmitted: 'change',
          args: {
            name: 'grapefruit', 
            color: 'orange',
            amount: 10,
            id: 'grapefruitId' 
          }
        }
      ]); 
    });

    it('Triggers "change" on collection AND view for non-filtered item', function () {
      var listenerData = new EventListenerData();
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));
      model.add('fruits', {name: 'mango', color: 'yellow', amount: 15, id: 'mangoId'});
      expect(listenerData.eventData).to.eql([{
          path: 'fruits.mangoId',
          eventEmitted: 'change',
          args: {
            name: 'mango', 
            color: 'yellow',
            amount: 15,
            id: 'mangoId'
          }
        }, 
        {
          path: 'filteredFruits.mango*yellow',
          eventEmitted: 'change',
          args: {
            name: 'mango', 
            color: 'yellow',
            amount: 15,
            id: 'mangoId'
          }
        }
      ]);
    });
  });

  describe('Removing item from collection', function() {
    it('Triggers "change" ONLY on collection for filtered item', function() {
      var listenerData = new EventListenerData();
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));       
      model.del('fruits.appleId');
      expect(listenerData.eventData).to.eql([{
          path: 'fruits.appleId',
          eventEmitted: 'change',
          args: undefined
        }
      ]);
    });

    it('Triggers "change" on collection AND view for non-filtered item', function() {
      var listenerData = new EventListenerData();
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));     
      model.del('fruits.bananaId');
      expect(listenerData.eventData).to.eql([{
          path: 'filteredFruits.banana*yellow',
          eventEmitted: 'change',
          args: undefined
        },
        {
          path: 'fruits.bananaId',
          eventEmitted: 'change',
          args: undefined
        }
      ]);
    });
  });

  describe('Updating item in collection', function() {   
    it('Triggers "change" on collection AND view as the update causes emit now', function() {
      var listenerData = new EventListenerData();
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));
      model.set('fruits.appleId.color', 'yellow');
      expect(listenerData.eventData).to.eql([{
          path: 'fruits.appleId.color',
          eventEmitted: 'change',
          args: 'yellow'
        },
        {
          path: 'filteredFruits.apple*yellow',
          eventEmitted: 'change',
          args: {
            name: 'apple',
            color: 'yellow',
            amount: 5,
            id: 'appleId',
            related: 'orangeId'
          }
        }
      ]);
    });

    it('Triggers "change" on collection AND view as the update no longer causes emit', function() {
      var listenerData = new EventListenerData();
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));  
      model.set('fruits.bananaId.color', 'green');
      expect(listenerData.eventData).to.eql([{
          path: 'filteredFruits.banana*yellow',
          eventEmitted: 'change',
          args: undefined
        },
        {
          path: 'fruits.bananaId.color',
          eventEmitted: 'change',
          args: 'green'
        }
      ]);
    });
  });
});

describe('Base Events: Multilevel Keys', function() {
  describe('Adding item to collection', function() {
    it('Triggers "change" ONLY on collection for filtered item', function() {
      var listenerData = new EventListenerData();
      var model = setupModel();
      var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));
      model.add('fruits', {name: 'grapefruit', color: 'orange', amount: 10, id: 'grapefruitId'});
      expect(listenerData.eventData).to.eql([{
          path: 'fruits.grapefruitId',
          eventEmitted: 'change',
          args: {
            name: 'grapefruit',
            color: 'orange',
            amount: 10,
            id: 'grapefruitId'
          }
        }
      ]);
    });

    it('Triggers "change" on collection AND view for non-filtered item', function() {
      var listenerData = new EventListenerData();
      var model = setupModel();
      var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));
      model.add('fruits', {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'}); 
      expect(listenerData.eventData).to.eql([{
          path: 'fruits.bananaId',
          eventEmitted: 'change',
          args: {
            name: 'banana',
            color: 'yellow',
            amount: 15,
            id: 'bananaId'
          }
        },
        {
          path: 'filteredFruits.banana',
          eventEmitted: 'change',
          args: {
            yellow: {
              name: 'banana',
              color: 'yellow',
              amount: 15,
              id: 'bananaId'
            }
          }
        },
        {
          path: 'filteredFruits.banana.yellow',
          eventEmitted: 'change',
          args: {
            name: 'banana',
            color: 'yellow',
            amount: 15,
            id: 'bananaId'
          }
        }
      ]);
    });
  });

  describe('Removing item from collection', function() {
    it('Triggers "change" ONLY on collection for filtered item', function() {
      var listenerData = new EventListenerData();
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));
      model.del('fruits.appleId');
      expect(listenerData.eventData).to.eql([{
          path: 'fruits.appleId',
          eventEmitted: 'change',
          args: undefined
        }
      ]);
    });

    it('Triggers "change" on collection AND view for non-filtered item', function() {
      var listenerData = new EventListenerData();
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));       
      model.del('fruits.bananaId');
      expect(listenerData.eventData).to.eql([{
          path: 'filteredFruits.banana.yellow',
          eventEmitted: 'change',
          args: undefined
        },
        {
          path: 'filteredFruits.banana',
          eventEmitted: 'change',
          args: undefined
        },
        { 
          path: 'fruits.bananaId',
          eventEmitted: 'change',
          args: undefined
        }
      ]); 
    });
  });

  describe('Updating item in collection', function() {
    it('Triggers "change" on collection AND view as the update causes emit now', function() {
      var listenerData = new EventListenerData();
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
      view.ref('_page.filteredFruits');
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));
      model.set('fruits.appleId.color', 'yellow');
      expect(listenerData.eventData).to.eql([{
          path: 'fruits.appleId.color',
          eventEmitted: 'change',
          args: 'yellow'
        },
        { 
          path: 'filteredFruits.apple',
          eventEmitted: 'change',
          args: {
            yellow: {
              name: 'apple',
              color: 'yellow',
              amount: 5,
              id: 'appleId',
              related: 'orangeId'
            }
          }
        },
        { 
          path: 'filteredFruits.apple.yellow',
          eventEmitted: 'change',
          args: {
            name: 'apple',
            color: 'yellow',
            amount: 5,
            id: 'appleId',
            related: 'orangeId'
          }
        }
      ]);
    });

    it('Triggers "change" on collection AND view as the update no longer causes emit', function() {
      var listenerData = new EventListenerData();
      var model = setupModel({fruits: fruits});
      var view = model.at('fruits').view('yellowFruitsMultilevelWithPath');
      view.ref('_page.filteredFruits');      
      model.on('all', '**', listenerData.collectListenerData.bind(listenerData));   
      model.set('fruits.bananaId.color', 'green');
      expect(listenerData.eventData).to.eql([{
          path: 'filteredFruits.banana.yellow',
          eventEmitted: 'change',
          args: undefined
        },
        {
          path: 'filteredFruits.banana',
          eventEmitted: 'change',
          args: undefined
        },
        {
          path: 'fruits.bananaId.color',
          eventEmitted: 'change',
          args: 'green'
        } 
      ]);
    });
  });
});
