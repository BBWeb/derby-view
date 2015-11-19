module.exports = {
  // Sample collection data
  fruits: [
    {name: 'apple',  color: 'red',    amount: 5,  id: 'appleId', related: 'orangeId'},
    {name: 'orange', color: 'orange', amount: 10, id: 'orangeId', related: 'appleId'},
    {name: 'banana', color: 'yellow', amount: 15, id: 'bananaId', related: 'lemonId'},
    {name: 'lemon',  color: 'yellow', amount: 20, id: 'lemonId', related: 'bananaId'}
  ],
  // Sample view fns
  fns: {
    yellowFruits: function (emit, fruit) {
      if (fruit.color === 'yellow') {
        emit(fruit.name + '*' + fruit.color);
      }
    },
    yellowFruitsMultilevel: function (emit, fruit) {
      if (fruit.color === 'yellow') {
        emit(fruit.name + '.' + fruit.color);
      }
    },
    yellowFruitsWithPath: function (emit, fruit) {
      if (fruit.color === 'yellow') {
        emit(fruit.name + '*' + fruit.color, '_page.fruits.' + fruit.id);
      }
    },
    yellowFruitsMultilevelWithPath: function (emit, fruit) {
      if (fruit.color === 'yellow') {
        emit(fruit.name + '.' + fruit.color, '_page.fruits.' + fruit.id);
      }
    }
  }
};
