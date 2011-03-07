package ronin.test

uses org.junit.Test

class RedirectTest {

  @Test
  function testRedirect() {
    var resp = RoninTest.get("/Redirect/doRedirect")
    RoninTest.assertRedirect(resp)
    RoninTest.assertRedirectTo(resp, "/SimplePassThru/noArgs")
  }

}