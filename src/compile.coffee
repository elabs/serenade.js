formatTextValue = (value) ->
  value = "0" if value is 0
  value or ""

bindToProperty = (view, model, name, cb) ->
  value = model[name]
  model["#{name}_property"]?.registerGlobal?(value)
  view.bindEvent(model["#{name}_property"], cb)
  cb({}, value)


Compile =
  element: (ast, model, controller) ->
    view = Serenade.renderView(ast, model, controller)
    view.load?.trigger()
    view

  view: (ast, model, parent) ->
    controller = Serenade.controllers[ast.argument]
    # If we cannot find a controller, we inherit the base view's controller,
    controller = parent unless controller

    compileView = (dynamic, before, after) ->
      view = Serenade.templates[after].render(model, controller, parent)
      dynamic.replace([view.nodes])
      dynamic

    if ast.bound
      @bound(ast, model, controller, compileView)
    else
      compileView(new CollectionView(ast), undefined, ast.argument)

  helper: (ast, model, controller) ->
    dynamic = new CollectionView(ast)
    renderBlock = (model=model, blockController=controller) ->
    helperFunction = Serenade.Helpers[ast.command] or throw SyntaxError "no helper #{ast.command} defined"
    update = ->
      args = ast.arguments.map((a) -> if a.bound then model[a.value] else a.value)
      dynamic.replace([normalize(ast, helperFunction.apply(context, args))])
    for argument in ast.arguments when argument.bound is true
      dynamic.bindEvent(model["#{argument.value}_property"], update)
    update()
    dynamic

  text: (ast, model, controller) ->
    if ast.bound and ast.value
      textNode = Serenade.document.createTextNode("")
      view = new Node(ast, textNode)
      bindToProperty view, model, ast.value, (_, value) ->
        assignUnlessEqual textNode, "nodeValue", formatTextValue(value)
      view
    else
      new Node(ast, Serenade.document.createTextNode(ast.value ? model))

  collection: (ast, model, controller) ->
    update = (collectionView, before, after) ->
      collectionView.unbindEvent(before?.change, collectionView.update)
      collectionView.bindEvent(after?.change, collectionView.update)
      collectionView.update()
    @bound(ast, model, controller, update)

  in: (ast, model, controller) ->
    @bound ast, model, controller, (dynamic, _, value) ->
      if value
        dynamic.replace([new TemplateView(ast.children, value, controller)])
      else
        dynamic.clear()

  if: (ast, model, controller) ->
    @bound ast, model, controller, (dynamic, _, value) ->
      if value
        dynamic.replace([new TemplateView(ast.children, model, controller)])
      else if ast.else
        dynamic.replace([new TemplateView(ast.else.children, model, controller)])
      else
        dynamic.clear()

  unless: (ast, model, controller) ->
    @bound ast, model, controller, (dynamic, _, value) ->
      if value
        dynamic.clear()
      else
        nodes = new TemplateView(ast.children, model, controller)
        dynamic.replace([nodes])

  bound: (ast, model, controller, callback) ->
    dynamic = new CollectionView(ast)
    bindToProperty dynamic, model, ast.argument, (before, after) ->
      callback(dynamic, before, after) unless before is after
    dynamic

# turn a single element, document fragment, compiled view or string, or an
# array of any of these into Nodes.
normalize = (ast, val) ->
  return [] unless val
  reduction = (aggregate, element) ->
    if typeof(element) is "string"
      div = Serenade.document.createElement("div")
      div.innerHTML = element
      aggregate.push(new Node(ast, child)) for child in div.childNodes
    else if element.nodeName is "#document-fragment"
      if element.nodes # rendered Serenade.template, clean up listeners!
        aggregate = aggregate.concat(element.nodes)
      else
        aggregate.push(new Node(ast, child)) for child in element.childNodes
    else
      aggregate.push(new Node(ast, element))
    aggregate
  [].concat(val).reduce(reduction, [])
