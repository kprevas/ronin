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
    Assert.assertEquals("http://localhost/SimplePassThru/noArgs", RoninTemplate.urlFor(SimplePassThru#noArgs()))
  }

  @Test
  function testConstructBaseURLNoArgsMethod() {
    Assert.assertEquals("http://localhost/SimplePassThru/noArgs", RoninTemplate.postUrlFor(SimplePassThru#noArgs()))
  }

  @Test
  function testConstructBaseURLMethodWithArgs() {
    Assert.assertEquals("http://localhost/SimplePassThru/multipleArgs", RoninTemplate.postUrlFor(SimplePassThru#multipleArgs(String, boolean, int, float, Date)))
  }

  @Test
  function testConstructURLWithOneStringArg() {
    Assert.assertEquals("http://localhost/SimplePassThru/oneStringArg?x=foo", RoninTemplate.urlFor(SimplePassThru#oneStringArg("foo")))
  }

  @Test
  function testConstructURLWithOneBooleanArg() {
    Assert.assertEquals("http://localhost/SimplePassThru/oneBooleanArg?x=true", RoninTemplate.urlFor(SimplePassThru#oneBooleanArg(true)))
  }

  @Test
  function testConstructURLWithOneIntegerArg() {
    Assert.assertEquals("http://localhost/SimplePassThru/oneIntegerArg?x=7", RoninTemplate.urlFor(SimplePassThru#oneIntegerArg(7)))
  }

  @Test
  function testConstructURLWithOneFloatArg() {
    Assert.assertEquals("http://localhost/SimplePassThru/oneFloatArg?x=3.14", RoninTemplate.urlFor(SimplePassThru#oneFloatArg(3.14 as float)))
  }

  @Test
  function testConstructURLWithOneDateArg() {
    var date = new Date()
    Assert.assertEquals("http://localhost/SimplePassThru/oneDateArg?x=${URLEncoder.encode(date as String)}", RoninTemplate.urlFor(SimplePassThru#oneDateArg(date)))
  }

  @Test
  function testConstructURLWithStringArrayArg() {
    Assert.assertEquals("http://localhost/SimplePassThru/oneStringArrayArg?x[0]=foo&x[1]=bar", RoninTemplate.urlFor(SimplePassThru#oneStringArrayArg({"foo", "bar"})))
  }

  @Test
  function testConstructURLWithDateArrayArg() {
    var date1 = new Date()
    var date2 = new Date()
    date2.setMonth( 2 )
    Assert.assertEquals("http://localhost/SimplePassThru/oneDateArrayArg?x[0]=${URLEncoder.encode(date1 as String)}&x[1]=${URLEncoder.encode(date2 as String)}", RoninTemplate.urlFor(SimplePassThru#oneDateArrayArg({date1, date2})))
  }
  
  @Test
  function testConstructURLWithMultipleArgs() {
    var date = new Date()
    Assert.assertEquals("http://localhost/SimplePassThru/multipleArgs?a=foo&b=true&c=7&d=3.14&e=${URLEncoder.encode(date as String)}", RoninTemplate.urlFor(SimplePassThru#multipleArgs("foo", true, 7, 3.14 as float, date)))
  }
  
  @Test
  function testConstructURLWithToIDableObjectArg() {
    var x = new ParamObj() {:propA = "foo", :propB = true, :propC = 7}
    Assert.assertEquals("http://localhost/SimplePassThru/stringProperty?x=foo", RoninTemplate.urlFor(SimplePassThru#stringProperty(x)))
  }

  @Test
  function testConstructURLWithToIDableObjectArrayArg() {
    var x = new ParamObj() {:propA = "foo", :propB = true, :propC = 7}
    var y = new ParamObj() {:propA = "bar", :propB = false, :propC = 53}
    Assert.assertEquals("http://localhost/SimplePassThru/stringPropertyFromArrayIndexZero?x[0]=foo&x[1]=bar", RoninTemplate.urlFor(SimplePassThru#stringPropertyFromArrayIndexZero({x, y})))
  }
  
  @Test
  function testFormTargetInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#multipleArgs(String, boolean, int, float, Date))) {
      Assert.assertEquals("http://localhost/SimplePassThru/multipleArgs", RoninTemplate.TargetURL)
    }
  }

  @Test
  function testSimpleParamNameByTypeInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#multipleArgs(String, boolean, int, float, Date))) {
      Assert.assertEquals("a", RoninTemplate.n("foo"))
    }
  }

  @Test
  function testSimpleParamNameByInstanceInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#multipleArgs(String, boolean, int, float, Date))) {
      Assert.assertEquals("a", RoninTemplate.n(String))
    }
  }

  @Test
  function testObjectParamNameByTypeInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
      Assert.assertEquals("x", RoninTemplate.n(ParamObj))
    }
  }

  @Test
  function testObjectParamNameByInstanceInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
      Assert.assertEquals("x", RoninTemplate.n(new ParamObj()))
    }
  }

  @Test
  function testObjectPropertyParamNameByTypeInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
      Assert.assertEquals("x.propC", RoninTemplate.n(ParamObj#propC))
    }
  }

  @Test
  function testObjectPropertyParamNameByInstanceInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
      Assert.assertEquals("x.propC", RoninTemplate.n(new ParamObj()#propC))
    }
  }

  @Test
  function testObjectArrayParamNameByTypeInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#stringPropertyFromArrayIndexOne(ParamObj[]))) {
      Assert.assertEquals("x[5]", RoninTemplate.n(ParamObj, 5))
    }
  }

  @Test
  function testObjectArrayParamNameByInstanceInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#stringPropertyFromArrayIndexOne(ParamObj[]))) {
      Assert.assertEquals("x[5]", RoninTemplate.n(new ParamObj(), 5))
    }
  }

  @Test
  function testObjectArrayPropertyParamNameByTypeInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
      Assert.assertEquals("x.propF[5]", RoninTemplate.n(ParamObj#propF, 5))
    }
  }

  @Test
  function testObjectArrayPropertyParamNameByInstanceInUsingBlock() {
    using(RoninTemplate.target(SimplePassThru#stringProperty(ParamObj))) {
      Assert.assertEquals("x.propF[5]", RoninTemplate.n(new ParamObj()#propF, 5))
    }
  }

}
