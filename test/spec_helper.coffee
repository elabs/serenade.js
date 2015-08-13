# load globally so we don't have to load it again and again
Serenade = require('../lib/serenade')

chai = require 'chai'
chai.should()
chai.Assertion.includeStack = true
root.expect = chai.expect
sinon = require('sinon')

isArray = (arr) -> arr and (Array.isArray(arr) or arr.constructor is Serenade.Collection)

compareArrays = (one, two) ->
  if isArray(one) and isArray(two)
    fail = true for item, i in one when not compareArrays(two[i], item)
    one.length is two.length and not fail
  else
    one is two

jsdom = require("jsdom")
fs = require('fs')

root.requestAnimationFrame = (fn) ->
  setTimeout(fn, 17)

root.cancelAnimationFrame = clearTimeout

beforeEach ->
  Serenade.async = false
  Serenade.unregisterAll()
  Serenade.clearCache()

  @setupDom = =>
    @document = require("jsdom").jsdom("<!doctype html><html><body></body></html>", features: { QuerySelector: true })
    @window = @document.defaultView
    @body = @document.body
    Serenade.document = @document

  @fireEvent = (element, name) ->
    event = @document.createEvent('HTMLEvents')
    event.initEvent(name, true, true)
    element.dispatchEvent(event)

  @render = (template, context) =>
    @body.appendChild(Serenade.template(template).render(context))

  @sinon = sinon.sandbox.create()

afterEach ->
  @sinon.restore()

chai.Assertion::element = (selector, options) ->
  if options and options.count
    actual = @obj.find(selector).length
    @assert actual == options.count, "expected #{options.count} of @{selector}, but there were #{actual}", "expected #{selector} not to occur #{options.count} times, but it did"
  else
    @assert @obj.querySelectorAll(selector).length > 0, "expected #{selector} to occur", "expected #{selector} not to occur, but it did"

chai.Assertion::text = (text) ->
  actual = @obj.textContent.trim().replace(/\s+/g, ' ')
  @assert actual is text, "expected #{actual} to be #{text}"
chai.Assertion::attribute = (name) ->
  @assert @obj.hasAttribute(name), "expected #{@obj} to have attribute #{name}"
chai.Assertion::property = (name) ->
  @assert @obj[name], "expected #{@obj} to have property #{name}"
chai.Assertion::triggerEvent = (event, options={}) ->
  args = null
  count = 0
  fun = (a...) ->
    args = a
    count += 1

  event.bind fun
  @obj()
  event.unbind fun

  if @negate
    @assert count isnt 0, "", "event #{event.name} should not have been triggered (was triggered #{count} times)"
  else
    expectedCount = options.count ? 1
    @assert count is expectedCount, "event #{event.name} was triggered #{count} times, expected #{expectedCount}"
  if options.with
    @assert compareArrays(args, options.with), "event arguments #{args} do not match expected arguments #{options.with}"
chai.Assertion::become = (value, done) ->
  count = 0
  test = =>
    result = @obj()
    if result is value
      done()
    else if count > 3
      done(new Error("expected #{result} to become equal to #{value}"))
    else
      count += 1
      setTimeout(test, 5)
  test()

root.context = describe
