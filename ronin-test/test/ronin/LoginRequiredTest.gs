package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*
uses ronin.config.*
uses controller.*

class LoginRequiredTest {

  @BeforeClass
  static function setupLoginRedirect() {
    (RoninTest.RawConfig as DefaultRoninConfig).LoginRedirect = LoginRequired#login()
  }

  @AfterClass
  static function clearLoginRedirect() {
    (RoninTest.RawConfig as DefaultRoninConfig).LoginRedirect = null
  }

  @Test
  function testNoAuthMethodOk() {
    var resp = RoninTest.get("LoginRequired/loginNotRequired")
    Assert.assertEquals("success", resp.WriterBuffer.toString())
  }

  @Test
  function testNoAuthClassOk() {
    var resp = RoninTest.get("/SimplePassThru/noArgs")
    Assert.assertEquals("no arg view", resp.WriterBuffer.toString())
  }

  @Test
  function testLoginRequiredMethodRedirects() {
    var resp = RoninTest.get("LoginRequired/loginIsRequired")
    RoninTest.assertRedirectTo(resp, LoginRequired#login())
    resp = RoninTest.get("LoginRequired/login")
    RoninTest.assertRedirectTo(resp, LoginRequired#loginIsRequired())
  }

}