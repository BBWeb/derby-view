module.exports = {
  getEmit: getEmit
};

function getEmit(view, id) {
  return function ret(key, path) {
    var rootModel = view.model.root;
    var path = path || view.path + '.' + id;
    var keySegments = key.split('.');
    var segments = view.pathsSegments.slice(0);

    while(keySegments.length > 1) {
      segments.push(keySegments.shift());

      if(rootModel._get(segments)) continue;

      rootModel._set(segments, {});
    }

    view.model.root.ref(view.pathsSegments.concat(key).join('.'), path);
    view.model._push(view.idsSegments.concat(id), key);
    view._insert(key);
  }
}
