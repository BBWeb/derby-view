var _ = require('lodash');
var uuid = require('uuid');
var defaultFns = require('racer/lib/Model/defaultFns');
var Query = require('./Query');

module.exports = View;

function View(views, path, viewName, viewFn) {
  this.views = views;
  this.path = path;
  this.viewFn = viewFn;
  this.viewName = viewName;
  this.model = views.model.pass({$view: this});
  this.segments = path.split('.');
  this.bundle = true;

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
  this.queries = [];
  this.queryPerLevelInitialized = false;
  this.queryPerLevelFrom = null;
  this.queriesPerLevelFromMap = {};
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

  var query = new Query(this.model, this, start, end);
  this.queries.push(query);
  return query;
};

View.prototype.queryPerLevel = function (from) {
  // Ensure initialized
  this._init();

  // Init initial queries
  this.queryPerLevelInitialized = true;
  from = this.model.path(from);
  this.queryPerLevelFrom = from;

  var groups = this.model._get(this.pathsSegments);
  var keys = Object.keys(groups);

  for(var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i];

    var query = this.query(key, key + 'z');
    query.ref(from + '.' + key);
    this.queriesPerLevelFromMap[key] = query;
  }
};

// Duplicate naming for more Derby-aligned naming
View.prototype.refList = View.prototype.query;

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

    this._trigger(obj, id);
  }
};

View.prototype._delete = function (id) {
  // TODO: Check if we need to go to root here - I dont think so
  var keys = this.model.root._get(this.idsSegments.concat(id))

  if(typeof keys !== 'undefined') {
    for(var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i].key;
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

View.prototype._trigger = function (obj, id) {
  var processed = this._getDiffs(obj, id);
  var diffs = processed.diffs;
  var res = processed.res;

  this._commitRes(res, id);

  for(var i = 0, len = diffs.length; i < len; i++) {
    var diff = diffs[i];
    this._commitDiff(diff);
  }
};

View.prototype._getOriginalObject = function (id) {
  return this.model._get(this.segments.concat(id));
};

View.prototype._getDiffs = function (obj, id) {
  var view = this;
  var res = {};

  function emit(key, path) {
    var path = path || view.path + '.' + id;
    res[key] = path;
  }

  // Trigger view fn and all emits
  if(obj) this.viewFn(emit, obj, id);

  var rootModel = view.model.root;
  var previous = view.model.root._getCopy(this.idsSegments.concat(id)) || {};
  var diffs = [];

  _.each(res, function (path, key) {
    var prev = previous[key];
    // Remove since it's been handled already
    delete previous[key];

    // Add no diff if nothing has changed
    if(prev === path) return;

    // Did not exist previously, let's add it
    if(!prev) {
      diffs.push({
        type: 'add',
        key: key,
        path: path
      });

      return;
    }

    // It was neither added newly, nor no change compared to previously, let's trigger a change 
    diffs.push({
      type: 'change',
      key: key,
      path: path
    });
  });

  // Let's add all delete diffs
  _.each(previous, function (path, key) {
    diffs.push({
      type: 'del',
      key: key
    });
  });

  return {
    diffs: diffs,
    res: res
  };
};

View.prototype._commitDiff = function(diff) {
  var view = this;
  var rootModel = this.model.root;

  // TODO: Review if we should move these onto View prototype for more DRYness
  function del(key) {
    var keySegments = key.split('.');
    var position = view._insertPosition(key);

    rootModel._remove(view.keysSegments, position, 1);

    var refSegments = view.pathsSegments.concat(keySegments);
    var segments = refSegments.slice(0);

    rootModel._removeRef(refSegments, refSegments.join('.'));

    // Do additional cleanup for multi level keys
    if(keySegments.length > 1) {
      var done = false;
      var latestSegment;

      // We need to remove each level of data unless there are other items with the same base segments as key
      while(!done && segments !== view.pathsSegments && (latestSegment = segments.pop())) {

        if(Object.keys(rootModel._get(segments) || {}).length) done = true;
      }

      rootModel._del(segments.concat([latestSegment]));
    }
  }

  function add(key, path) {
    var keySegments = key.split('.');
    var segments = view.pathsSegments.slice(0);

    while(keySegments.length > 1) {
      segments.push(keySegments.shift());

      if(rootModel._get(segments)) continue;

      rootModel._set(segments, {});
    }

    rootModel.ref(view.pathsSegments.concat(key).join('.'), path);
    view._insert(key);
  }

  function change(key, path) {
    var viewPathPath = view.pathsSegments.concat(key).join('.');

    rootModel.removeRef(viewPathPath);

    var position = view._insertPosition(key); // Need to verify if this actually gets the same position as of the key
    view.model._set(view.keysSegments.concat(position), path);

    rootModel.ref(viewPathPath, path);
  }

  var key = diff.key;
  var path = diff.path;

  if(diff.type === 'del') {
    del(key);
  } else if(diff.type === 'add') {
    add(key, path);
  } else {
    change(key, path);
  }

  // Update all queries
  function delQueryPerLevel(key) {
    var keySegments = key.split('.');
    var segments = view.pathsSegments.slice(0);
    var category = keySegments[0];

    segments.push(category);

    if(!view.model._get(segments)) view.queriesPerLevelFromMap[category].destroy(category);
  }

  function addQueryPerLevel(key, path) {
    var keySegments = key.split('.');
    var category = keySegments[0];

    // Check if query exists on category, otherwise create
    if(!view.queriesPerLevelFromMap[category]) {
      var query = view.query(category, category + 'z');
      query.ref(view.queryPerLevelFrom + '.' + category);
      view.queriesPerLevelFromMap[category] = query;
    }
  }

  if(view.queryPerLevelInitialized) {
    // Update which queries we keep maintained
    if(diff.type === 'del') {
      delQueryPerLevel(key);
    } else if(diff.type === 'add') {
      addQueryPerLevel(key, path);
    }
  }

  for(var i = 0, len = view.queries.length; i < len; i++) {
    var query = view.queries[i];

    query.update();
  }
};

View.prototype._commitRes = function (res, id) {
  var rootModel = this.model.root;

  // Ids segments change
  if(_.isEmpty(res)) {
    rootModel._del(this.idsSegments.concat(id));
  } else {
    rootModel._set(this.idsSegments.concat(id), res);
  }
};
