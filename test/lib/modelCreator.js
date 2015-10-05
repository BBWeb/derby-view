var Model     = require('racer/lib/Model');
require('../index.js')({Model: Model});

module.exports = {
  // Creates model 
	setupModel: function() {
		return model = (new Model).at('_page');
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
  }
};



