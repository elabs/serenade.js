import DynamicView from "./dynamic_view"
import View from "./view"
import TemplateView from "./template_view"
import Collection from "../collection"
import { settings } from "../helpers"
import Compile from "../compile"

function normalize(val) {
  if(!val) return [];

  return new Collection([].concat(val).reduce((aggregate, element) => {
    if(typeof element === "string") {
      let div = settings.document.createElement("div");
      div.innerHTML = element;
      Array.prototype.forEach.call(div.childNodes, (child) => {
        aggregate.push(new View(child));
      });
    } else if(element && element.isView) {
      aggregate = aggregate.concat(element);
    } else {
      aggregate.push(new View(element));
    }
    return aggregate;
  }, []));
};

class HelperView extends DynamicView {
  constructor(ast, context, helper) {
    super(ast, context);

    this.helper = helper;
    this.render = this.render.bind(this);
    this.update = this.update.bind(this);
  }

  attach() {
    if(!this.attached) {
      this.ast.arguments.forEach(({ value, bound }) => {
        if (bound === true) {
          this._bindEvent(this.context["" + value + "_property"], this.update);
        }
      });
      this.update();
    }
    super.attach();
  }

  update() {
    this.replace(normalize(this.helper.call({
      context: this.context,
      render: this.render
    }, ...this.arguments)));
  }

  get arguments() {
    return this.ast.arguments.map((argument) => {
      return (argument.static || argument.bound) ? this.context[argument.value] : argument.value;
    });
  }

  render(context) {
    return new TemplateView(this.ast.children, context).fragment;
  }
}

Compile.helper = function(ast, context) {
  return settings.views[ast.command](ast, context);
};


export default HelperView;
