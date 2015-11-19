# derby-view
Derby plugin for creating map/reduce -style views and queries of those views

Why
===
Because model.filter is rather limited at the moment, and the only way to create any sort of more complex structure without keeping track of all events/reactivity oneself. A better way which makes it more aligned with an MVC structure also facilitates better structure (not a lot of business logic easily tend to end up inside the components, or possible, routes).

How to use
==========
Add derby-view as a derby plugin in the top of your application (before the app is created);
```javascript
var derby = require('derby');

derby.use(require('derby-view'));

...
```

Then, you can create views, and subsequently ref or create queries on top of those views. See API docs below for examples.


API docs
========
#### view = model.view(collection, mapFn)

Views are ordered, possibly filtered lists based on a map function, looped over a collection. A map function is called for each item (reactively kept up to date) and possibly emits one or more keys (or none), each paired with one path (defaults to the current item’s path - NOTE! Currently not implemented!) which points to an item (or it could probably be whatever). The order is based upon the lexographical order. Internally, a view consists of three data structures. One array which contains all emitted keys (ordered), and one collection/hashmap which maps the keys to their respective emitted path. Additionally, one keeps track of which docs emitted which key/path-pairs, for internal use for cleanups.

Note: Currently, mapFn needs to be a named fn in Derby, i.e. create using model.fn, like for example:
```javascript
model.fn('myViewFn', function (emit, doc) {
  emit(key, path);
});
```

Note 2: Currently, all paths are automatically turned into refs, for simpler access in views.

Example:
```javascript
var view = model.view('myCollection', 'myViewFn');
```

A view does not necessarily in of itself do anything - it just enables certain methods.

#### view.ref('myPath')

A view can be ref'd in two ways. Either it can be used as a simple connection/hashmap, simply by ref'ing it. On the path, each item can be accessed by using the emitted key. E.g.

```javascript
{{myPath[key].somePropertyOnDocOfPath}}
```

#### view.query(path, [start], [end], [options])
#### view.refList(path, ...) -- really just another name for query

[options.include_end]
[options.descending]

It can also be used as a refList (i.e. a better, more performant and general version of filter). This type can also be delimited based on start and end inputs (delimiting the keys to be within the start and end), and a view can be delimited an infinite amount of times with different input (i.e. using it as a query) to different paths.

Note: Options are not currently implemented
Note 2: Currently, a path is not needed to be specified, but you have to ref it using myQuery.ref(path) instead.

#### view.queryPerLevel(path)

In some scenarios, one would like to combine a multi level organization of items with a list for each category (i.e. first level) of items. It's tedious to manually maintain all these queries, and ensure new one categories are created and old ones removed. Because of that, there's a convenience fn which automatically creates a query for each unique first level, and maintains this for you. Basically, you'll use it like this:

```javascript
var view = ...
view.queryPerLevel('_page.allMyQueries');

var allItemsForASepcificCategory = model.root.get('_page.allmyQueries.<category key>');

// allItemsForASepcificCategory = [item1, item2]
```

## BELOW METHODS ARE NOT YET IMPLEMENTED!

#### view.subscribe(callback)
#### view.fetch(callback)

Moreover, a view can be used to ensure joining data is fetched or subscribed to. This is assuming the paths emitted from the view are on the form of <collection>.<id>. As the view is updated it keeps track of all the ids from each collection and ensures all of those documents are fetched or subscribed (depending on which method called).

Implementation details of this one needs to be considered carefully for performance reason. In general, it might be quite tough on the performance. So far, there is internal tracking of all the ids fetched (and probably also subscribed to) so obviously the implementation should only consider the new ones (and possibly cleaning up old, no longer in used ids automatically). Further, there should probably be done kind of batching it something to reduce the amount of times the db is called (e.g. so that a new call is made for each emit, or something else).

TODO
====
See index.js for a TODO list and read through the API docs to ensure everything is covered in a good way.

Kudos
=====
To PouchDB/CouchDB for inspiration.
