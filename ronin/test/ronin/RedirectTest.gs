package ronin

uses java.lang.*
uses org.junit.*
uses ronin.*
uses ronin.test.*

class RedirectTest {

  @Test
  function testRedirect() {
    var resp = RoninTest.get("/Redirect/doRedirect")
    RoninTest.assertRedirect(resp)
    RoninTest.assertRedirectTo(resp, "/SimplePassThru/noArgs")
  }

}