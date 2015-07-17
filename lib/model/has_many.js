"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _helpers = require("../helpers");

var _association_collection = require("../association_collection");

var _association_collection2 = _interopRequireDefault(_association_collection);

var _collection = require("../collection");

var _collection2 = _interopRequireDefault(_collection);

exports["default"] = function (name, options) {
  if (!options) options = {};

  var propOptions = (0, _helpers.merge)(options, {
    changed: true,
    get: function get() {
      var valueName = "_" + name;
      if (!this[valueName]) {
        this[valueName] = new _association_collection2["default"](this, options, []);
        this[valueName].change.bind(this[name + "_property"].trigger);
      }
      return this[valueName];
    },
    set: function set(value) {
      this[name].update(value);
    }
  });

  this.property(name, propOptions);
  this.property(name + "Ids", {
    get: function get() {
      return new _collection2["default"](this[name]).map(function (item) {
        return item.id;
      });
    },
    set: function set(ids) {
      var objects = ids.map(function (id) {
        return options.as().find(id);
      });
      this[name].update(objects);
    },
    dependsOn: name,
    serialize: options.serializeIds
  });
  this.property(name + "Count", {
    get: function get() {
      return this[name].length;
    },
    dependsOn: name
  });
};

;
module.exports = exports["default"];