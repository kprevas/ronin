package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*

class XSRFTest {

  var _token : String

  @Before
  function initXSRFToken() {
    using(RoninTest.request()) {
      _token = IRoninUtils.XSRFTokenValue
    }
  }

  @Test
  function testGETRequestAccepted() {
    var resp = RoninTest.handle("/SimplePassThru/noArgs", {}, null, null, GET, null, false)
    Assert.assertEquals("no arg view", resp.WriterBuffer.toString())
  }

  @Test(Exception, 0)
  function testPOSTWithNoTokenRejected() {
    var resp = RoninTest.handle("/SimplePassThru/noArgs", {}, null, null, POST, null, false)
  }

  @Test(Exception, 0)
  function testPOSTWithBadTokenRejected() {
    var resp = RoninTest.handle("/SimplePassThru/noArgs", {IRoninUtils.XSRFTokenName -> {"letmein"}}, null, null, POST, null, false)
  }

  function testPOSTWithCorrectTokenAccepted() {
    var resp = RoninTest.handle("/SimplePassThru/noArgs", {IRoninUtils.XSRFTokenName -> {_token}}, null, null, POST, null, false)
  }

  @AfterClass
  static function clearSession() {
    RoninTest.clearSession()
  }

}