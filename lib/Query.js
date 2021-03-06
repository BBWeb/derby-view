var _ = require('lodash');

module.exports = Query;

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
  this.idsSegments = this.view.querySegments.concat(from.replace(/\./g, '|'));
  var path = this._getPath();
  this.update();
  return this.model.root.refList(from, path, this.idsSegments.join('.'));
};

Query.prototype._getPath = function() {
  var start = this.view._insertPosition(this.start);
  var end = this.view._insertPosition(this.end, {upperBound: true});

  if(end < start) throw new Error("Can't currently handle empty queries");

  var key = this.model._get(this.view.keysSegments.concat(start));
  var results = this.model._get(this.view.idsSegments);
  var path = _.find(results, function (res) {
      return res.hasOwnProperty(key);
    })[key];

  var segments = path.split('.');
  segments.pop();

  return segments.join('.');
};

Query.prototype.ids = function () {
  var start = this.view._insertPosition(this.start);
  var end = this.view._insertPosition(this.end, {upperBound: true});
  var keys = this.model._get(this.view.keysSegments);
  var keys = keys.slice(start, end);
  var ids = keys.map(function (key) {
    return this.model._get(this.view.pathsSegments.concat(key.split('.'))).id;
  }, this);

  return ids;
};

Query.prototype.update = function(pass) {
  var ids = this.ids();
  this.model.pass(pass, true)._setArrayDiff(this.idsSegments, ids);
};

/**
 * Destroys a query
 *
 * @param {string} [category] - Passed only if part of a queryPerLevel situation (then it really should be passed ince otherwise we'll have a memory leak). The category which the query belonged to.
 */
Query.prototype.destroy = function(category) {
  if(category) delete this.view.queriesPerLevelFromMap[category];

  _.remove(this.view.queries, this);
  this.model.root.removeRef(this.from);
};
