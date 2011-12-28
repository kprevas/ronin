package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*
uses ronin.config.*
uses gw.lang.reflect.*

class URLHandlerTest {

  @BeforeClass
  static function initURLHandler() {
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

  @AfterClass
  static function clearURLHandler() {
    (RoninTest.RawConfig as DefaultRoninConfig).URLHandler = new DefaultURLHandler()
  }

}