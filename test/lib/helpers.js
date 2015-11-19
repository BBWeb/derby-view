var _         = require('lodash');
var Model     = require('racer/lib/Model');
require('./../../lib/index.js')({Model: Model});

module.exports = {
  getModelSetup: getModelSetup,
  EventListenerData: EventListenerData
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
    model.expectedResult = function (collections, separator, properties, related) {
      var result = {};
      var separator = separator || defaultSeparator;
      var properties = properties || defaultProperties;

      _.each(collections, function (ids, collectionName) {
        for(var i = 0, len = ids.length; i < len; i++) {
          var id = ids[i];
          var doc = model.get(collectionName + '.' + id);
          var key = _getPropertiesAsKey(separator, properties, doc);

          if(related) doc = model.get(collectionName + '.' + doc.related);

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


function EventListenerData() {
  this.eventData = [];
};

// The arguments passed are saved as an object and inserted into an array.
EventListenerData.prototype.collectListenerData = function(path, eventEmitted, args) {
  var dataObject = {};
  dataObject['path'] = path;
  dataObject['eventEmitted'] = eventEmitted;
  dataObject['args'] = args;
  this.eventData.push(dataObject);
};
