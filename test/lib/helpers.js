var _         = require('lodash');
var Model     = require('racer/lib/Model');
require('./../../index.js')({Model: Model});

module.exports = {
  // Create model and possibly set it up with some data and fn
  setupModel: function(collections, fnName, fn) {
    var fnName = fnName || 'default';

    var model = (new Model).at('_page');

    if(collections) {
      _.each(collections, function (collection, name) {
        _.each(collection, function (doc, key) {
          model.add(name, _.cloneDeep(doc));
        });
      });
    }

    if(fnName && fn) model.fn(fnName, fn);

    return model;
  },

	// Adds a function that is to be executed at the specified path. Returns the name of the function.
  addFunction: function(model, collectionName, multiLevel) {
    var functionName	= 'yellowFruits';
    var pathName 	 	= '_page.' + collectionName + '.';
    var keySeparator;
    
    if (multiLevel) {
      keySeparator = '.';
    } else {
      keySeparator = '*';
    }

    model.fn(functionName, function(emit, fruit) {
      if (fruit.color === 'yellow') {
        emit(fruit.name + keySeparator + fruit.color, pathName + fruit.id);
      }
    });
    return functionName;
  },

  // Adds a function which only emits the 'key' argument (i.e. does not include the pathName)
  addFunctionWithOnlyKey: function(model, multiLevel) {
    var functionName = 'yellowFruits';
    var keySeparator;
    
    if (multiLevel) {
      keySeparator = '.';
    } else {
      keySeparator = '*';
    }

    model.fn(functionName, function(emit, fruit) {
      if (fruit.color === 'yellow') {
        emit(fruit.name + keySeparator + fruit.color);        
      }
    }); 
    return functionName;
  },

  // Adds data to the model
  addData: function(model, collectionName, data) {
    for (var i = 0, len = data.length; i < len; i++) {
      model.add(collectionName, data[i]);
    }
  },

  // Creates and returns a key for the specified object
  createKey: function(args, multiLevel) {
    if (multiLevel) { 
      return;
    } else {
      return args.name + '*' + args.color;
    }
  },

  // Returns an object containing key-object pairs for the specified object ids
  createExpectedResult: function(model, idArray, collectionName, multiLevel) {
    var result = {};
    var fruitObject;
    var key;

    for(var i = 0, len = idArray.length; i < len; i++) {
      fruitObject = model.get(collectionName + '.'+ idArray[i]);
      if (multiLevel) {
        result[fruitObject.name] = {};
        result[fruitObject.name][fruitObject.color] = fruitObject;
      } else {
        key = fruitObject.name + '*' + fruitObject.color;
        result[key] = fruitObject;
      }     
    }
    return result;
  },

  createListenerDataObject: function(path, eventEmitted, args) {
    var dataObject = {};
    dataObject['path'] = path;
    dataObject['eventEmitted'] = eventEmitted;
    dataObject['args'] = args;
    return dataObject;
  }
};
