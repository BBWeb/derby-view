var _ = require('lodash');
var defaultFns = require('racer/lib/Model/defaultFns');
var uuid = require('uuid');
var View = require('./View');

module.exports = Views;

function ViewsMap() {}
function Views(model) {
  this.model = model;
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

  var key = getKey(viewName, path);
  if(this.viewsMap[key]) return this.viewsMap[key];

  var view = new View(this, path, viewName, viewFn);
  this.viewsMap[key] = view;
  this.views.push(view);
  return view;
};

Views.prototype.toJSON = function() {
  var out = [];
  // TODO: FIXME!
  // for (var from in this.fromMap) {
  //   var view = this.fromMap[from];
  //   // Don't try to bundle if functions were passed directly instead of by name
  //   if (!view.bundle) continue;
  //   var args = [from, view.path, view.viewName];
  //   out.push(args);
  // }
  return out;
};

Views.prototype.remove = function(view) {
  var key = getKey(view.viewName, view.path);
  delete this.viewsMap[key];

  _.remove(this.views, function (specificView) {
    return specificView === view;
  });
};

function getKey(viewName, path) {
  return viewName + '.' + path.replace(/\./g, '|');
}
