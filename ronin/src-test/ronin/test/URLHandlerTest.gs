package ronin.test

uses java.lang.*
uses java.util.*
uses gw.lang.reflect.IMethodInfo

uses org.junit.Assert
uses org.junit.Test
uses org.junit.Before
uses org.junit.After

uses ronin.*
uses ronin.config.*

class URLHandlerTest {

  @Before
  function initURLHandler() {
    (RoninTest.RawConfig as DefaultRoninConfig).URLHandler = new DefaultURLHandler() {
      override function getControllerMethod(request : String[]) : IMethodInfo {
        return super.getControllerMethod({request[0].substring(4), request[1].substring(4)})
      }
    }
  }

  @Test
  function testLoginSuccess() {
    var resp = RoninTest.get("/testSimplePassThru/testoneStringArg?x=Hello")
    Assert.assertEquals("Hello", resp.WriterBuffer.toString())
  }

  @After
  function clearURLHandler() {
    (RoninTest.RawConfig as DefaultRoninConfig).URLHandler = new DefaultURLHandler()
  }

}