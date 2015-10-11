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

    // 'change' is triggered thrice (view first, then collection and then view again). It should ony be twice?
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

  // Does NOT trigger change on the view at all. Updated item is NOT included in the view as it should be.  
  // What should the order of the events be (i.e. first view and then collection OR vice versa)? 
  describe('Updating item in collection', function() {   
    it.skip('Triggers "change" on collection AND view as the update causes emit now', function() {
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
          args: 'yellow'
        }
      ]);
    });

    // 'change' is fired correctly for both view and collection, but the view is NOT updated 
    // and still contains the updated item together with the originally emitted key. Does this
    // mean that still another event is required to update it?
    // What should the order of the events be (i.e. first view and then collection OR vice versa)? 
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

    // 'change' is triggered on collection and then once each for each level in multi-level key.
    // Is this the way it should be?
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

  // 'change' is triggered first for view, then for collection and then again for view.
  // Not sure if this is the way it should be.
  // Test case has been written to check that 'change' is triggered just twice. May need to be updated!
    it.skip('Triggers "change" on collection AND view for non-filtered item', function() {
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
          path: 'fruits.bananaId',
          eventEmitted: 'change',
          args: undefined
        }
      ]); 
    });
  });

  // Does NOT trigger change on the view at all. Updated item is NOT included in the view as it should be.  
  // What should the order of the events be (i.e. first view and then collection OR vice versa)?
  // Not sure if the expected result should be the way it is written! (Probably needs to be updated)!!
  describe('Updating item in collection', function() {
    it.skip('Triggers "change" on collection AND view as the update causes emit now', function() {
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
          path: 'filteredFruits.apple.yellow',
          eventEmitted: 'change',
          args: {
            name: 'apple',
            color: 'yellow',
            amount: 15,
            id: 'appleId'
          }
        }
      ]);
    });

    // 'change' is triggered first for view and then for collection (seems right). Is the order correct?
    // Problem is that the view is not updated properly. It still contains the updatem item under the
    // originally emitted key. Does this mean that still another event is required to update it?
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
          path: 'fruits.bananaId.color',
          eventEmitted: 'change',
          args: 'green'
        } 
      ]);
    });
  });
});
