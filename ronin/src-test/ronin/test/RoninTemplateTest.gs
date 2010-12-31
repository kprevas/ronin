package ronin.test

uses ronin.*
uses controller.*
uses java.net.URLEncoder
uses java.util.Date
uses org.junit.Assert
uses org.junit.Test

class RoninTemplateTest {

  @Test
  function testConstructURLWithNoArgs() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/noArgs", RoninTemplate.urlFor(SimplePassThru#noArgs()))
    }
  }

  @Test
  function testConstructBaseURLNoArgsMethod() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/noArgs", RoninTemplate.postUrlFor(SimplePassThru#noArgs()))
    }
  }

  @Test
  function testConstructBaseURLMethodWithArgs() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/multipleArgs", RoninTemplate.postUrlFor(SimplePassThru#multipleArgs(String, boolean, int, float, Date)))
    }
  }

  @Test
  function testConstructURLWithOneStringArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/oneStringArg?x=foo", RoninTemplate.urlFor(SimplePassThru#oneStringArg("foo")))
    }
  }

  @Test
  function testConstructURLWithOneBooleanArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/oneBooleanArg?x=true", RoninTemplate.urlFor(SimplePassThru#oneBooleanArg(true)))
    }
  }

  @Test
  function testConstructURLWithOneIntegerArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/oneIntegerArg?x=7", RoninTemplate.urlFor(SimplePassThru#oneIntegerArg(7)))
    }
  }

  @Test
  function testConstructURLWithOneFloatArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/oneFloatArg?x=3.14", RoninTemplate.urlFor(SimplePassThru#oneFloatArg(3.14 as float)))
    }
  }

  @Test
  function testConstructURLWithOneDateArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      var date = new Date()
      Assert.assertEquals("http://localhost/SimplePassThru/oneDateArg?x=${URLEncoder.encode(date as String)}", RoninTemplate.urlFor(SimplePassThru#oneDateArg(date)))
    }
  }

  @Test
  function testConstructURLWithStringArrayArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      Assert.assertEquals("http://localhost/SimplePassThru/oneStringArrayArg?x[0]=foo&x[1]=bar", RoninTemplate.urlFor(SimplePassThru#oneStringArrayArg({"foo", "bar"})))
    }
  }

  @Test
  function testConstructURLWithDateArrayArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      var date1 = new Date()
      var date2 = new Date()
      date2.setMonth(2)
      Assert.assertEquals("http://localhost/SimplePassThru/oneDateArrayArg?x[0]=${URLEncoder.encode(date1 as String)}&x[1]=${URLEncoder.encode(date2 as String)}", RoninTemplate.urlFor(SimplePassThru#oneDateArrayArg({date1, date2})))
    }
  }
  
  @Test
  function testConstructURLWithMultipleArgs() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      var date = new Date()
      Assert.assertEquals("http://localhost/SimplePassThru/multipleArgs?a=foo&b=true&c=7&d=3.14&e=${URLEncoder.encode(date as String)}", RoninTemplate.urlFor(SimplePassThru#multipleArgs("foo", true, 7, 3.14 as float, date)))
    }
  }
  
  @Test
  function testConstructURLWithToIDableObjectArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      var x = new ParamObj() {:propA = "foo", :propB = true, :propC = 7}
      Assert.assertEquals("http://localhost/SimplePassThru/stringProperty?x=foo", RoninTemplate.urlFor(SimplePassThru#stringProperty(x)))
    }
  }

  @Test
  function testConstructURLWithToIDableObjectArrayArg() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      var x = new ParamObj() {:propA = "foo", :propB = true, :propC = 7}
      var y = new ParamObj() {:propA = "bar", :propB = false, :propC = 53}
      Assert.assertEquals("http://localhost/SimplePassThru/stringPropertyFromArrayIndexZero?x[0]=foo&x[1]=bar", RoninTemplate.urlFor(SimplePassThru#stringPropertyFromArrayIndexZero({x, y})))
    }
  }
  
  @Test
  function testFormTargetInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#multipleArgs(String, boolean, int, float, Date))) {
        Assert.assertEquals("http://localhost/SimplePassThru/multipleArgs", RoninTemplate.TargetURL)
      }
    }
  }

  @Test
  function testSimpleParamNameByTypeInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#multipleArgs(String, boolean, int, float, Date))) {
        Assert.assertEquals("a", RoninTemplate.n("foo"))
      }
    }
  }

  @Test
  function testSimpleParamNameByInstanceInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#multipleArgs(String, boolean, int, float, Date))) {
        Assert.assertEquals("a", RoninTemplate.n(String))
      }
    }
  }

  @Test
  function testObjectParamNameByTypeInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
        Assert.assertEquals("x", RoninTemplate.n(ParamObj))
      }
    }
  }

  @Test
  function testObjectParamNameByInstanceInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
        Assert.assertEquals("x", RoninTemplate.n(new ParamObj()))
      }
    }
  }

  @Test
  function testObjectPropertyParamNameByTypeInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
        Assert.assertEquals("x.propC", RoninTemplate.n(ParamObj#propC))
      }
    }
  }

  @Test
  function testObjectPropertyParamNameByInstanceInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
        Assert.assertEquals("x.propC", RoninTemplate.n(new ParamObj()#propC))
      }
    }
  }

  @Test
  function testObjectArrayParamNameByTypeInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#stringPropertyFromArrayIndexOne(ParamObj[]))) {
        Assert.assertEquals("x[5]", RoninTemplate.n(ParamObj, 5))
      }
    }
  }

  @Test
  function testObjectArrayParamNameByInstanceInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#stringPropertyFromArrayIndexOne(ParamObj[]))) {
        Assert.assertEquals("x[5]", RoninTemplate.n(new ParamObj(), 5))
      }
    }
  }

  @Test
  function testObjectArrayPropertyParamNameByTypeInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
        Assert.assertEquals("x.propF[5]", RoninTemplate.n(ParamObj#propF, 5))
      }
    }
  }

  @Test
  function testObjectArrayPropertyParamNameByInstanceInUsingBlock() {
    using(new RoninRequest("http://localhost/", null, null, GET, {}, null)) {
      using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
        Assert.assertEquals("x.propF[5]", RoninTemplate.n(new ParamObj()#propF, 5))
      }
    }
  }

}
