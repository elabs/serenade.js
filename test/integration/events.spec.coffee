require './../spec_helper'

describe 'Events', ->
  beforeEach ->
    @setupDom()

  it 'attaches an event which calls the controller action when triggered', ->
    controller = { iWasClicked: -> @clicked = true }
    @render 'div[event:click=iWasClicked]', {}, controller
    @fireEvent @body.querySelector('div'), 'click'
    expect(controller.clicked).to.be.ok

  it 'sends in model, element and event when action is triggered', ->
    nodeName = null
    name = null
    eventType = null
    controller =
      iWasClicked: (view, model, event) ->
        nodeName = view.nodeName
        name = model.name
        eventType = event.type
    @render 'div\n\ta[event:click=iWasClicked]', { name: "Jonas" }, controller
    @fireEvent @body.querySelector('a'), 'click'
    expect(nodeName).to.eql("A")
    expect(name).to.eql("Jonas")
    expect(eventType).to.eql("click")

  it 'sends in the element that the event was bound to, not where it was triggered', ->
    nodeName = null
    controller =
      iWasClicked: (view) ->
        nodeName = view.nodeName
    @render 'div[event:click=iWasClicked]\n\ta', {}, controller
    @fireEvent @body.querySelector('a'), 'click'
    expect(nodeName).to.eql("DIV")
