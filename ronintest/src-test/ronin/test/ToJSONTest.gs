package ronin.test

uses java.lang.Integer
uses java.util.Date
uses java.util.Map
uses org.junit.*

class ToJSONTest {
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

  @Test
  function testGosuObjectToJSON() {
    var f = new Foo() {:Q = {"today" -> Date.Today, "tomorrow" -> Date.Tomorrow}, :ZZZ = "hey",
      :Bar = new Bar() {:A = "stringA", :B = null, :C = 5, :D = 89}}
    Assert.assertEquals("{\"class\":\"class ronin.test.ToJSONTest.Foo\",\"Q\":{\"tomorrow\":${Date.Tomorrow.toJSON()},\"today\":${Date.Today.toJSON()}},\"ZZZ\":\"hey\",\"Bar\":{\"class\":\"class ronin.test.ToJSONTest.Bar\",\"A\":\"stringA\",\"B\":null,\"C\":5,\"D\":89}}",
// TODO https://github.com/gosu-lang/gosu/issues#issue/50
      (f as Object).toJSON())
  }

}
