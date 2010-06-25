package gw.simplewebtest

uses ronin.*
uses controller.SimplePassThru

class SimpleWebTemplateTest extends SimpleWebTest {

  function testConstructURLWithNoArgs() {
      assertEquals("http://localhost/SimplePassThru/noArgs", SimpleWebTemplate.urlFor(\ -> SimplePassThru.noArgs()))
  }

  function testConstructBaseURL() {
      assertEquals("http://localhost/SimplePassThru/noArgs", SimpleWebTemplate.postUrlFor(SimplePassThru.Type.TypeInfo.getMethod("noArgs", {})))
  }

  function testConstructURLWithOneStringArg() {
      assertEquals("http://localhost/SimplePassThru/oneStringArg?x=foo", SimpleWebTemplate.urlFor(\ -> SimplePassThru.oneStringArg("foo")))
  }

  function testConstructURLWithOneBooleanArg() {
      assertEquals("http://localhost/SimplePassThru/oneBooleanArg?x=true", SimpleWebTemplate.urlFor(\ -> SimplePassThru.oneBooleanArg(true)))
  }

  function testConstructURLWithOneIntegerArg() {
      assertEquals("http://localhost/SimplePassThru/oneIntegerArg?x=7", SimpleWebTemplate.urlFor(\ -> SimplePassThru.oneIntegerArg(7)))
  }

  function testConstructURLWithOneFloatArg() {
      assertEquals("http://localhost/SimplePassThru/oneFloatArg?x=3.14", SimpleWebTemplate.urlFor(\ -> SimplePassThru.oneFloatArg(3.14 as float)))
  }

  function testConstructURLWithOneDateArg() {
      var date = new java.util.Date()
      assertEquals("http://localhost/SimplePassThru/oneDateArg?x=${date as String}", SimpleWebTemplate.urlFor(\ -> SimplePassThru.oneDateArg(date)))
  }

  function testConstructURLWithStringArrayArg() {
      assertEquals("http://localhost/SimplePassThru/oneStringArrayArg?x[0]=foo&x[1]=bar", SimpleWebTemplate.urlFor(\ -> SimplePassThru.oneStringArrayArg({"foo", "bar"})))
  }

  function testConstructURLWithDateArrayArg() {
      var date1 = new java.util.Date()
      var date2 = new java.util.Date()
      date2.setMonth( 2 )
      assertEquals("http://localhost/SimplePassThru/oneDateArrayArg?x[0]=${date1 as String}&x[1]=${date2 as String}", SimpleWebTemplate.urlFor(\ -> SimplePassThru.oneDateArrayArg({date1, date2})))
  }
  
  function testConstructURLWithMultipleArgs() {
      var date = new java.util.Date()
      assertEquals("http://localhost/SimplePassThru/multipleArgs?a=foo&b=true&c=7&d=3.14&e=${date as String}", SimpleWebTemplate.urlFor(\ -> SimplePassThru.multipleArgs("foo", true, 7, 3.14 as float, date)))
  }
  
  function testContructURLWithToIDableObjectArg() {
      var x = new SimplePassThru.Inner() {:propA = "foo", :propB = true, :propC = 7}
      assertEquals("http://localhost/SimplePassThru/stringProperty?x=foo", SimpleWebTemplate.urlFor(\ -> SimplePassThru.stringProperty(x)))
  }

  function testContructURLWithToIDableObjectArrayArg() {
      var x = new SimplePassThru.Inner() {:propA = "foo", :propB = true, :propC = 7}
      var y = new SimplePassThru.Inner() {:propA = "bar", :propB = false, :propC = 53}
      assertEquals("http://localhost/SimplePassThru/stringPropertyFromArrayIndexZero?x[0]=foo&x[1]=bar", SimpleWebTemplate.urlFor(\ -> SimplePassThru.stringPropertyFromArrayIndexZero({x, y})))
  }

}
