package ronin.test

uses org.junit.Assert
uses org.junit.Test
uses org.junit.BeforeClass
uses org.junit.AfterClass

uses ronin.*
uses ronin.test.*
uses ronin.config.*

uses controller.LoginRequired

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
    RoninTest.get("LoginRequired/loginNotRequired")
  }

  @Test
  function testLoginRequiredMethodRedirects() {
    var resp = RoninTest.get("LoginRequired/loginIsRequired")
    RoninTest.assertRedirectTo(resp, LoginRequired#login())
    resp = RoninTest.get("LoginRequired/login")
    Assert.assertEquals("http://localhost/LoginRequired/loginIsRequired", resp.WriterBuffer.toString())
  }

}