"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _dynamic_view = require("./dynamic_view");

var _dynamic_view2 = _interopRequireDefault(_dynamic_view);

var _compile = require("../compile");

var _compile2 = _interopRequireDefault(_compile);

var _helpers = require("../helpers");

var BoundViewView = (function (_DynamicView) {
  _inherits(BoundViewView, _DynamicView);

  function BoundViewView(ast, context) {
    var _this = this;

    _classCallCheck(this, BoundViewView);

    _get(Object.getPrototypeOf(BoundViewView.prototype), "constructor", this).call(this, ast, context);
    this._bindToModel(ast.argument, function (value) {
      var view = _helpers.settings.templates[value].render(context).view;
      _this.replace([view]);
    });
  }

  return BoundViewView;
})(_dynamic_view2["default"]);

_compile2["default"].view = function (ast, context) {
  if (ast.bound) {
    return new BoundViewView(ast, context);
  } else {
    return _helpers.settings.templates[ast.argument].render(context).view;
  }
};

exports["default"] = BoundViewView;
module.exports = exports["default"];