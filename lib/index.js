var util = require('racer/lib/util');
var Views = require('./Views');

// Before 1.0
// TODO: Review for memory leaks / proper cleanup (still pretty sure this is not fully complete)
// TODO: Review current limitation of only being able to use named functions
// TODO: Review for server vs client use; compared with filter for how each view (and query?) can be processed server-side and sent along and revived client side (still pretty sure this is also not fully complete)
// TODO: Throw errors where appropriate (it's severely lacking atm and a lot of use-errors will just cause random JS errors) 
// TODO: Properly comment everyting, in particular the public-facing methods should be properly commented
// TODO: Ensure consistency with README / the docs. Read through and check what else needs to be changed.
// Post 1.0
// TODO: Check/test performance
// TODO: Implement subscribe/fetch
// TODO: Review the naming of "query" - it is in conflict with creating queries
// TODO: Add tests for queries, both for query events and data
// TODO: Long-term - think about if it's possible to hook in this to happen server-side constantly for specific apps (efficiently creating a cached version of the emitted data/refs/paths)
module.exports = function(racer) {
  var Model = racer.Model;

  Model.INITS.splice(8, 0, function(model) {
    model.root._views = new Views(model);

    function commit(view, id, segments, type) {
      var value = view._getOriginalObject(id);
      var processed = view._getDiffs(value, id);
      var diffs = processed.diffs;
      var res = processed.res;

      view._commitRes(res, id);

      for(var i = 0, len = diffs.length; i < len; i++) {
        var diff = diffs[i];

        if(!view.from || type !== 'change' || diff.type === 'del') {
          view._commitDiff(diff);
        } else {
          model.once('change', segments.join('.'), (function wrapper(diff) {
            return function doIt() {
              view._commitDiff(diff);
            }
          })(diff));
        }
      }
    }

    var events = ['change', 'load', 'unload'];
    var views = model.root._views.views;

    events.forEach(function addListener(type) {
      model.on(type + 'Immediate', function immediateListener(segments, eventArgs) {
        var pass = eventArgs[eventArgs.length - 1];
        for(var i = 0, len = views.length; i < len; i++) {
          var view = views[i];

          if(view.from) {
            if (pass.$view === view) continue;

            if (util.mayImpact(view.segments, segments)) {
              var subSegments = segments.slice(view.segments.length);
              var id  = subSegments.shift();

              commit(view, id, segments, type);
            }
            
          }
        }
      });

      model.on(type, function listener(segments, eventArgs) {
        var pass = eventArgs[eventArgs.length - 1];
        for(var i = 0, len = views.length; i < len; i++) {
          var view = views[i];

          if(!view.from && view.initialized) {
            if (pass.$view === view) continue;

            if (util.mayImpact(view.segments, segments)) {
              var subSegments = segments.slice(view.segments.length);
              var id  = subSegments.shift();

              commit(view, id, segments, type);
            }
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
    this.___removeAllFilters.apply(this, arguments);
    this._removeAllViews.apply(this, arguments);
  };

  // Redo it for the non-internal fn
  Model.prototype.__removeAllFilters = Model.prototype.removeAllFilters;

  Model.prototype.removeAllFilters = function () {
    this.__removeAllFilters.apply(this, arguments);
    this.removeAllViews.apply(this, arguments);
  };

  // Back to the view specific code
  Model.prototype.removeAllViews = function(subpath) {
    var segments = this._splitPath(subpath);
    this._removeAllViews(segments);
  };
  Model.prototype._removeAllViews = function(segments) {
    var views = this.root._views.views;

    for(var i = views.length - 1; i >= 0; i--) {
      var view = views[i];
      var keep = false;
      var queryPerLevelRemoved = false;

      // Check queryPerLevel
      if(view.queryPerLevelInitialized) {
        if(util.contains(segments, view.queryPerLevelFromSegments)) {
          queryPerLevelRemoved = true;

          for(var key in view.queriesPerLevelFromMap) {
            view.queriesPerLevelFromMap[key].destroy(key);
          }
        } else {
          keep = true;
        }
      }

      // Check remaining queries
      for(var j = view.queries.length - 1; j >= 0; j--) {
        var query = view.queries[j];

        if(!query.fromSegments || util.contains(segments, query.fromSegments)) {
          query.destroy();
        } else {
          keep = true;
        }
      }

      // Check view ref and possibly undo certain ref'ing if needed
      if(!view.fromSegments || util.contains(segments, view.fromSegments)) {
        if(!keep) {
          view.destroy();
        } else {
          // TODO: Undo ref'ing
        }
      }

      if(!view.destroyed && queryPerLevelRemoved) {
        // TODO: Undo queryPerLevel "ref'ing"
      }
    }
  };
};
