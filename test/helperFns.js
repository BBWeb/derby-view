module.exports = {
  // Returns an object containing key-object pairs for the specified object ids
  createExpectedResult: function(model, idArray, collectionName) {
    var result = {};
    var fruitObject;
    var key;

    for(var i = 0, len = idArray.length; i < len; i++) {
      //fruitObject = model.get('fruits.'+ idArray[i]);
      fruitObject = model.get(collectionName + '.'+ idArray[i]);
      key = fruitObject.name + '*' + fruitObject.color;
      result[key] = fruitObject;
    }
    return result;
  }
};

