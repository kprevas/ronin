package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*
class ControllerDispatchTest {

  @Test
  function testNoArgDispatch() {
    var resp = RoninTest.get("/SimplePassThru/noArgs")
    Assert.assertEquals("no arg view", resp.WriterBuffer.toString())
  }
  
  @Test
  function testOneStringArgDispatch() {
    var resp = RoninTest.get("/SimplePassThru/oneStringArg?x=foo")
    Assert.assertEquals("foo", resp.WriterBuffer.toString())
  }
  
  @Test
  function testOneStringArgWithEscapedURLCharactersDispatch() {
    var resp = RoninTest.get("/SimplePassThru/oneStringArg?x=foo%20bar")
    Assert.assertEquals("foo bar", resp.WriterBuffer.toString())
  }

  @Test
  function testOneBooleanArgDispatch() {
    var resp = RoninTest.get("/SimplePassThru/oneBooleanArg?x=true")
    Assert.assertEquals("true false", resp.WriterBuffer.toString())
  }

  @Test
  function testOneIntegerArgDispatch() {
    var resp = RoninTest.get("/SimplePassThru/oneIntegerArg?x=27")
    Assert.assertEquals("27 28", resp.WriterBuffer.toString())
  }

  @Test
  function testOneFloatArgDispatch() {
    var resp = RoninTest.get("/SimplePassThru/oneFloatArg?x=3.14")
    Assert.assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
  }
  
  @Test
  function testOneDateArgDispatch() {
    var resp = RoninTest.get("/SimplePassThru/oneDateArg?x=12/19/1979")
    Assert.assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
  }
  
  @Test
  function testOneStringArrayArgDispatch() {
    var resp = RoninTest.get("/SimplePassThru/oneStringArrayArg?x[0]=zero&x[1]=one&x[2]=two")
    Assert.assertEquals("zero one two ", resp.WriterBuffer.toString())
  }
  
  @Test
  function testOneDateArrayArgDispatch() {
    var resp = RoninTest.get("/SimplePassThru/oneDateArrayArg?x[0]=12/19/1979&x[1]=2/22/1982&x[2]=1/20/1984&x[3]=4/2/1993")
    Assert.assertEquals("true false false false ", resp.WriterBuffer.toString())
  }
  
  @Test
  function testNullsFilledInForMissingArrayValues() {
    var resp = RoninTest.get("/SimplePassThru/oneStringArrayArg?x[0]=zero&x[2]=two")
    Assert.assertEquals("zero null two ", resp.WriterBuffer.toString())
  }
  
  @Test
  function testMultipleArgDispatch() {
    var resp = RoninTest.get("/SimplePassThru/multipleArgs?a=foo&b=true&c=5&d=4.18&e=7/11/1980")
    Assert.assertEquals("foo true 5 4.18 7/11/1980", resp.WriterBuffer.toString())
  }

  @Test
  function testStringPropertyDispatch() {
    var resp = RoninTest.get("/SimplePassThru/stringProperty?x.propA=foo")
    Assert.assertEquals("foo", resp.WriterBuffer.toString())
  }
  
  @Test
  function testBooleanPropertyDispatch() {
    var resp = RoninTest.get("/SimplePassThru/booleanProperty?x.propB=true")
    Assert.assertEquals("true false", resp.WriterBuffer.toString())
  }

  @Test
  function testIntegerPropertyDispatch() {
    var resp = RoninTest.get("/SimplePassThru/intProperty?x.propC=27")
    Assert.assertEquals("27 28", resp.WriterBuffer.toString())
  }

  @Test
  function testFloatPropertyDispatch() {
    var resp = RoninTest.get("/SimplePassThru/floatProperty?x.propD=3.14")
    Assert.assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
  }
  
  @Test
  function testDatePropertyDispatch() {
    var resp = RoninTest.get("/SimplePassThru/dateProperty?x.propE=12/19/1979")
    Assert.assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
  }
  
  @Test
  function testImplicitObjectFetchDispatch() {
    var resp = RoninTest.get("/SimplePassThru/stringProperty?x=foo")
    Assert.assertEquals("object foo", resp.WriterBuffer.toString())
  }
  
  @Test
  function testStringPropertyDispatchFromObjectArray() {
    var resp = RoninTest.get("/SimplePassThru/stringPropertyFromArrayIndexZero?x[0].propA=foo")
    Assert.assertEquals("foo", resp.WriterBuffer.toString())
  }
  
  @Test
  function testBooleanPropertyDispatchFromObjectArray() {
    var resp = RoninTest.get("/SimplePassThru/booleanPropertyFromArrayIndexZero?x[0].propB=true&x[1].propB=false")
    Assert.assertEquals("true false", resp.WriterBuffer.toString())
    resp = RoninTest.get("/SimplePassThru/booleanPropertyFromArrayIndexOne?x[0].propB=false&x[1].propB=true")
    Assert.assertEquals("true false", resp.WriterBuffer.toString())
  }

  @Test
  function testIntegerPropertyDispatchFromObjectArray() {
    var resp = RoninTest.get("/SimplePassThru/intPropertyFromArrayIndexZero?x[0].propC=27&x[1].propC=48")
    Assert.assertEquals("27 28", resp.WriterBuffer.toString())
    resp = RoninTest.get("/SimplePassThru/intPropertyFromArrayIndexOne?x[0].propC=48&x[1].propC=27")
    Assert.assertEquals("27 28", resp.WriterBuffer.toString())
  }

  @Test
  function testFloatPropertyDispatchFromObjectArray() {
    var resp = RoninTest.get("/SimplePassThru/floatPropertyFromArrayIndexZero?x[0].propD=3.14&x[1].propD=5.94")
    Assert.assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
    resp = RoninTest.get("/SimplePassThru/floatPropertyFromArrayIndexOne?x[0].propD=5.94&x[1].propD=3.14")
    Assert.assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
  }
  
  @Test
  function testDatePropertyDispatchFromObjectArray() {
    var resp = RoninTest.get("/SimplePassThru/datePropertyFromArrayIndexZero?x[0].propE=12/19/1979&x[1].propE=7/11/1980")
    Assert.assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
    resp = RoninTest.get("/SimplePassThru/datePropertyFromArrayIndexOne?x[0].propE=7/11/1980&x[1].propE=12/19/1979")
    Assert.assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
  }
  
  @Test
  function testOneStringArgDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/oneStringArg", "{\"x\":\"foo\"}", "text/json")
    Assert.assertEquals("foo", resp.WriterBuffer.toString())
  }
  
  @Test
  function testOneBooleanArgDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/oneBooleanArg", "{\"x\":true}", "text/json")
    Assert.assertEquals("true false", resp.WriterBuffer.toString())
  }

  @Test
  function testOneIntegerArgDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/oneIntegerArg", "{\"x\":27}", "text/json")
    Assert.assertEquals("27 28", resp.WriterBuffer.toString())
  }

  @Test
  function testOneFloatArgDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/oneFloatArg", "{\"x\":3.14}", "text/json")
    Assert.assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
  }
  
  @Test
  function testOneDateArgDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/oneDateArg", "{\"x\":\"12/19/1979\"}", "text/json")
    Assert.assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
  }
  
  @Test
  function testOneStringArrayArgDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/oneStringArrayArg", "{\"x\":[\"zero\",\"one\",\"two\"]}", "text/json")
    Assert.assertEquals("zero one two ", resp.WriterBuffer.toString())
  }
  
  @Test
  function testOneDateArrayArgDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/oneDateArrayArg", "{\"x\":[\"12/19/1979\",\"2/22/1982\",\"1/20/1984\",\"4/2/1993\"]}", "text/json")
    Assert.assertEquals("true false false false ", resp.WriterBuffer.toString())
  }
  
  @Test
  function testMultipleArgDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/multipleArgs", "{\"a\":\"foo\",\"b\":true,\"c\":5,\"d\":4.18,\"e\":\"7/11/1980\"}", "text/json")
    Assert.assertEquals("foo true 5 4.18 7/11/1980", resp.WriterBuffer.toString())
  }

  @Test
  function testStringPropertyDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/stringProperty", "{\"x\":{\"propA\":\"foo\"}}", "text/json")
    Assert.assertEquals("foo", resp.WriterBuffer.toString())
  }
  
  @Test
  function testBooleanPropertyDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/booleanProperty", "{\"x\":{\"propB\":true}}", "text/json")
    Assert.assertEquals("true false", resp.WriterBuffer.toString())
  }

  @Test
  function testIntegerPropertyDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/intProperty", "{\"x\":{\"propC\":27}}", "text/json")
    Assert.assertEquals("27 28", resp.WriterBuffer.toString())
  }

  @Test
  function testFloatPropertyDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/floatProperty", "{\"x\":{\"propD\":3.14}}", "text/json")
    Assert.assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
  }
  
  @Test
  function testDatePropertyDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/dateProperty", "{\"x\":{\"propE\":\"12/19/1979\"}}", "text/json")
    Assert.assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
  }
  
  @Test
  function testImplicitObjectFetchDispatchJson() {
    var resp = RoninTest.post("/SimplePassThru/stringProperty", "{\"x\":{\"fromID\":\"foo\"}}", "text/json")
    Assert.assertEquals("object foo", resp.WriterBuffer.toString())
  }
  
  @Test
  function testStringPropertyDispatchFromObjectArrayJson() {
    var resp = RoninTest.post("/SimplePassThru/stringPropertyFromArrayIndexZero", "{\"x\":[{\"propA\":\"foo\"}]}", "text/json")
    Assert.assertEquals("foo", resp.WriterBuffer.toString())
  }
  
  @Test
  function testBooleanPropertyDispatchFromObjectArrayJson() {
    var resp = RoninTest.post("/SimplePassThru/booleanPropertyFromArrayIndexZero", "{\"x\":[{\"propB\":true}, {\"propB\":false}]}", "text/json")
    Assert.assertEquals("true false", resp.WriterBuffer.toString())
    resp = RoninTest.post("/SimplePassThru/booleanPropertyFromArrayIndexOne", "{\"x\":[{\"propB\":false}, {\"propB\":true}]}", "text/json")
    Assert.assertEquals("true false", resp.WriterBuffer.toString())
  }

  @Test
  function testIntegerPropertyDispatchFromObjectArrayJson() {
    var resp = RoninTest.post("/SimplePassThru/intPropertyFromArrayIndexZero", "{\"x\":[{\"propC\":27}, {\"propC\":48}]}", "text/json")
    Assert.assertEquals("27 28", resp.WriterBuffer.toString())
    resp = RoninTest.post("/SimplePassThru/intPropertyFromArrayIndexOne", "{\"x\":[{\"propC\":48}, {\"propC\":27}]}", "text/json")
    Assert.assertEquals("27 28", resp.WriterBuffer.toString())
  }

  @Test
  function testFloatPropertyDispatchFromObjectArrayJson() {
    var resp = RoninTest.post("/SimplePassThru/floatPropertyFromArrayIndexZero", "{\"x\":[{\"propD\":3.14}, {\"propD\":5.94}]}", "text/json")
    Assert.assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
    resp = RoninTest.post("/SimplePassThru/floatPropertyFromArrayIndexOne", "{\"x\":[{\"propD\":5.94}, {\"propD\":3.14}]}", "text/json")
    Assert.assertEquals("3.14 4.1400003", resp.WriterBuffer.toString())
  }
  
  @Test
  function testDatePropertyDispatchFromObjectArrayJson() {
    var resp = RoninTest.post("/SimplePassThru/datePropertyFromArrayIndexZero", "{\"x\":[{\"propE\":\"12/19/1979\"}, {\"propE\":\"7/11/1980\"}]}", "text/json")
    Assert.assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
    resp = RoninTest.post("/SimplePassThru/datePropertyFromArrayIndexOne", "{\"x\":[{\"propE\":\"7/11/1980\"}, {\"propE\":\"12/19/1979\"}]}", "text/json")
    Assert.assertEquals("12/19/1979 true", resp.WriterBuffer.toString())
  }

  @Test
  function testDeepJson() {
    var resp = RoninTest.post("/SimplePassThru/recursiveProperty", "{\"x\":{\"propG\": {\"propG\": {\"propA\":\"foo\"}}}}", "text/json")
    Assert.assertEquals("foo", resp.WriterBuffer.toString())
  }
  
  @Test
  function testDeepJsonWithFactoryMethod() {
    var resp = RoninTest.post("/SimplePassThru/recursiveProperty", "{\"x\":{\"propG\": {\"propG\": {\"fromID\":\"foo\"}}}}", "text/json")
    Assert.assertEquals("object foo", resp.WriterBuffer.toString())
  }

}