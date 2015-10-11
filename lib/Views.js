var View = require('./View');

module.exports = Views;

function FromMap() {}
function Views(model) {
  this.model = model;
  this.fromMap = new FromMap();
}

Views.prototype.add = function(path, viewFn) {
  return new View(this, path, viewFn);
};

Views.prototype.toJSON = function() {
  var out = [];
  for (var from in this.fromMap) {
    var view = this.fromMap[from];
    // Don't try to bundle if functions were passed directly instead of by name
    if (!view.bundle) continue;
    var args = [from, view.path, view.viewName];
    out.push(args);
  }
  return out;
};
