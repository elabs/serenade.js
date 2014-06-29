Serenade.template 'thing', '''
  div[id="serenade"]
    p
      a[event:click=doThing! href="#"] "Do thing"
    p[event:mouseover=over event:mouseout=out]
      "Mouse over this area to change"
    p
      strong "Thing: "
      span @schmoo
    p
      strong "Barr: "
      span @barr
    p
      input[type="text" value=@schmoo event:change=didChange name="schmoo"]
    p
      input[type="text" value=@barr event:change=didChange name="barr"]
'''


class Thing extends Serenade.Model
  @property 'schmoo'
  @property 'barr'

class Controller
  constructor: (@model) ->
  doThing: ->
    @model.schmoo = 'I did a thing'
  over: ->
    @originalSchmoo = @model.schmoo
    @model.schmoo = 'mousin over'
  out: ->
    @model.schmoo = @originalSchmoo
  didChange: ->
    target = event.target or event.srcElement
    @model[target.getAttribute('name')] = target.value

window.aThing = new Thing()

window.onload = ->
  view = Serenade.render('thing', aThing, Controller)
  sandbox = document.body.appendChild(view)
