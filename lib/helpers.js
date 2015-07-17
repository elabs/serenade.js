"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.defineOptions = defineOptions;
exports.extend = extend;
exports.assignUnlessEqual = assignUnlessEqual;
exports.merge = merge;
exports.serializeObject = serializeObject;
exports.safePush = safePush;
exports.maybe = maybe;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var settings = {
  async: false,
  views: {},
  templates: {}
};

exports.settings = settings;
var primitiveTypes = ["undefined", "boolean", "number", "string"];

exports.primitiveTypes = primitiveTypes;

function defineOptions(object, name) {
  return Object.defineProperty(object, name, {
    get: function get() {
      if (!this.hasOwnProperty("_" + name)) {
        var options = undefined;
        if (name in Object.getPrototypeOf(this)) {
          options = Object.create(Object.getPrototypeOf(this)[name]);
        }
        Object.defineProperty(this, "_" + name, { configurable: true, writable: true, value: options || {} });
      }
      return this["_" + name];
    }
  });
}

;

function extend(target, source, enumerable) {
  if (enumerable == null) {
    enumerable = true;
  }
  for (var key in source) {
    if (Object.hasOwnProperty.call(source, key)) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    }
  }
  return target;
}

;

function assignUnlessEqual(object, prop, value) {
  if (object[prop] !== value) {
    object[prop] = value;
  }
}

;

function merge(target, source, enumerable) {
  if (enumerable == null) {
    enumerable = true;
  }
  return extend(extend({}, target, enumerable), source, enumerable);
}

;

function isArray(object) {
  return Object.prototype.toString.call(object) === "[object Array]";
};

function serializeObject(object) {
  if (object && typeof object.toJSON === "function") {
    return object.toJSON();
  } else if (isArray(object)) {
    return object.map(function (item) {
      return serializeObject(item);
    });
  } else {
    return object;
  }
}

;

var capitalize = function capitalize(word) {
  return word.slice(0, 1).toUpperCase() + word.slice(1);
};

exports.capitalize = capitalize;
var hash_current = 0;

var hash_prefix = "";

var hash_max = Math.pow(10, 12);

var hash = function hash(value) {
  var key = undefined;
  if (value instanceof Object) {
    if (!("_s_hash" in value)) {
      if (hash_current >= hash_max) {
        hash_prefix = Math.random().toString(36);
      };
      Object.defineProperty(value, "_s_hash", { value: hash_prefix + ++hash_current });
    }
    key = value._s_hash;
  } else {
    key = value;
  }
  return typeof value + " " + key;
};

exports.hash = hash;

function safePush(object, collection, item) {
  if (!object[collection] || object[collection].indexOf(item) === -1) {
    if (object.hasOwnProperty(collection)) {
      object[collection].push(item);
    } else if (object[collection]) {
      Object.defineProperty(object, collection, { value: [item].concat(object[collection]) });
    } else {
      Object.defineProperty(object, collection, { value: [item] });
    }
  }
}

;

var safeDelete = function safeDelete(object, collection, item) {
  if (!object[collection]) return;

  var index = object[collection].indexOf(item);

  if (index !== -1) {
    if (!object.hasOwnProperty(collection)) {
      Object.defineProperty(object, collection, { value: [].concat(object[collection]) });
    }
    object[collection].splice(index, 1);
  }
};

exports.safeDelete = safeDelete;
var nextTickTimeout = null;

var nextTickList = [];

var nextTick = function nextTick(fn) {
  nextTickList.push(fn);
  if (!nextTickTimeout) {
    nextTickTimeout = setTimeout(function () {
      var thisTickList = nextTickList;
      nextTickTimeout = null;
      nextTickList = [];
      thisTickList.forEach(function (fn) {
        return fn();
      });
    }, 0);
  }
};

exports.nextTick = nextTick;

var Maybe = (function () {
  function Maybe(value) {
    _classCallCheck(this, Maybe);

    this.value = value;
  }

  _createClass(Maybe, [{
    key: "map",

    // Maybe(a) :: (a -> b) -> Maybe(b)
    value: function map(fn) {
      if (this.value) {
        return new Maybe(fn(this.value));
      } else {
        return this;
      }
    }
  }, {
    key: "prop",
    value: function prop(name) {
      return this.map(function (value) {
        return value[name];
      });
    }
  }, {
    key: "call",
    value: function call(name) {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this.prop(name).map(function (fn) {
        return fn.apply(_this.value, args);
      });
    }
  }]);

  return Maybe;
})();

function maybe(value) {
  return new Maybe(value);
}