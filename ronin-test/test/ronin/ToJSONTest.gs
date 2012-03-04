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
  
  static class Recurse {
    var a : Recurse as A
    var b : String as B
    var c : List<Recurse> as C
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
        : ZZZ = "hey",
        : Bar = new() { :A = "stringA", :B = null, :C = 5, :D = 89 }
    }
    Assert.assertEquals("{\"AList\" : [\"a\", \"b\", \"c\"], \"Arr\" : [\"a\", \"b\", \"c\"], \"Bar\" : {\"A\" : \"stringA\", \"C\" : 5, \"D\" : 89, \"IntrinsicType\" : \"ronin.ToJSONTest.Bar\"}, \"IntrinsicType\" : \"ronin.ToJSONTest.Foo\", \"ZZZ\" : \"hey\"}", f.toJSON())
  }

  @Test
  function testDepth() {

    var s = new Recurse(){
      :A = null,
      :B = null
    }
    Assert.assertEquals('{"IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON())
    Assert.assertEquals('{"IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(1))
    Assert.assertEquals('{"IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(2))
    Assert.assertEquals('{"IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(3))

    s.A = new()

    Assert.assertEquals('{"A" : {"IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON())
    Assert.assertEquals('{"IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(1))
    Assert.assertEquals('{"A" : {"IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(2))
    Assert.assertEquals('{"A" : {"IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(3))

    s.A.A = new()

    Assert.assertEquals('{"A" : {"IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON())
    Assert.assertEquals('{"IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(1))
    Assert.assertEquals('{"A" : {"IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(2))
    Assert.assertEquals('{"A" : {"A" : {"IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(3))

    s = new() {
      :A = new() {
        :A = new() {
          :A = new(),
          :B = "Test"
        },
        :B = "Test"
      },
      :B = "Test"
    }
    Assert.assertEquals('{"A" : {"B" : "Test", "IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "B" : "Test", "IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON())
    Assert.assertEquals('{"B" : "Test", "IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(1))
    Assert.assertEquals('{"A" : {"B" : "Test", "IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "B" : "Test", "IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(2))
    Assert.assertEquals('{"A" : {"A" : {"B" : "Test", "IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "B" : "Test", "IntrinsicType" : "ronin.ToJSONTest.Recurse"}, "B" : "Test", "IntrinsicType" : "ronin.ToJSONTest.Recurse"}', s.toJSON(3))
  }
}
