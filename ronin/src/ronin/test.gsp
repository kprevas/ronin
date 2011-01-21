uses java.lang.Integer
uses java.util.Date
uses java.util.Map

class Foo {
  var q : Map<String, Date> as Q
  var zzz : String as ZZZ
  var bar : Bar as Bar
}

class Bar {
  var a : String as A
  var b : String as B
  var c : int as C
  var d : Integer as D
}

var f = new Foo() {:Q = {"today" -> new Date(), "tomorrow" -> new Date()}, :ZZZ = "hey",
  :Bar = new Bar() {:A = "stringA", :B = "stringB", :C = 5, :D = 89}}
  
print(f typeis Object)
print(f.toJSON())