var Model     = require('racer/lib/Model');
require('../index.js')({Model: Model});

module.exports = {
  // Creates model 
	setupModel: function() {
		return model = (new Model).at('_page');
	},

	// Adds a function that is to be executed at the specified path. Returns the name of the function.
   addFunction: function(model, collectionName) {
      var functionName	= 'yellowFruits';
      var pathName 	 	= '_page.' + collectionName + '.';
      model.fn(functionName, function(emit, fruit) {
         if (fruit.color === 'yellow') {
            emit(fruit.name + '*' + fruit.color, pathName + fruit.id);
         }
      }); 
      return functionName;
   },

   // Adds data to the model
   addData: function(model, collectionName, data) {
    for (var i = 0, len = data.length; i < len; i++) {
      model.add(collectionName, data[i]);
    }
  }
};

