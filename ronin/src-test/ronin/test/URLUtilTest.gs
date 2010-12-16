package ronin.test

uses ronin.*
uses controller.SimplePassThru
uses java.net.URLEncoder
uses org.junit.Assert
uses org.junit.Test

class URLUtilTest {

  @Test
  function testConstructURLWithNoArgs() {
      Assert.assertEquals("http://localhost/SimplePassThru/noArgs", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("noArgs", {})})))
  }

  @Test
  function testConstructBaseURL() {
      Assert.assertEquals("http://localhost/SimplePassThru/noArgs", URLUtil.baseUrlFor(SimplePassThru.Type.TypeInfo.getMethod("noArgs", {})))
  }

  @Test
  function testConstructURLWithOneStringArg() {
      Assert.assertEquals("http://localhost/SimplePassThru/oneStringArg?x=foo", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("oneStringArg", {String}), "foo"})))
  }

  @Test
  function testConstructURLWithOneBooleanArg() {
      Assert.assertEquals("http://localhost/SimplePassThru/oneBooleanArg?x=true", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("oneBooleanArg", {boolean}), true})))
  }

  @Test
  function testConstructURLWithOneIntegerArg() {
      Assert.assertEquals("http://localhost/SimplePassThru/oneIntegerArg?x=7", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("oneIntegerArg", {int}), 7})))
  }
  
  @Test
  function testConstructURLWithOneFloatArg() {
      Assert.assertEquals("http://localhost/SimplePassThru/oneFloatArg?x=3.14", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("oneFloatArg", {float}), 3.14 as float})))
  }

  @Test
  function testConstructURLWithOneDateArg() {
      var date = new java.util.Date()
      Assert.assertEquals("http://localhost/SimplePassThru/oneDateArg?x=${URLEncoder.encode(date as String)}", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("oneDateArg", {java.util.Date}), date})))
  }

  @Test
  function testConstructURLWithStringArrayArg() {
      Assert.assertEquals("http://localhost/SimplePassThru/oneStringArrayArg?x[0]=foo&x[1]=bar", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("oneStringArrayArg", {String[]}), {"foo", "bar"}.toTypedArray()})))
  }

  @Test
  function testConstructURLWithDateArrayArg() {
      var date1 = new java.util.Date()
      var date2 = new java.util.Date()
      date2.setMonth( 2 )
      Assert.assertEquals("http://localhost/SimplePassThru/oneDateArrayArg?x[0]=${URLEncoder.encode(date1 as String)}&x[1]=${URLEncoder.encode(date2 as String)}", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("oneDateArrayArg", {java.util.Date[]}), {date1, date2}.toTypedArray()})))
  }
  
  @Test
  function testConstructURLWithMultipleArgs() {
      var date = new java.util.Date()
      Assert.assertEquals("http://localhost/SimplePassThru/multipleArgs?a=foo&b=true&c=7&d=3.14&e=${URLEncoder.encode(date as String)}", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("multipleArgs", {String, boolean, int, float, java.util.Date}), "foo", true, 7, 3.14 as float, date})))
  }
  
  @Test
  function testContructURLWithToIDableObjectArg() {
      var x = new SimplePassThru.Inner() {:propA = "foo", :propB = true, :propC = 7}
      Assert.assertEquals("http://localhost/SimplePassThru/stringProperty?x=foo", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("stringProperty", {x.IntrinsicType}), x})))
  }

  @Test
  function testContructURLWithToIDableObjectArrayArg() {
      var x = new SimplePassThru.Inner() {:propA = "foo", :propB = true, :propC = 7}
      var y = new SimplePassThru.Inner() {:propA = "bar", :propB = false, :propC = 53}
      Assert.assertEquals("http://localhost/SimplePassThru/stringPropertyFromArrayIndexZero?x[0]=foo&x[1]=bar", URLUtil.urlFor(URLUtil.makeURLBlock({SimplePassThru.Type.TypeInfo.getMethod("stringPropertyFromArrayIndexZero", {x.IntrinsicType.ArrayType}), {x, y}.toTypedArray()})))
  }

}
