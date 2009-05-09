package gw.simplewebtest

uses gw.simpleweb.*
uses controller.SimplePassThru

class URLUtilTest extends SimpleWebTest {

  function testConstructURLWithNoArgs() {
      assertEquals("http://localhost/SimplePassThru/noArgs", URLUtil.urlFor(\ -> SimplePassThru.noArgs()))
  }

  function testConstructBaseURL() {
      assertEquals("http://localhost/SimplePassThru/noArgs", URLUtil.baseUrlFor(SimplePassThru.Type.TypeInfo.getMethod("noArgs", {})))
  }

  function testConstructURLWithOneStringArg() {
      assertEquals("http://localhost/SimplePassThru/oneStringArg?x=foo", URLUtil.urlFor(\ -> SimplePassThru.oneStringArg("foo")))
  }

  function testConstructURLWithOneBooleanArg() {
      assertEquals("http://localhost/SimplePassThru/oneBooleanArg?x=true", URLUtil.urlFor(\ -> SimplePassThru.oneBooleanArg(true)))
  }

  function testConstructURLWithOneIntegerArg() {
      assertEquals("http://localhost/SimplePassThru/oneIntegerArg?x=7", URLUtil.urlFor(\ -> SimplePassThru.oneIntegerArg(7)))
  }

  function testConstructURLWithOneFloatArg() {
      assertEquals("http://localhost/SimplePassThru/oneFloatArg?x=3.14", URLUtil.urlFor(\ -> SimplePassThru.oneFloatArg(3.14)))
  }

  function testConstructURLWithOneDateArg() {
      var date = new java.util.Date()
      assertEquals("http://localhost/SimplePassThru/oneDateArg?x=${date as String}", URLUtil.urlFor(\ -> SimplePassThru.oneDateArg(date)))
  }

  function testConstructURLWithStringArrayArg() {
      assertEquals("http://localhost/SimplePassThru/oneStringArrayArg?x[0]=foo&x[1]=bar", URLUtil.urlFor(\ -> SimplePassThru.oneStringArrayArg({"foo", "bar"})))
  }

  function testConstructURLWithDateArrayArg() {
      var date1 = new java.util.Date()
      var date2 = new java.util.Date()
      date2.setMonth( 2 )
      assertEquals("http://localhost/SimplePassThru/oneDateArrayArg?x[0]=${date1 as String}&x[1]=${date2 as String}", URLUtil.urlFor(\ -> SimplePassThru.oneDateArrayArg({date1, date2})))
  }
  
  function testConstructURLWithMultipleArgs() {
      var date = new java.util.Date()
      assertEquals("http://localhost/SimplePassThru/multipleArgs?a=foo&b=true&c=7&d=3.14&e=${date as String}", URLUtil.urlFor(\ -> SimplePassThru.multipleArgs("foo", true, 7, 3.14, date)))
  }
  
  function testContructURLWithToIDableObjectArg() {
      var x = new SimplePassThru.Inner() {:propA = "foo", :propB = true, :propC = 7}
      assertEquals("http://localhost/SimplePassThru/stringProperty?x=foo", URLUtil.urlFor(\ -> SimplePassThru.stringProperty(x)))
  }

  function testContructURLWithToIDableObjectArrayArg() {
      var x = new SimplePassThru.Inner() {:propA = "foo", :propB = true, :propC = 7}
      var y = new SimplePassThru.Inner() {:propA = "bar", :propB = false, :propC = 53}
      assertEquals("http://localhost/SimplePassThru/stringPropertyFromArrayIndexZero?x[0]=foo&x[1]=bar", URLUtil.urlFor(\ -> SimplePassThru.stringPropertyFromArrayIndexZero({x, y})))
  }

}
