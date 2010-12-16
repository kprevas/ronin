package ronin.test

uses ronin.*
uses controller.SimplePassThru
uses java.net.URLEncoder
uses org.junit.Assert
uses org.junit.Test

class RoninTemplateTest {

  @Test
  function testConstructURLWithNoArgs() {
      Assert.assertEquals("http://localhost/SimplePassThru/noArgs", RoninTemplate.urlFor(\ -> SimplePassThru.noArgs()))
  }

  @Test
  function testConstructBaseURL() {
      Assert.assertEquals("http://localhost/SimplePassThru/noArgs", RoninTemplate.postUrlFor(SimplePassThru.Type.TypeInfo.getMethod("noArgs", {})))
  }

  @Test
  function testConstructURLWithOneStringArg() {
      Assert.assertEquals("http://localhost/SimplePassThru/oneStringArg?x=foo", RoninTemplate.urlFor(\ -> SimplePassThru.oneStringArg("foo")))
  }

  @Test
  function testConstructURLWithOneBooleanArg() {
      Assert.assertEquals("http://localhost/SimplePassThru/oneBooleanArg?x=true", RoninTemplate.urlFor(\ -> SimplePassThru.oneBooleanArg(true)))
  }

  @Test
  function testConstructURLWithOneIntegerArg() {
      Assert.assertEquals("http://localhost/SimplePassThru/oneIntegerArg?x=7", RoninTemplate.urlFor(\ -> SimplePassThru.oneIntegerArg(7)))
  }

  @Test
  function testConstructURLWithOneFloatArg() {
      Assert.assertEquals("http://localhost/SimplePassThru/oneFloatArg?x=3.14", RoninTemplate.urlFor(\ -> SimplePassThru.oneFloatArg(3.14 as float)))
  }

  @Test
  function testConstructURLWithOneDateArg() {
      var date = new java.util.Date()
      Assert.assertEquals("http://localhost/SimplePassThru/oneDateArg?x=${URLEncoder.encode(date as String)}", RoninTemplate.urlFor(\ -> SimplePassThru.oneDateArg(date)))
  }

  @Test
  function testConstructURLWithStringArrayArg() {
      Assert.assertEquals("http://localhost/SimplePassThru/oneStringArrayArg?x[0]=foo&x[1]=bar", RoninTemplate.urlFor(\ -> SimplePassThru.oneStringArrayArg({"foo", "bar"})))
  }

  @Test
  function testConstructURLWithDateArrayArg() {
      var date1 = new java.util.Date()
      var date2 = new java.util.Date()
      date2.setMonth( 2 )
      Assert.assertEquals("http://localhost/SimplePassThru/oneDateArrayArg?x[0]=${URLEncoder.encode(date1 as String)}&x[1]=${URLEncoder.encode(date2 as String)}", RoninTemplate.urlFor(\ -> SimplePassThru.oneDateArrayArg({date1, date2})))
  }
  
  @Test
  function testConstructURLWithMultipleArgs() {
      var date = new java.util.Date()
      Assert.assertEquals("http://localhost/SimplePassThru/multipleArgs?a=foo&b=true&c=7&d=3.14&e=${URLEncoder.encode(date as String)}", RoninTemplate.urlFor(\ -> SimplePassThru.multipleArgs("foo", true, 7, 3.14 as float, date)))
  }
  
  @Test
  function testConstructURLWithToIDableObjectArg() {
      var x = new SimplePassThru.Inner() {:propA = "foo", :propB = true, :propC = 7}
      Assert.assertEquals("http://localhost/SimplePassThru/stringProperty?x=foo", RoninTemplate.urlFor(\ -> SimplePassThru.stringProperty(x)))
  }

  @Test
  function testConstructURLWithToIDableObjectArrayArg() {
      var x = new SimplePassThru.Inner() {:propA = "foo", :propB = true, :propC = 7}
      var y = new SimplePassThru.Inner() {:propA = "bar", :propB = false, :propC = 53}
      Assert.assertEquals("http://localhost/SimplePassThru/stringPropertyFromArrayIndexZero?x[0]=foo&x[1]=bar", RoninTemplate.urlFor(\ -> SimplePassThru.stringPropertyFromArrayIndexZero({x, y})))
  }

}
