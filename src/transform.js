import { hash } from "./helpers"

var Map, Transform;

Map = (function() {
  function Map(array) {
    var element, index, _i, _len;
    this.map = {};
    for (index = _i = 0, _len = array.length; _i < _len; index = ++_i) {
      element = array[index];
      this.put(index, element);
    }
  }

  Map.prototype.isMember = function(element) {
    var _ref;
    return ((_ref = this.map[hash(element)]) != null ? _ref[0].length : void 0) > 0;
  };

  Map.prototype.indexOf = function(element) {
    var _ref, _ref1;
    return (_ref = this.map[hash(element)]) != null ? (_ref1 = _ref[0]) != null ? _ref1[0] : void 0 : void 0;
  };

  Map.prototype.put = function(index, element) {
    var existing;
    existing = this.map[hash(element)];
    return this.map[hash(element)] = existing ? [
      existing[0].concat(index).sort(function(a, b) {
        return a - b;
      }), element
    ] : [[index], element];
  };

  Map.prototype.remove = function(element) {
    var _base, _ref;
    return (_ref = this.map[hash(element)]) != null ? typeof (_base = _ref[0]).shift === "function" ? _base.shift() : void 0 : void 0;
  };

  return Map;

})();

Transform = function(from, to) {
  var actual, cleaned, cleanedMap, complete, completeMap, element, index, indexActual, indexWanted, operations, targetMap, wanted, _i, _j, _k, _len, _len1, _len2;
  if (from == null) {
    from = [];
  }
  if (to == null) {
    to = [];
  }
  operations = [];
  to = to.map(function(e) {
    return e;
  });
  targetMap = new Map(to);
  cleaned = [];
  for (_i = 0, _len = from.length; _i < _len; _i++) {
    element = from[_i];
    if (targetMap.isMember(element)) {
      cleaned.push(element);
    } else {
      operations.push({
        type: "remove",
        index: cleaned.length
      });
    }
    targetMap.remove(element);
  }
  complete = [].concat(cleaned);
  cleanedMap = new Map(cleaned);
  for (index = _j = 0, _len1 = to.length; _j < _len1; index = ++_j) {
    element = to[index];
    if (!cleanedMap.isMember(element)) {
      operations.push({
        type: "insert",
        index: index,
        value: element
      });
      complete.splice(index, 0, element);
    }
    cleanedMap.remove(element);
  }
  completeMap = new Map(complete);
  for (indexActual = _k = 0, _len2 = complete.length; _k < _len2; indexActual = ++_k) {
    actual = complete[indexActual];
    wanted = to[indexActual];
    if (actual !== wanted) {
      indexWanted = completeMap.indexOf(wanted);
      completeMap.remove(actual);
      completeMap.remove(wanted);
      completeMap.put(indexWanted, actual);
      complete[indexActual] = wanted;
      complete[indexWanted] = actual;
      operations.push({
        type: "swap",
        index: indexActual,
        "with": indexWanted
      });
    } else {
      completeMap.remove(actual);
    }
  }
  return operations;
};

export default Transform;