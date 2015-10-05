var _         = require('lodash');
var Model     = require('racer/lib/Model');
require('./../../index.js')({Model: Model});

module.exports = {
  getModelSetup: getModelSetup,

  // Create model and possibly set it up with some data and fn
  // TODO: Remove in favor of new helper fn
  setupModel: function(collections, fns) {
    var fnName = fnName || 'default';

    var model = (new Model).at('_page');

    if(collections) {
      _.each(collections, function (collection, name) {
        _.each(collection, function (doc, key) {
          model.add(name, _.cloneDeep(doc));
        });
      });
    }

    if(fns) {
      _.each(fns, function (fn, name) {
        model.fn(name, fn);
      });
    }

    return model;
  },

	// Adds a function that is to be executed at the specified path. Returns the name of the function.
  // TODO: Remove in favor of new helper fn
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
  // TODO: Remove in favor of new helper fn
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

  getExpectedResult: function (model, defaultFn) {
    // TODO: Currently only supporting one collection passed along, need to update tests as well though if/when reworking
    function expectedResult(collections, fn) {
      var result = {};
      var fn = fn || defaultFn;

      _.each(collections, function (ids, collectionName) {
        for(var i = 0, len = ids.length; i < len; i++) {
          var id = ids[i];
          var doc = model.get(collectionName + '.' + id);
          var key = fn(doc);

          set(result, key, doc);
        }
      });
    }

    return expectedResult;
  },

  createListenerDataObject: function(path, eventEmitted, args) {
    var dataObject = {};
    dataObject['path'] = path;
    dataObject['eventEmitted'] = eventEmitted;
    dataObject['args'] = args;
    return dataObject;
  }
};

function getModelSetup(modelFns, defaultSeparator, defaultProperties) {
  function setupModel(collections) {
    var model = (new Model).at('_page');

    if(collections) {
      _.each(collections, function (collection, name) {
        _.each(collection, function (doc, key) {
          model.add(name, _.cloneDeep(doc));
        });
      });
    }

    if(modelFns) {
      _.each(modelFns, function (fn, name) {
        model.fn(name, fn);
      });
    }

    // TODO: Currently only supporting one collection passed along, need to update tests as well though if/when reworking
    model.expectedResult = function (collections, separator, properties) {
      var result = {};
      var separator = separator || defaultSeparator;
      var properties = properties || defaultProperties;

      _.each(collections, function (ids, collectionName) {
        for(var i = 0, len = ids.length; i < len; i++) {
          var id = ids[i];
          var doc = model.get(collectionName + '.' + id);
          var key = _getPropertiesAsKey(separator, properties, doc);

          _set(result, key, doc);
        }
      });

      return result;
    };

    return model;
  }

  return setupModel;
}

// Gets properties from doc and joins them together into a key
function _getPropertiesAsKey(separator, properties, doc) {
  var keySegments = [];

  for(var i = 0, len = properties.length; i < len; i++) {
    var property = properties[i];
    keySegments.push(doc[property]);
  }

  var key = keySegments.join(separator);

  return key;
}

// Setter method where you can specify a path and it will traverse an object, set the data and make it look similar to a derby model
function _set(obj, path, data) {
  var splittedPath = path.split('.');
  var obj = obj;
  var originalObj = obj;

  for(var i = 0, len = splittedPath.length - 1; i < len; i++) {
    var segment = splittedPath[i];

    obj[segment] = obj[segment] || {};
    obj = obj[segment];
  }

  var segment = splittedPath.pop();
  obj[segment] = data;

  return originalObj;
}
