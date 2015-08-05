var util = require('derby/node_modules/racer/lib/util');
var defaultFns = require('derby/node_modules/racer/lib/Model/defaultFns');

// Before 1.0
// TODO: Add to proper repo with proper README and so forth
// TODO: Review current way of including/requiring racer files (above)
// TODO: Review for memory leaks / proper cleanup (still pretty sure this is not fully complete)
// TODO: Review for server vs client use; compared with filter for how each view (and query?) can be processed server-side and sent along and revived client side (still pretty sure this is also not fully complete)
// TODO: Review for ensuring data is kept up to date properly (on all kinds of changes) and that all events are properly propagated (and so forth) - including for queries
// TODO: Review current limitation of only being able to use named functions
// TODO: Throw errors where appropriate (it's severely lacking atm and a lot of use-errors will just cause random JS errors) 
// TODO: Properly comment everyting, in particular the public-facing methods should be properly commented
// TODO: Ensure consistency with README / the docs. Read through and check what else needs to be changed.
// Post 1.0
// TODO: Check/test performance
// TODO: Implement subscribe/fetch
// TODO: Review if this should'nt be broken into several files
// TODO: Review the naming of "query" - it is in conflict with creating queries
// TODO: Write tests
// TODO: Long-term - think about if it's possible to hook in this to happen server-side constantly for specific apps (efficiently creating a cached version of the emitted data/refs/paths)
module.exports = function(racer) {
  var Model = racer.Model;

  Model.INITS.push(function(model) {
    model.root._views = new Views(model);
    model.on('all', viewListener);
    function viewListener(segments, eventArgs) {
      var pass = eventArgs[eventArgs.length - 1];
      var map = model.root._views.fromMap;
      for (var path in map) {
        var view = map[path];
        if (pass.$view === view) continue;
        if (util.mayImpact(view.segments, segments)) {
          var type = eventArgs.shift();

          function add(view, id, value) {
            var emit = getEmit(view, id);
            view.viewFn(emit, value, id);
          }

          function del(view, id) {
            view._delete(id);
          }

          var subSegments = segments.slice(view.segments.length);

          console.log(subSegments);

          var id  = subSegments.shift();
          var value = eventArgs.shift();
          var previous = eventArgs.shift();

          if(type === 'change') {
            // TODO: FIXME
            if(!subSegments.length) {
              if(subSegments.length || (typeof value !== undefined && typeof previous !== undefined)) {
                // Change (= delete + add)
                del(view, id);
                add(view, id, value);
              } else if(value === undefined) {
                del(view, id);
              } else {
                add(view, id, value);
              }
            }
          } else if(type === 'load') {
            add(view, id, value);
          } else if(type === 'unload') {
            del(view, id);
          }
        }
      }
    }
  });

  Model.prototype.view = function() {
    var args = Array.prototype.slice.call(arguments);
    var fn = args.pop();
    var path = this.path(args.shift());
    return this.root._views.add(path, fn);
  };

  // Hook into filters's functionality for removing filters to also remove views
  // Save the original filter fn
  Model.prototype.___removeAllFilters = Model.prototype._removeAllFilters;

  // Create a new one which calls the fn both for filters and views
  Model.prototype._removeAllFilters = function () {
    this.___removeAllFilters.call(this, arguments);
    this._removeAllViews.call(this, arguments);
  };

  // Redo it for the non-internal fn
  Model.prototype.__removeAllFilters = Model.prototype.removeAllFilters;

  Model.prototype.removeAllFilters = function () {
    this.__removeAllFilters.call(this, arguments);
    this.removeAllViews.call(this, arguments);
  };

  // Back to the view specific code
  Model.prototype.removeAllViews = function(subpath) {
    var segments = this._splitPath(subpath);
    this._removeAllViews(segments);
  };
  Model.prototype._removeAllViews = function(segments) {
    var views = this.root._views.fromMap;
    for (var from in views) {
      if (util.contains(segments, views[from].fromSegments)) {
        views[from].destroy();
      }
    }
  };
}

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

function View(views, path, viewName) {
  this.views = views;
  this.model = views.model.pass({$view: this});
  this.path = path;
  this.segments = path.split('.');
  this.viewName = viewName;
  this.bundle = true;
  this.viewFn = this.model.root._namedFns[this.viewName] || defaultFns[this.viewName];

  var segments = ['$views', this.viewName, path.replace(/\./g, '|')];
  // Parent path for all ids for all queries based upon this view 
  this.querySegments = segments.slice(0);
  this.querySegments.splice(2, 0, 'queries');
  // Keeps the order of all keys
  this.keysSegments = segments.slice(0);
  this.keysSegments.splice(2, 0, 'keys');
  // Hashmap mapping keys to the value of each emitted path
  this.pathsSegments = segments.slice(0);
  this.pathsSegments.splice(2, 0, 'paths');
  // Keeps track of all keys related a specific id, on the structure of: {<id>: [<key1_of_id>, <key2_of_id>, ...], ...}
  this.idsSegments = segments.slice(0);
  this.idsSegments.splice(2, 0, 'ids');
  // Ensure paths and ids is a hash
  this.model.root._set(this.pathsSegments, {});
  this.model.root._set(this.idsSegments, {});

  this.initialized = false;
  this.from = null;
  this.fromSegments = null;
  this.fromMap = new FromMap();
}

View.prototype.get = function() {
  // Ensure initialized
  this._init();

  return this.model.root._get(this.pathsSegments);
};

View.prototype.ref = function(from) {
  // Ensure initialized
  this._init();

  from = this.model.path(from);
  this.from = from;
  this.fromSegments = from.split('.');

  // FIXME: This is not appropriate - the whole thing with the FromMap is over-used for our purposes
  this.views.fromMap[from] = this;
  return this.model.root.ref(from, this.pathsSegments.join('.')); 
};

View.prototype.query = function (start, end) {
  // Ensure initialized
  this._init();

  return new Query(this.model, this, start, end);
};

// Duplicate naming for more Derby-aligned naming
View.prototype.refList = View.prototype.query;

function Query(model, view, start, end) {
  this.model = model;
  this.view = view;
  this.start = start;
  this.end = end;
  this.idsSegments = null;
  this.from = null;
  this.fromSegments = null;
}

Query.prototype.ref = function(from) {
  from = this.model.path(from);
  this.from = from;
  this.fromSegments = from.split('.');
  this.view.fromMap[from] = this;
  this.idsSegments = this.view.querySegments.concat(from.replace(/\./g, '|'));
  var path = this._getPath();
  this.update();
  return this.model.root.refList(from, path, this.idsSegments.join('.'));
};

Query.prototype._getPath = function() {
  var start = this.view._insertPosition(this.start);
  var end = this.view._insertPosition(this.end, {upperBound: true});

  if(end < start) throw new Error("Can't currently handle empty queries");

  var id = this.model._get(this.view.keysSegments.concat(start));
  var ref = this.model.root._refs.fromMap[this.view.pathsSegments.concat(id).join('.')];
  var segments = ref.toSegments.slice(0);
  segments.pop();

  return segments.join('.');
};

Query.prototype.ids = function () {
  var start = this.view._insertPosition(this.start);
  var end = this.view._insertPosition(this.end, {upperBound: true});
  var keys = this.model._get(this.view.keysSegments);
  var keys = keys.slice(start, end);
  var ids = keys.map(function (key) {
    return this.model._get(this.view.pathsSegments.concat(key)).id;
  }, this);

  return ids;
};

Query.prototype.update = function(pass) {
  var ids = this.ids();
  this.model.pass(pass, true)._setArrayDiff(this.idsSegments, ids);
};

// TODO: Implement
View.prototype.subscribe = function () {

};

// TODO: Implement
View.prototype.fetch = function () {

};

// TODO: Review this - including properly cleaning up all related queries
View.prototype.destroy = function() {
  delete this.views.fromMap[this.from];
  
  // this.model._removeRef(this.idsSegments);
  // this.model._del(this.idsSegments);

  if(!this.initialized) return;
  this.model._del(this.keysSegments);
  this.model._del(this.pathsSegments);
  this.model._del(this.idsSegments);
};

View.prototype._init = function () {
  // Only initialize once
  if(this.initialized) return;
  this.initialized = true;

  var data = this.model.root._get(this.segments);
  if(!data) return;

  var ids = Object.keys(data);

  for(var i = 0, len = ids.length; i < len; i++) {
    var id = ids[i];
    var obj = data[id];
    var emit = getEmit(this, id);

    this.viewFn(emit, obj, id);
  }
};

View.prototype._delete = function (id) {
  // TODO: Check if we need to go to root here - I dont think so
  var keys = this.model.root._get(this.idsSegments.concat(id))

  if(typeof keys !== 'undefined') {
    for(var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i];
      var position = this._insertPosition(key);

      this.model.root._remove(this.keysSegments, position, 1);

      var refSegments = this.pathsSegments.concat(key);
      this.model.root._removeRef(refSegments, refSegments.join('.'));
    }
  }
  this.model._del(this.idsSegments.concat(id));
};

View.prototype._insert = function (key) {
  var position = this._insertPosition(key);
  this.model._insert(this.keysSegments, position, key);
};

View.prototype._insertPosition = function (key, options) {
  var keys = this.model.root._get(this.keysSegments);
  if(!keys) return 0;
  var len = keys.length;
  var lower = 0;
  var upper = len;
  var done = false;
  var pos;
  var options = options || {};

  while(!done) {
    pos = parseInt((upper + lower) / 2);

    if(pos === lower || pos === upper) {
      done = true;
      continue;
    }

    if(keys[pos] > key) {
      upper = pos;
    } else {
      lower = pos;
    }
  }

  if((pos == 0 && keys[pos] > key) || (!(options && options.upperBound) && keys[pos] === key)) pos--;

  return ++pos;
};

function getEmit(view, id) {
  return function ret(key, path) {
    view.model.root.ref(view.pathsSegments.concat(key).join('.'), path);
    view.model._push(view.idsSegments.concat(id), key);
    view._insert(key);
  }
}
