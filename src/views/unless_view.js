import DynamicView from "./dynamic_view"
import TemplateView from "./template_view"
import Compile from "../compile"

// Generated by CoffeeScript 1.7.1
var UnlessView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

UnlessView = (function(_super) {
  __extends(UnlessView, _super);

  function UnlessView() {
    UnlessView.__super__.constructor.apply(this, arguments);
    this._bindToModel(this.ast.argument, (function(_this) {
      return function(value) {
        if (value) {
          return _this.clear();
        } else {
          return _this.replace([new TemplateView(_this.ast.children, _this.context)]);
        }
      };
    })(this));
  }

  return UnlessView;

})(DynamicView);

Compile.unless = function(ast, context) {
  return new UnlessView(ast, context);
};

export default UnlessView;