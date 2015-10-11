var util = require('racer/lib/util');
var Views = require('./Views');

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

  Model.INITS.splice(8, 0, function(model) {
    model.root._views = new Views(model);

    function commit(view, id, value, segments, type) {
      var processed = view._getDiffs(value, id);
      var diffs = processed.diffs;
      var res = processed.res;

      view._commitRes(res, id);

      for(var i = 0, len = diffs.length; i < len; i++) {
        var diff = diffs[i];

        if(type !== 'change' || diff.type === 'del') {
          view._commitDiff(diff);
        } else {
          model.once('change', segments.join('.'), function doIt() {
            view._commitDiff(diff);
          });
        }
      }
    }

    var events = ['change', 'load', 'unload'];

    events.forEach(function addListener(type) {
      model.on(type + 'Immediate', function listener(segments, eventArgs) {
        var pass = eventArgs[eventArgs.length - 1];
        var map = model.root._views.fromMap;
        for (var path in map) {
          var view = map[path];
          if (pass.$view === view) continue;

          if (util.mayImpact(view.segments, segments)) {
            var subSegments = segments.slice(view.segments.length);
            var id  = subSegments.shift();
            var value = eventArgs[0];

            commit(view, id, value, segments, type);
          }
        }
      });
        
    });
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
};
