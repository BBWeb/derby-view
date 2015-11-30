var uuid = require('uuid');
var View = require('./View');

module.exports = Views;

function FromMap() {}
function ViewsMap() {}
function Views(model) {
  this.model = model;
  this.fromMap = new FromMap();
  this.viewsMap = new ViewsMap();
  this.views = [];
}

Views.prototype.add = function(path, viewName) {
  if(typeof viewName === 'function') {
    var viewFn = viewName;
    viewName = uuid.v4();
  } else {
    var viewFn = this.model.root._namedFns[viewName] || defaultFns[viewName];
  }

  var key = viewName + '.' + path.replace(/\./g, '|');
  if(this.viewsMap[key]) return this.viewsMap[key];

  var view = new View(this, path, viewName, viewFn);
  this.viewsMap[key] = view;
  this.views.push(view);
  return view;
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
