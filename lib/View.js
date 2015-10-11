var uuid = require('uuid');
var defaultFns = require('racer/lib/Model/defaultFns');
var Query = require('./query');
var helpers = require('./helpers');
var getEmit = helpers.getEmit;

module.exports = View;

function FromMap() {}

function View(views, path, viewName) {
  this.views = views;
  this.model = views.model.pass({$view: this});
  this.path = path;
  this.segments = path.split('.');
  this.bundle = true;

  if(typeof viewName === 'function') {
    this.viewFn = viewName;
    this.viewName = uuid.v4();
  } else {
    this.viewName = viewName;
    this.viewFn = this.model.root._namedFns[this.viewName] || defaultFns[this.viewName];
  }

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