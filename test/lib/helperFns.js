module.exports = {
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



