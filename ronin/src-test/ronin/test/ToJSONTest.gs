package ronin.test

uses java.lang.Integer
uses java.util.Date
uses java.util.Map
uses org.junit.*

class toJSONTest {
  static class Foo {
    var q : Map<String, Date> as Q
    var zzz : String as ZZZ
    var bar : Bar as Bar
  }

  static class Bar {
    var a : String as A
    var b : String as B
    var c : int as C
    var d : Integer as D
  }

  @Test
  function testJavaObjectToJSON() {
    Assert.assertEquals("\"foo\"", "foo".toJSON())
  }

/* TODO https://github.com/gosu-lang/gosu/issues#issue/50
  @Test
  function testGosuObjectToJSON() {
    var f = new Foo() {:Q = {"today" -> new Date(), "tomorrow" -> new Date()}, :ZZZ = "hey",
      :Bar = new Bar() {:A = "stringA", :B = "stringB", :C = 5, :D = 89}}
    Assert.assertEquals("", f.toJSON())
  }
*/
}
