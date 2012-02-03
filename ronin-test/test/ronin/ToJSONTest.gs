package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*
uses java.util.*

class ToJSONTest {
  static class Foo {
    var arr : String[] as Arr
    var aList : List<String> as AList
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
    var f = new Foo() {
        : AList = {"a", "b", "c"},
        : Arr = {"a", "b", "c"},
        : Q = {"today" -> Date.Today, "tomorrow" -> Date.Tomorrow},
        : ZZZ = "hey",
        : Bar = new() { :A = "stringA", :B = null, :C = 5, :D = 89 }
    }
    Assert.assertEquals("{\"AList\" : [\"a\", \"b\", \"c\"], \"Arr\" : [\"a\", \"b\", \"c\"], \"Bar\" : {\"A\" : \"stringA\", \"B\" : null, \"C\" : 5, \"D\" : 89, \"IntrinsicType\" : {}}, \"IntrinsicType\" : {}, \"Q\" : {\"tomorrow\" : \"2012-02-01T00:00:00-08:00\", \"today\" : \"2012-01-31T00:00:00-08:00\"}, \"ZZZ\" : \"hey\"}", f.toJSON())
  }
}
