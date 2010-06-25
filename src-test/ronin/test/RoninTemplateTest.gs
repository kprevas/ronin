package gw.ronintest

uses ronin.*
uses controller.SimplePassThru

class RoninTemplateTest extends RoninTest {

  function testConstructURLWithNoArgs() {
      assertEquals("http://localhost/SimplePassThru/noArgs", RoninTemplate.urlFor(\ -> SimplePassThru.noArgs()))
  }

  function testConstructBaseURL() {
      assertEquals("http://localhost/SimplePassThru/noArgs", RoninTemplate.postUrlFor(SimplePassThru.Type.TypeInfo.getMethod("noArgs", {})))
  }

  function testConstructURLWithOneStringArg() {
      assertEquals("http://localhost/SimplePassThru/oneStringArg?x=foo", RoninTemplate.urlFor(\ -> SimplePassThru.oneStringArg("foo")))
  }

  function testConstructURLWithOneBooleanArg() {
      assertEquals("http://localhost/SimplePassThru/oneBooleanArg?x=true", RoninTemplate.urlFor(\ -> SimplePassThru.oneBooleanArg(true)))
  }

  function testConstructURLWithOneIntegerArg() {
      assertEquals("http://localhost/SimplePassThru/oneIntegerArg?x=7", RoninTemplate.urlFor(\ -> SimplePassThru.oneIntegerArg(7)))
  }

  function testConstructURLWithOneFloatArg() {
      assertEquals("http://localhost/SimplePassThru/oneFloatArg?x=3.14", RoninTemplate.urlFor(\ -> SimplePassThru.oneFloatArg(3.14 as float)))
  }

  function testConstructURLWithOneDateArg() {
      var date = new java.util.Date()
      assertEquals("http://localhost/SimplePassThru/oneDateArg?x=${date as String}", RoninTemplate.urlFor(\ -> SimplePassThru.oneDateArg(date)))
  }

  function testConstructURLWithStringArrayArg() {
      assertEquals("http://localhost/SimplePassThru/oneStringArrayArg?x[0]=foo&x[1]=bar", RoninTemplate.urlFor(\ -> SimplePassThru.oneStringArrayArg({"foo", "bar"})))
  }

  function testConstructURLWithDateArrayArg() {
      var date1 = new java.util.Date()
      var date2 = new java.util.Date()
      date2.setMonth( 2 )
      assertEquals("http://localhost/SimplePassThru/oneDateArrayArg?x[0]=${date1 as String}&x[1]=${date2 as String}", RoninTemplate.urlFor(\ -> SimplePassThru.oneDateArrayArg({date1, date2})))
  }
  
  function testConstructURLWithMultipleArgs() {
      var date = new java.util.Date()
      assertEquals("http://localhost/SimplePassThru/multipleArgs?a=foo&b=true&c=7&d=3.14&e=${date as String}", RoninTemplate.urlFor(\ -> SimplePassThru.multipleArgs("foo", true, 7, 3.14 as float, date)))
  }
  
  function testContructURLWithToIDableObjectArg() {
      var x = new SimplePassThru.Inner() {:propA = "foo", :propB = true, :propC = 7}
      assertEquals("http://localhost/SimplePassThru/stringProperty?x=foo", RoninTemplate.urlFor(\ -> SimplePassThru.stringProperty(x)))
  }

  function testContructURLWithToIDableObjectArrayArg() {
      var x = new SimplePassThru.Inner() {:propA = "foo", :propB = true, :propC = 7}
      var y = new SimplePassThru.Inner() {:propA = "bar", :propB = false, :propC = 53}
      assertEquals("http://localhost/SimplePassThru/stringPropertyFromArrayIndexZero?x[0]=foo&x[1]=bar", RoninTemplate.urlFor(\ -> SimplePassThru.stringPropertyFromArrayIndexZero({x, y})))
  }

}
