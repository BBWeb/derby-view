module.exports = {
  // Adds data to the model
  addData: function(model) {
    var fruits = [  {name: 'apple',  color: 'red', amount: 5, id: 'appleId'},
                    {name: 'orange', color: 'orange', amount: 10, id: 'orangeId'},
                    {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId'},
                    {name: 'lemon',  color: 'yellow', amount: 20, id: 'lemonId'} ];

    for (var i = 0, len = fruits.length; i < len; i++) {
      model.add('fruits', fruits[i]);
    }
  },

  // Returns an object containing key-object pairs for the specified ids
  createExpectedResult: function(model, idArray) {
    var result = {};
    var fruitObject;
    var key;

    for(var i = 0, len = idArray.length; i < len; i++) {
      fruitObject = model.get('fruits.'+ idArray[i]); 
      key = fruitObject.name + '*' + fruitObject.color + '*' + fruitObject.amount*2;
      result[key] = fruitObject;
    }
    return result;
  }
};