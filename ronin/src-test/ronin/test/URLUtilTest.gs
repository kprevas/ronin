package ronin.test

uses ronin.*
uses controller.*
uses java.net.URLEncoder
uses java.util.Date
uses org.junit.Assert
uses org.junit.Test

class URLUtilTest {

  @Test
  function testConstructURLWithNoArgs() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/noArgs", URLUtil.urlFor(SimplePassThru#noArgs()))
    }
  }

  @Test
  function testConstructBaseURLNoArgsMethod() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/noArgs", URLUtil.baseUrlFor(SimplePassThru#noArgs()))
    }
  }

  @Test
  function testConstructBaseURLMethodWithArgs() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/multipleArgs", URLUtil.baseUrlFor(SimplePassThru#multipleArgs(String, boolean, int, float, Date)))
    }
  }

  @Test
  function testConstructURLWithOneStringArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/oneStringArg?x=foo", URLUtil.urlFor(SimplePassThru#oneStringArg("foo")))
    }
  }

  @Test
  function testConstructURLWithOneBooleanArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/oneBooleanArg?x=true", URLUtil.urlFor(SimplePassThru#oneBooleanArg(true)))
    }
  }

  @Test
  function testConstructURLWithOneIntegerArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/oneIntegerArg?x=7", URLUtil.urlFor(SimplePassThru#oneIntegerArg(7)))
    }
  }
  
  @Test
  function testConstructURLWithOneFloatArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/oneFloatArg?x=3.14", URLUtil.urlFor(SimplePassThru#oneFloatArg(3.14 as float)))
    }
  }

  @Test
  function testConstructURLWithOneDateArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      var date = new Date()
      Assert.assertEquals("http://localhost/SimplePassThru/oneDateArg?x=${URLEncoder.encode(date as String)}", URLUtil.urlFor(SimplePassThru#oneDateArg(date)))
    }
  }

  @Test
  function testConstructURLWithStringArrayArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/oneStringArrayArg?x[0]=foo&x[1]=bar", URLUtil.urlFor(SimplePassThru#oneStringArrayArg({"foo", "bar"})))
    }
  }

  @Test
  function testConstructURLWithDateArrayArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      var date1 = new Date()
      var date2 = new Date()
      date2.setMonth(2)
      Assert.assertEquals("http://localhost/SimplePassThru/oneDateArrayArg?x[0]=${URLEncoder.encode(date1 as String)}&x[1]=${URLEncoder.encode(date2 as String)}", URLUtil.urlFor(SimplePassThru#oneDateArrayArg({date1, date2})))
    }
  }
  
  @Test
  function testConstructURLWithMultipleArgs() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      var date = new Date()
      Assert.assertEquals("http://localhost/SimplePassThru/multipleArgs?a=foo&b=true&c=7&d=3.14&e=${URLEncoder.encode(date as String)}", URLUtil.urlFor(SimplePassThru#multipleArgs("foo", true, 7, 3.14 as float, date)))
    }
  }
  
  @Test
  function testContructURLWithToIDableObjectArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      var x = new ParamObj() {:propA = "foo", :propB = true, :propC = 7}
      Assert.assertEquals("http://localhost/SimplePassThru/stringProperty?x=foo", URLUtil.urlFor(SimplePassThru#stringProperty(x)))
    }
  }

  @Test
  function testContructURLWithToIDableObjectArrayArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      var x = new ParamObj() {:propA = "foo", :propB = true, :propC = 7}
      var y = new ParamObj() {:propA = "bar", :propB = false, :propC = 53}
      Assert.assertEquals("http://localhost/SimplePassThru/stringPropertyFromArrayIndexZero?x[0]=foo&x[1]=bar", URLUtil.urlFor(SimplePassThru#stringPropertyFromArrayIndexZero({x, y})))
    }
  }

}
