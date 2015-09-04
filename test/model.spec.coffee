require './spec_helper'
Serenade = require('../lib/serenade')

describe 'Serenade.Model', ->
  describe '#constructor', ->
    it 'sets the given properties', ->
      john = new Serenade.Model(name: 'John', age: 23)
      expect(john.age).to.eql(23)
      expect(john.name).to.eql('John')

    it 'enumerates over only those properties', ->
      john = new Serenade.Model(name: 'John', age: 23)
      expect(Object.keys(john)).to.eql(["name", "age"])
      expect(prop for prop of john).to.eql(["name", "age", "id"])

    it 'does not trigger any change events', ->
      nameTriggered = false
      ageTriggered = false

      class Person extends Serenade.Model
        @property "name", async: true
        @property "age"
        @property "nameListener", dependsOn: "name"
        @property "ageListener", dependsOn: "age"

        constructor: ->
          @["~nameListener"].bind -> nameTriggered = true
          @["~ageListener"].bind -> ageTriggered = true
          super

      john = new Person(name: 'John', age: 23)
      expect(nameTriggered).to.be.false
      expect(ageTriggered).to.be.false

    it 'keeps track of constructor values for change events', ->
      class Person extends Serenade.Model
        @property "name"
      john = new Person(name: 'John')
      expect(-> john.name = 'Peter').to.emit(john["~name"], with: ["John", "Peter"])

  describe '.extend', ->
    it 'sets up prototypes correctly', ->
      Test = Serenade.Model.extend()
      test = new Test(foo: 'bar')
      expect(test.foo).to.eql('bar')

    it 'copies over class variables', ->
      Test = Serenade.Model.extend()
      expect(typeof Test.hasMany).to.eql('function')

    it 'runs the provided constructor function', ->
      Test = Serenade.Model.extend(-> @foo = true)
      test = new Test()
      expect(test.foo).to.be.ok

    it 'works with the identity map', ->
      Person = Serenade.Model.extend()
      john1 = new Person(id: 'j123', name: 'John', age: 23)
      john1.test = true
      john2 = new Person(id: 'j123', age: 46)

      expect(john2.test).to.be.ok
      expect(john2.age).to.eql(46)
      expect(john2.name).to.eql('John')

  describe '.uniqueId', ->
    it 'is different for different classes', ->
      Test1 = class Test extends Serenade.Model
      Test2 = class Test extends Serenade.Model
      expect(Test1.uniqueId()).not.to.eql(Test2.uniqueId())

    it 'returns the same results when called multiple times', ->
      Test = class Test extends Serenade.Model
      expect(Test.uniqueId()).to.eql(Test.uniqueId())

    it 'is different for subclasses', ->
      Test1 = class Test extends Serenade.Model
      Test1.uniqueId()
      Test2 = class Test extends Test1
      expect(Test1.uniqueId()).not.to.eql(Test2.uniqueId())

  describe '.find', ->
    it 'creates a new blank object with the given id', ->
      document = Serenade.Model.find('j123')
      expect(document.id).to.eql('j123')

    it 'returns the same object if it has previously been initialized', ->
      john1 = new Serenade.Model(id: 'j123', name: 'John')
      john1.test = true
      john2 = Serenade.Model.find('j123')
      expect(john2.test).to.be.ok
      expect(john2.name).to.eql('John')

  describe '.property', ->
    it 'adds a property to the prototype', ->
      class Person extends Serenade.Model
        @property "name"
      john = new Person(name: "John")
      expect(-> john.name = "Johnny").to.emit john["~name"]

    it 'makes property getters assignable', ->
      class Person extends Serenade.Model
        @property "name"
        @property "loudName"
        loudName: ->
          @name.toUpperCase()
      john = new Person(name: "John")
      expect(john.loudName).to.eql("JOHN")

    it 'adds multiple properties to the prototype', ->
      class Person extends Serenade.Model
        @property "firstName", "lastName"
      john = new Person(firstName: "John", lastName: "Smith")
      expect(-> john.firstName = "Johnny").to.emit john["~firstName"]

    it 'adds multiple properties with options to the prototype', ->
      class Person extends Serenade.Model
        @property "firstName", "lastName", serialize: true
      john = new Person(firstName: "John", lastName: "Smith")
      expect(-> john.firstName = "Johnny").to.emit john["~firstName"]
      expect(john.toJSON().lastName).to.eql("Smith")

    it 'cannot break constructor by declaring a property called `set`', ->
      class Person extends Serenade.Model
        @property "set", value: -> throw new Error("Set was called!")
      new Person(id: "hey", name: "Jonas")
      jonas = new Person(id: "hey", age: 28)
      expect(jonas.name).to.eql("Jonas")
      expect(jonas.age).to.eql(28)

  describe '.event', ->
    it 'adds an event to the prototype', ->
      class Person extends Serenade.Model
        @event "fluctuate"
      john = new Person(name: "John")
      john.fluctuate.bind -> @fluctuated = true
      john.fluctuate.trigger()
      expect(john.fluctuated).to.be.ok

  describe "#id", ->
    it "updates identify map when changed", ->
      class Person extends Serenade.Model
        @property "name"
      person = new Person(id: 5, name: "Nicklas")
      person.id = 10
      expect(person.id).to.eql(10)
      expect(Person.find(5).name).to.eql(undefined)
      expect(Person.find(10).name).to.eql("Nicklas")

  describe "#toString()", ->
    it "returns the model serialized to JSON", ->
      class Person extends Serenade.Model
        @property "name", serialize: true
      person = new Person(id: 5, name: "Nicklas")
      expect(JSON.parse(person.toString()).name).to.eql("Nicklas")

